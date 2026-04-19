import { IconSearch } from "@tabler/icons-react-native"
import { Screen, Text } from "app/components"
import Header from "app/components/Header"
import HijriDate from "app/libs/HijriDate"
import { useStores } from "app/models"
import { IMiqaat } from "app/models/MiqaatStore"
import type { AppStackScreenProps } from "app/navigators"
import { MiqaatCard } from "app/screens/components/MiqaatList"
import { spacing, typography } from "app/theme"
import { useColors } from "app/theme/useColors"
import { observer } from "mobx-react-lite"
import React, { useEffect, useState, useCallback, useMemo, useRef } from "react"
import {
  ViewStyle,
  Pressable,
  TextStyle,
  View,
  ActivityIndicator,
  FlatList,
  RefreshControl,
  useWindowDimensions,
  ScrollView,
} from "react-native"
import { TabView, SceneMap, Route } from "react-native-tab-view"

type MiqaatsScreenProps = AppStackScreenProps<"Miqaats">

const MONTH_NAMES = [
  "Moharram",
  "Safar",
  "Rabi I",
  "Rabi II",
  "Jumada I",
  "Jumada II",
  "Rajab",
  "Shabaan",
  "Ramadaan",
  "Shawwal",
  "Zilqadah",
  "Zilhaj",
]

// Month content component
const MonthContent = observer(function MonthContent({
  month,
  navigation,
}: {
  month: number
  navigation: any
}) {
  const colors = useColors()
  const { miqaatStore } = useStores()
  const [miqaats, setMiqaats] = useState<IMiqaat[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  // Load miqaats for this month
  useEffect(() => {
    const loadMiqaats = async () => {
      setLoading(true)
      try {
        await miqaatStore.fetchMiqaats()
        const monthMiqaats = miqaatStore.miqaatsByMonth(month)
        // Sort by date, then by priority
        const sorted = monthMiqaats.sort((a, b) => {
          if (a.date !== b.date) {
            return a.date - b.date
          }
          return (a.priority ?? 0) - (b.priority ?? 0)
        })
        setMiqaats(sorted)
      } catch (error) {
        console.error("Error loading miqaats:", error)
        setMiqaats([])
      } finally {
        setLoading(false)
      }
    }
    loadMiqaats()
  }, [month, miqaatStore])

  // Handle pull to refresh
  const handleRefresh = useCallback(async () => {
    setRefreshing(true)
    try {
      await miqaatStore.fetchMiqaats()
      const monthMiqaats = miqaatStore.miqaatsByMonth(month)
      const sorted = monthMiqaats.sort((a, b) => {
        if (a.date !== b.date) {
          return a.date - b.date
        }
        return (a.priority ?? 0) - (b.priority ?? 0)
      })
      setMiqaats(sorted)
    } finally {
      setRefreshing(false)
    }
  }, [month, miqaatStore])

  const handleItemPress = useCallback(
    (item: IMiqaat) => {
      // Navigate to miqaat detail or calendar
      navigation.navigate("Calendar", {
        highlight: {
          year: new HijriDate().year,
          month: item.month,
          day: item.date,
        },
      })
    },
    [navigation],
  )

  if (loading) {
    return (
      <View style={$loadingContainer}>
        <ActivityIndicator size="large" color={colors.palette.primary500} />
      </View>
    )
  }

  return (
    <FlatList
      data={miqaats}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <Pressable onPress={() => handleItemPress(item)}>
          <MiqaatCard item={item} showDate={true} showDescription={false} />
        </Pressable>
      )}
      contentContainerStyle={$listContent}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          colors={[colors.palette.primary500]}
          tintColor={colors.palette.primary500}
        />
      }
      ListEmptyComponent={
        <View style={$emptyContainer}>
          <Text style={$emptyText(colors)}>No miqaats found for this month</Text>
        </View>
      }
    />
  )
})

