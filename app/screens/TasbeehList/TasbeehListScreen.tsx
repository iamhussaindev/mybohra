import { useNavigation, useFocusEffect } from "@react-navigation/native"
import { Icon, Screen, Text } from "app/components"
import Header from "app/components/Header"
import { shadowProps } from "app/helpers/shadow.helper"
import { useStores } from "app/models"
import { ITasbeeh } from "app/models/TasbeehStore"
import { AppStackScreenProps } from "app/navigators"
import { colors } from "app/theme"
import Fuse from "fuse.js"
import groupBy from "lodash/groupBy"
import { observer } from "mobx-react-lite"
import React, { FC, useCallback, useMemo, useRef, useState, useEffect } from "react"
import {
  TextStyle,
  View,
  ViewStyle,
  Pressable,
  TextInput,
  FlatList,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native"

interface TasbeehListScreenProps extends AppStackScreenProps<"TasbeehList"> {}

export const TasbeehListScreen: FC<TasbeehListScreenProps> = observer(function TasbeehListScreen() {
  const { tasbeehStore } = useStores()
  const navigation = useNavigation()
  const [search, setSearch] = useState("")
  const [showSearch, setShowSearch] = useState(false)
  const $searchRef = useRef<TextInput>(null)

  const list = tasbeehStore.list.filter((tasbeeh) => tasbeeh.type !== "MISC")
  console.log(tasbeehStore.list)

  const fuse = useMemo(
    () =>
      new Fuse(list, {
        keys: ["name", "tags"],
        threshold: 0.2,
      }),
    [list],
  )

  // Search and group the tasbeeh items based on their type
  const results = useMemo(() => {
    return search.length > 0 ? fuse.search(search).map((res) => res.item) : list
  }, [search, fuse, list])

  const groupedItems = useMemo(() => groupBy(results, "type"), [results])
  const sortedKeys = useMemo(() => ["DEENI", "OTHER"], [])
  const keys = useMemo(
    () => Object.keys(groupedItems).sort((a, b) => sortedKeys.indexOf(a) - sortedKeys.indexOf(b)),
    [groupedItems, sortedKeys],
  )

  // Sort function memoized based on key
  const sortKeys = useCallback((key: string) => {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    return key === "DEENI"
      ? (a: any, b: any) => days.indexOf(a?.name) - days.indexOf(b?.name)
      : (a: any, b: any) => a?.name?.localeCompare(b?.name)
  }, [])

  const closeSearch = useCallback(() => {
    setShowSearch(false)
    setSearch("")
    Keyboard.dismiss()
  }, [])

  const toggleSearch = useCallback(() => {
    if (!showSearch) {
      setShowSearch(true)
      setTimeout(() => {
        $searchRef.current?.focus()
      }, 50)
    } else {
      closeSearch()
    }
  }, [showSearch, closeSearch])

  // Close search when item is selected
  const handleItemClick = useCallback(
    (item: ITasbeeh) => {
      closeSearch() // Close search when item is selected

      // Set the selected tasbeeh in the store
      tasbeehStore.setSelectedTasbeeh(item.id)

      // wait for above process to complete
      setTimeout(() => {
        // Navigate to the Counter screen
        navigation.navigate("Counter" as never)
      }, 100)
    },
    [tasbeehStore, navigation, closeSearch],
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

  const renderSection = ({ item: key }: { item: string }) => (
    <View style={$sectionContainer}>
      <Text weight="bold" style={$sectionTitle}>
        {key}
      </Text>
      <View style={[$gridContainer, key === "OTHER" && $gridSingle]}>
        {groupedItems[key].sort(sortKeys(key)).map((tasbeehItem: any) => (
          <Pressable
            key={tasbeehItem.id}
            style={[$gridItem, $tasbeehItem, key === "OTHER" && $gridSingleItem]}
            onPress={() => handleItemClick(tasbeehItem)}
          >
            {key === "DEENI" ? (
              <View style={$arabicTextContainer}>
                <Text weight="bold" style={[$itemName, $itemTextDay]}>
                  {tasbeehItem?.name.slice(0, 3)}
                </Text>
                <Text numberOfLines={2} style={$itemName}>
                  {tasbeehItem?.arabicText}
                </Text>
              </View>
            ) : (
              <Text numberOfLines={2} style={$itemName}>
                {tasbeehItem?.name}
              </Text>
            )}
          </Pressable>
        ))}
      </View>
    </View>
  )

  const $itemTextDay: TextStyle = {
    fontSize: 18,
    textAlign: "center",
    lineHeight: 20,
    textAlignVertical: "center",
    textTransform: "uppercase",
    marginBottom: 5,
  }

  return (
    <Screen
      preset="fixed"
      backgroundColor="rgb(254, 244, 227)"
      safeAreaEdges={["top"]}
      contentContainerStyle={$screenContainer}
    >
      <Header
        title="Tasbeeh List"
        showBackButton
        rightActions={
          <Pressable onPress={toggleSearch}>
            <Icon icon="search" size={20} color={colors.palette.primary500} />
          </Pressable>
        }
      />
      <TouchableWithoutFeedback onPress={showSearch ? closeSearch : undefined}>
        <View style={$container}>
          {showSearch && (
            <TouchableWithoutFeedback
              onPress={() => {
                // no-op to keep search open
              }}
            >
              <View style={$searchContainer}>
                <TextInput
                  ref={$searchRef}
                  value={search}
                  style={$searchField}
                  placeholder="Search"
                  onChangeText={setSearch}
                />
                <View style={$searchFade} />
              </View>
            </TouchableWithoutFeedback>
          )}
          <FlatList
            data={keys}
            renderItem={renderSection}
            keyExtractor={(item) => item}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={$listContainer}
          />
        </View>
      </TouchableWithoutFeedback>
    </Screen>
  )
})

const $screenContainer: ViewStyle = {
  backgroundColor: "rgb(254, 244, 227)",
  flex: 1,
}

const $container: ViewStyle = {
  flex: 1,
}

const $searchContainer: ViewStyle = {
  position: "relative",
  zIndex: 1,
  backgroundColor: "rgb(254, 244, 227)",
  paddingTop: 20,
}

const $searchField: TextStyle = {
  paddingHorizontal: 20,
  paddingVertical: 12,
  marginBottom: 20,
  borderWidth: 1,
  marginHorizontal: 20,
  ...shadowProps,
  backgroundColor: "rgb(255, 250, 241)",
  borderColor: colors.palette.primary200,
  borderRadius: 10,
  fontSize: 16,
}

const $searchFade: ViewStyle = {
  position: "absolute",
  bottom: 0,
  left: 0,
  right: 0,
  height: 20,
}

const $listContainer: ViewStyle = {
  paddingBottom: 40,
}

const $sectionContainer: ViewStyle = {
  backgroundColor: "rgb(254, 244, 227)",
  paddingHorizontal: 20,
  paddingBottom: 40,
}

const $sectionTitle: TextStyle = {
  fontSize: 18,
  marginBottom: 20,
  marginTop: 20,
  textAlign: "center",
  color: "rgb(97, 79, 48)",
}

const $gridContainer: ViewStyle = {
  display: "flex",
  flexDirection: "row",
  flexWrap: "wrap",
  justifyContent: "space-between",
  backgroundColor: "rgb(254, 244, 227)",
  gap: 12,
  flex: 1,
}

const $gridSingle: ViewStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 20,
}

const $gridItem: ViewStyle = {
  width: "48%",
  height: 60,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}

const $gridSingleItem: ViewStyle = {
  width: "100%",
  height: 100,
}

const $itemName: TextStyle = {
  fontSize: 15,
  fontWeight: "bold",
  textAlign: "center",
  lineHeight: 20,
  textAlignVertical: "center",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
}

const $arabicTextContainer: ViewStyle = {
  width: "100%",
  height: "100%",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
}

const $tasbeehItem: ViewStyle = {
  borderWidth: 1,
  paddingHorizontal: 20,
  paddingVertical: 10,
  display: "flex",
  flexDirection: "row",
  justifyContent: "center",
  alignItems: "center",
  maxHeight: 80,
  minHeight: 80,
  ...shadowProps,
  backgroundColor: "rgb(255, 252, 244)",
  borderColor: colors.palette.primary100,
  borderRadius: 12,
}
