import { useNavigation, useFocusEffect } from "@react-navigation/native"
import { Icon, Screen, Text } from "app/components"
import Header from "app/components/Header"
import { useAnalytics } from "app/hooks/useAnalytics"
import { useSoundPlayer } from "app/hooks/useAudio"
import { useRealtimeMonitoring } from "app/hooks/useRealtimeMonitoring"
import { useStores } from "app/models"
import { ILibrary } from "app/models/LibraryStore"
import { AppStackScreenProps } from "app/navigators"
import { colors } from "app/theme"
import Fuse from "fuse.js"
import { observer } from "mobx-react-lite"
import React, { FC, useCallback, useMemo, useRef, useState, useEffect } from "react"
import {
  TextStyle,
  View,
  ViewStyle,
  Pressable,
  TextInput,
  Keyboard,
  Animated,
  SectionList,
} from "react-native"

import DailyDuas from "../Home/components/DailyDuas"
import SoundPlayerHome from "../Home/components/SoundPlayerHome"

interface DuaListScreenProps extends AppStackScreenProps<"DuaList"> {}

export const DuaListScreen: FC<DuaListScreenProps> = observer(function DuaListScreen(props) {
  const { libraryStore } = useStores()
  const { currentSound } = useSoundPlayer()
  const navigation = useNavigation()

  // Analytics and monitoring
  const { trackScreenView, trackSearchPerformed, trackPdfOpened } = useAnalytics({
    screenName: "DuaList",
    trackScreenView: true,
  })

  const { trackPageView, trackSearch, trackFeatureUsage } = useRealtimeMonitoring({
    screenName: "DuaList",
    trackPageViews: true,
    trackUserActivities: true,
  })
  const [search, setSearch] = useState("")
  const [showSearch, setShowSearch] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const $searchRef = useRef<TextInput>(null)

  // Animated values
  const searchOpacity = useRef(new Animated.Value(0)).current
  const searchTranslateY = useRef(new Animated.Value(-20)).current
  const searchScale = useRef(new Animated.Value(0.95)).current
  const iconScale = useRef(new Animated.Value(1)).current

  // Fetch library data on component mount
  useEffect(() => {
    libraryStore.fetchList()
  }, [])

  const list = libraryStore.allLibraryItems

  const fuse = useMemo(
    () =>
      new Fuse(list, {
        keys: ["name", "description", "album"],
        threshold: 0.2,
      }),
    [list],
  )

  // Search the library items
  const results = useMemo(() => {
    return search.length > 0 ? fuse.search(search).map((res) => res.item) : list
  }, [search, fuse, list])

  const animateSearchIn = useCallback(() => {
    Animated.parallel([
      Animated.timing(searchOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(searchTranslateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(searchScale, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start()
  }, [searchOpacity, searchTranslateY, searchScale])

  const animateSearchOut = useCallback(() => {
    Animated.parallel([
      Animated.timing(searchOpacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(searchTranslateY, {
        toValue: -20,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(searchScale, {
        toValue: 0.95,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowSearch(false)
    })
  }, [searchOpacity, searchTranslateY, searchScale])

  const closeSearch = useCallback(() => {
    animateSearchOut()
    setSearch("")
    Keyboard.dismiss()
  }, [animateSearchOut])

  const animateIconPress = useCallback(() => {
    Animated.sequence([
      Animated.timing(iconScale, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(iconScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start()
  }, [iconScale])

  const toggleSearch = useCallback(() => {
    animateIconPress()

    if (!showSearch) {
      setShowSearch(true)
      // Start animation and focus after a brief delay
      setTimeout(() => {
        animateSearchIn()
        setTimeout(() => {
          $searchRef.current?.focus()
        }, 150)
      }, 50)
    } else {
      // Clear search when hiding
      closeSearch()
    }
  }, [showSearch, closeSearch, animateSearchIn, animateIconPress])

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await libraryStore.fetchList()
    setRefreshing(false)
  }, [libraryStore])

  // Close search when item is selected
  const handleItemClick = useCallback(
    (item: ILibrary) => {
      closeSearch() // Close search when item is selected

      // Track item interaction
      trackFeatureUsage("dua_item_clicked", {
        item_name: item.name,
        has_pdf: !!item.pdf,
        has_audio: !!item.audio,
      })

      // Navigate to PDF screen if PDF is available
      if (item.pdf) {
        trackPdfOpened(item.name, "DuaListScreen")
        console.log("PDF for:", item.name)
      } else if (item.audio) {
        trackFeatureUsage("audio_clicked", { audio_name: item.name, source: "DuaListScreen" })
        console.log("Audio playback for:", item.name)
      } else {
        console.log("No PDF or audio for:", item.name)
      }
    },
    [navigation, closeSearch, trackPdfOpened, trackFeatureUsage],
  )

  // Close search when screen loses focus (back button, navigation)
  useFocusEffect(
    useCallback(() => {
      return () => {
        // Cleanup when screen loses focus
        closeSearch()
      }
    }, [closeSearch]),
  )

  // Close search when keyboard is dismissed
  useEffect(() => {
    const keyboardDidHideListener = Keyboard.addListener("keyboardDidHide", () => {
      if (showSearch && search.length === 0) {
        closeSearch()
      }
    })

    return () => {
      keyboardDidHideListener?.remove()
    }
  }, [showSearch, search, closeSearch])

  const renderLibraryItem = ({ item }: { item: ILibrary }) => (
    <Pressable style={$libraryItem} onPress={() => handleItemClick(item)}>
      <View style={$itemContent}>
        <View style={$itemHeader}>
          <Text weight="bold" style={$itemName} numberOfLines={2}>
            {item.name}
          </Text>
          {item.album && (
            <Text style={$itemAlbum} numberOfLines={1}>
              {item.album}
            </Text>
          )}
        </View>

        {item.description && (
          <Text style={$itemDescription} numberOfLines={2}>
            {item.description}
          </Text>
        )}

        <View style={$itemFooter}>
          <View style={$itemActions}>
            {item.pdf && (
              <View style={$actionBadge}>
                <Icon icon="view" size={14} color={colors.palette.primary500} />
                <Text style={$actionText}>PDF</Text>
              </View>
            )}
            {item.audio && (
              <View style={$actionBadge}>
                <Icon icon="play" size={14} color={colors.palette.primary500} />
                <Text style={$actionText}>Audio</Text>
              </View>
            )}
          </View>

          {item.metadata && (
            <View style={$metadataContainer}>
              {item.metadata.audioLength && (
                <Text style={$metadataText}>
                  {Math.floor(item.metadata.audioLength / 60)}:
                  {(item.metadata.audioLength % 60).toString().padStart(2, "0")}
                </Text>
              )}
              {item.metadata.pdfPageCount && (
                <Text style={$metadataText}>{item.metadata.pdfPageCount} pages</Text>
              )}
            </View>
          )}
        </View>
      </View>
    </Pressable>
  )

  const categories = ["Daily Duas", "Namaz", "Ramazan", "Hajj", "Eid", "Other"]

  return (
    <Screen
      preset="fixed"
      backgroundColor={colors.background}
      safeAreaEdges={["top"]}
      contentContainerStyle={$screenContainer}
    >
      <Header
        title="Dua Library"
        showBackButton
        rightActions={
          <Pressable onPress={toggleSearch}>
            <Animated.View style={{ transform: [{ scale: iconScale }] }}>
              <Icon icon="search" size={20} color={colors.palette.primary500} />
            </Animated.View>
          </Pressable>
        }
      />
      <SectionList
        ref={null}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={$listContainer}
        stickySectionHeadersEnabled={false}
        sections={[
          {
            name: "Current Sound",
            description: "Current Sound",
            data: [
              currentSound ? (
                <View style={$currentSoundContainer} key="current-sound">
                  <SoundPlayerHome navigation={props.navigation} key="current-sound" />
                </View>
              ) : null,
            ],
          },
          {
            name: "Daily Duas",
            description: "daily duas",
            data: [
              <DailyDuas
                title="Daily Duas & Bookmarks"
                navigation={props.navigation}
                items={libraryStore.homeData}
                currentSound={currentSound}
                key="bookmarks"
              />,
            ],
          },
        ]}
        renderItem={({ item }) => item}
      />
    </Screen>
  )
})

const $screenContainer: ViewStyle = {
  backgroundColor: colors.background,
  flex: 1,
}

const $currentSoundContainer: ViewStyle = {
  marginBottom: 20,
}

const $listContainer: ViewStyle = {
  paddingBottom: 40,
}

const $libraryItem: ViewStyle = {
  backgroundColor: "rgb(255, 252, 244)",
  marginHorizontal: 20,
  marginVertical: 8,
  borderRadius: 16,
  padding: 16,
  borderWidth: 1,
  borderColor: colors.palette.primary200,
  shadowColor: "rgba(0, 0, 0, 0.1)",
  shadowOffset: {
    width: 0,
    height: 2,
  },
  shadowOpacity: 0.25,
  shadowRadius: 3.84,
  elevation: 5,
}

const $itemContent: ViewStyle = {
  flex: 1,
}

const $itemHeader: ViewStyle = {
  marginBottom: 8,
}

const $itemName: TextStyle = {
  fontSize: 16,
  color: "rgb(97, 79, 48)",
  marginBottom: 4,
}

const $itemAlbum: TextStyle = {
  fontSize: 12,
  color: colors.palette.primary500,
  fontWeight: "500",
}

const $itemDescription: TextStyle = {
  fontSize: 14,
  color: "rgb(120, 100, 70)",
  lineHeight: 20,
  marginBottom: 12,
}

const $itemFooter: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
}

const $itemActions: ViewStyle = {
  flexDirection: "row",
  gap: 8,
}

const $actionBadge: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  backgroundColor: "rgb(254, 244, 227)",
  paddingHorizontal: 8,
  paddingVertical: 4,
  borderRadius: 12,
  gap: 4,
}

const $actionText: TextStyle = {
  fontSize: 12,
  color: colors.palette.primary500,
  fontWeight: "500",
}

const $metadataContainer: ViewStyle = {
  flexDirection: "row",
  gap: 8,
}

const $metadataText: TextStyle = {
  fontSize: 12,
  color: "rgb(120, 100, 70)",
}

const $emptyContainer: ViewStyle = {
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  paddingVertical: 60,
}

const $emptyText: TextStyle = {
  fontSize: 16,
  color: "rgb(120, 100, 70)",
  textAlign: "center",
}