export const MiqaatsScreen: React.FC<MiqaatsScreenProps> = observer(function MiqaatsScreen(props) {
  const { navigation } = props
  const colors = useColors()
  const layout = useWindowDimensions()
  const [index, setIndex] = useState(0)
  const scrollViewRef = useRef<ScrollView>(null)
  const tabLayouts = useRef<Map<number, { x: number; width: number }>>(new Map())

  // Set current month as default
  useEffect(() => {
    const hijriDate = new HijriDate()
    setIndex(hijriDate.month) // Convert to 0-based index
  }, [])

  // Create routes for each month
  const routes = useMemo<Route[]>(
    () =>
      MONTH_NAMES.map((name, idx) => ({
        key: `month-${idx}`,
        title: name,
      })),
    [],
  )

  // Create scene map for each month
  const renderScene = useMemo(
    () =>
      SceneMap(
        routes.reduce((acc, route, idx) => {
          const monthNumber = idx
          acc[route.key] = () => <MonthContent month={monthNumber} navigation={navigation} />
          return acc
        }, {} as Record<string, React.ComponentType<any>>),
      ),
    [routes, navigation],
  )

  // Scroll to selected tab
  const scrollToTab = useCallback(
    (tabIndex: number) => {
      const tabLayout = tabLayouts.current.get(tabIndex)
      if (tabLayout && scrollViewRef.current) {
        const screenWidth = layout.width
        const tabCenter = tabLayout.x + tabLayout.width / 2
        const scrollPosition = tabCenter - screenWidth / 2

        scrollViewRef.current.scrollTo({
          x: Math.max(0, scrollPosition),
          animated: true,
        })
      }
    },
    [layout.width],
  )

  // Scroll when index changes
  useEffect(() => {
    scrollToTab(index)
  }, [index, scrollToTab])

  // Custom tab bar
  const renderTabBar = useCallback(
    (props: any) => (
      <View style={$tabBarContainer(colors)}>
        <ScrollView
          ref={scrollViewRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={$tabBarContent}
          keyboardShouldPersistTaps="handled"
        >
          {props.navigationState.routes.map((route: Route, idx: number) => {
            const focused = idx === props.navigationState.index
            return (
              <Pressable
                key={route.key}
                style={[
                  $tabItem(colors, focused),
                  idx === props.navigationState.routes.length - 1 && { marginEnd: spacing.md },
                ]}
                onPress={() => props.jumpTo(route.key)}
                onLayout={(event) => {
                  const { x, width } = event.nativeEvent.layout
                  tabLayouts.current.set(idx, { x, width })
                  // Scroll to tab if it's the currently selected one
                  if (idx === props.navigationState.index) {
                    setTimeout(() => scrollToTab(idx), 100)
                  }
                }}
              >
                <Text style={$tabItemText(colors)}>{route.title}</Text>
              </Pressable>
            )
          })}
        </ScrollView>
      </View>
    ),
    [colors, scrollToTab],
  )

  return (
    <Screen
      preset="fixed"
      backgroundColor={colors.background}
      safeAreaEdges={["top"]}
      contentContainerStyle={$screenContainer(colors)}
    >
      <Header
        title="Miqaats"
        showBackButton
        rightActions={
          <Pressable
            onPress={() => navigation.navigate("MiqaatsSearch")}
            style={$searchButton}
            hitSlop={8}
          >
            <IconSearch color={colors.text} size={24} />
          </Pressable>
        }
      />
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width: layout.width }}
        renderTabBar={renderTabBar}
        swipeEnabled
      />
    </Screen>
  )
})

const $screenContainer = (colors: any): ViewStyle => ({
  flex: 1,
  backgroundColor: colors.background,
})

const $loadingContainer: ViewStyle = {
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
}

const $listContent: ViewStyle = {
  paddingVertical: spacing.sm,
  paddingBottom: spacing.xxl,
}

const $emptyContainer: ViewStyle = {
  paddingVertical: spacing.xxl,
  alignItems: "center",
}

const $emptyText = (colors: any): TextStyle => ({
  fontSize: 16,
  color: colors.palette.neutral500,
})

const $searchButton: ViewStyle = {
  padding: spacing.xs,
}

const $tabBarContainer = (_colors: any): ViewStyle => ({
  marginStart: spacing.md,
  gap: spacing.md,
})

const $tabBarContent: ViewStyle = {
  gap: spacing.xs,
  paddingBottom: spacing.xs,
}

const $tabItem = (colors: any, isSelected: boolean): ViewStyle => ({
  paddingHorizontal: spacing.sm,
  paddingVertical: spacing.xxxs,
  borderRadius: 100,
  borderWidth: 1,
  borderColor: colors.tabBorder,
  backgroundColor: isSelected ? colors.tabBackgroundActive : colors.tabBackground,
})

const $tabItemText = (colors: any): TextStyle => ({
  fontSize: 14,
  fontFamily: typography.primary.medium,
  color: colors.text,
})

export default MiqaatsScreen
