import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"

import { Pressable, TextInput, TextStyle, View, ViewStyle } from "react-native"
import { Text } from "app/components"
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetSectionList,
  SCREEN_WIDTH,
} from "@gorhom/bottom-sheet"
import Fuse from "fuse.js"
import groupBy from "lodash/groupBy"
import { typography } from "app/theme"
import { ITasbeeh } from "app/models/TasbeehStore"

const TasbeehSelector = React.memo(
  ({
    list,
    count,
    sheetRef,
    setGoal,
    setCount,
    handleItemClick,
  }: {
    list: ITasbeeh[]
    sheetRef: React.RefObject<BottomSheet>
    setGoal: (goal: number) => void
    count: number
    setCount: (count: number) => void
    handleItemClick: (item: ITasbeeh) => void
  }) => {
    const snapPoints = useMemo(() => ["50%", "100%"], [])
    const [search, setSearch] = useState("")

    const $searchRef = useRef<TextInput>(null)
    const fuse = useMemo(
      () =>
        new Fuse(list, {
          keys: ["name", "tags"],
          threshold: 0.2,
        }),
      [list],
    )

    // // Expand the bottom sheet when the component mounts
    useEffect(() => {
      sheetRef.current?.expand()
    }, [sheetRef])

    // Alert handler to confirm resetting the counter
    const createTwoButtonAlert = useCallback(
      (item: any) => {
        $searchRef.current?.blur()
        handleItemClick(item)
      },
      [count, setGoal, setCount, sheetRef, handleItemClick],
    )

    const handleClick = useCallback(
      (item: any) => {
        createTwoButtonAlert(item)
      },
      [createTwoButtonAlert],
    )

    // Search and group the tasbeeh items based on their type
    const results = useMemo(() => {
      return search.length > 0 ? fuse.search(search).map((res) => res.item) : list
    }, [search, fuse, list])

    const groupedItems = useMemo(() => groupBy(results, "type"), [results])
    const sortedKeys = useMemo(() => ["DEENI", "MISC", "OTHER"], [])
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

    return (
      <BottomSheet
        backdropComponent={(backdropProps) => (
          <BottomSheetBackdrop {...backdropProps} enableTouchThrough opacity={0.5} />
        )}
        onClose={() => {
          sheetRef.current?.close()
          $searchRef.current?.blur()
          setSearch("")
        }}
        handleStyle={$handleIndicatorStyle}
        ref={sheetRef}
        enablePanDownToClose
        index={-1}
        snapPoints={snapPoints}
      >
        <BottomSheetSectionList
          style={$sectionListContentContainer}
          showsVerticalScrollIndicator={false}
          stickySectionHeadersEnabled
          sections={[
            {
              name: "search",
              data: [
                <TextInput
                  ref={$searchRef}
                  value={search}
                  style={$searchField}
                  key="search"
                  placeholder="Search"
                  onChangeText={setSearch}
                />,
              ],
            },
            ...keys.map((key) => ({
              name: key,
              data: [
                <View style={$sectionListContainer} key={key}>
                  <Text weight="bold" style={$sectionListTitle}>
                    {key}
                  </Text>
                  <View style={[$gridContainer, key === "OTHER" && $gridSingle]}>
                    {groupedItems[key].sort(sortKeys(key)).map((tasbeehItem: any) => {
                      return (
                        <Pressable
                          key={tasbeehItem.id}
                          style={[$gridItem, $tasbeehItem, key === "OTHER" && $gridSingleItem]}
                          onPress={() => handleClick(tasbeehItem)}
                        >
                          <Text numberOfLines={2} style={$itemName}>
                            {tasbeehItem?.name}
                          </Text>
                        </Pressable>
                      )
                    })}
                  </View>
                </View>,
              ],
            })),
          ]}
          renderItem={({ item }) => item}
        />
      </BottomSheet>
    )
  },
  (prevProps, nextProps) => {
    return prevProps.list.length === nextProps.list.length
  },
)

TasbeehSelector.displayName = "TasbeehSelector"

const $gridSingle: ViewStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 20,
}

const $gridSingleItem: ViewStyle = {
  width: SCREEN_WIDTH - 40,
  height: 100,
}

const $searchField = {
  backgroundColor: "rgb(255, 250, 241)",
  paddingHorizontal: 20,
  paddingVertical: 16,
  borderRadius: 12,
  marginBottom: 20,
  borderWidth: 1,
  marginHorizontal: 20,
  marginTop: 20,
  fontFamily: typography.primary.medium,
  borderColor: "rgb(240, 195, 116)",
  fontSize: 16,
  shadowColor: "rgba(0, 0, 0, 0.1)",
  shadowOffset: {
    width: 0,
    height: 2,
  },
  shadowOpacity: 0.5,
  shadowRadius: 3.84,
  elevation: 5,
}

const $sectionListContainer: ViewStyle = {
  backgroundColor: "rgb(254, 244, 227)",
  paddingHorizontal: 20,
  paddingBottom: 40,
}

const $sectionListTitle: TextStyle = {
  fontSize: 18,
  marginBottom: 20,
  marginTop: 20,
  textAlign: "center",
  color: "rgb(97, 79, 48)",
}

const $sectionListContentContainer: ViewStyle = {
  backgroundColor: "rgb(254, 244, 227)",
}

const $gridContainer: ViewStyle = {
  display: "flex",
  flexDirection: "row",
  flexWrap: "wrap",
  justifyContent: "space-between",
  backgroundColor: "rgb(254, 244, 227)",
  gap: 20,
  flex: 1,
}

const $gridItem: ViewStyle = {
  width: SCREEN_WIDTH / 2 - 30,
  height: 40,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
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

export const $handleIndicatorStyle: ViewStyle = {
  backgroundColor: "rgb(254, 244, 227)",
}

const $tasbeehItem: ViewStyle = {
  borderWidth: 1,
  borderColor: "rgb(240, 195, 116)",
  backgroundColor: "rgb(255, 252, 244)",
  borderRadius: 10,
  paddingHorizontal: 20,
  paddingVertical: 10,
  display: "flex",
  flexDirection: "row",
  justifyContent: "center",
  alignItems: "center",
  maxHeight: 60,
  minHeight: 60,
  shadowColor: "rgba(0, 0, 0, 0.1)",
  shadowOffset: {
    width: 0,
    height: 2,
  },
  shadowOpacity: 0.25,
  shadowRadius: 3.84,
  elevation: 5,
}

export default TasbeehSelector
