import { IconChevronLeft } from "@tabler/icons-react-native"
import { Screen, Text } from "app/components"
import { shadowProps } from "app/helpers/shadow.helper"
import HijriDate from "app/libs/HijriDate"
import { IMiqaat, useStores } from "app/models"
import { AppStackScreenProps } from "app/navigators"
import { colors, spacing, typography } from "app/theme"
import Fuse from "fuse.js"
import { observer } from "mobx-react-lite"
import React, { useEffect, useMemo, useRef, useState } from "react"
import {
  FlatList,
  Image,
  ImageStyle,
  Pressable,
  TextInput,
  TextStyle,
  View,
  ViewStyle,
} from "react-native"

type CalendarSearchProps = AppStackScreenProps<"CalendarSearch">

export const CalendarSearch: React.FC<CalendarSearchProps> = observer(function CalendarSearch(
  props,
) {
  const { navigation } = props
  const { miqaatStore } = useStores()
  const [query, setQuery] = useState("")

  const inputRef = useRef<TextInput>(null)

  useEffect(() => {
    if (miqaatStore.list.length === 0) {
      miqaatStore.fetchMiqaats()
    }
  }, [miqaatStore])

  useEffect(() => {
    const timeout = setTimeout(() => {
      inputRef.current?.focus()
    }, 500)

    return () => clearTimeout(timeout)
  }, [])

  const miqaats = miqaatStore.miqaats

  const fuse = useMemo(() => {
    if (miqaats.length === 0) return null
    return new Fuse(miqaats.slice(), {
      keys: ["name", "description", "location"],
      threshold: 0.3,
      ignoreLocation: true,
    })
  }, [miqaats])

  const today = useMemo(() => new HijriDate(), [])

  const getHijriCoordinates = (miqaat: IMiqaat) => {
    const isNightPhase = miqaat.phase === "night" || miqaat.isNight
    const month = isNightPhase && miqaat.monthNight != null ? miqaat.monthNight : miqaat.month
    const day = isNightPhase && miqaat.dateNight != null ? miqaat.dateNight : miqaat.date
    return { month, day }
  }

  const compareHijriDates = (a: HijriDate, b: HijriDate) => {
    if (a.year !== b.year) return a.year - b.year
    if (a.month !== b.month) return a.month - b.month
    return a.day - b.day
  }

  const sortByUpcoming = (items: IMiqaat[]) => {
    return items
      .map((miqaat) => {
        const { month, day } = getHijriCoordinates(miqaat)
        let targetYear = today.year
        let occurrence = new HijriDate(targetYear, month, day)

        if (compareHijriDates(occurrence, today) < 0) {
          targetYear += 1
          occurrence = new HijriDate(targetYear, month, day)
        }

        return {
          item: miqaat,
          year: targetYear,
          occurrence,
        }
      })
      .sort((a, b) => compareHijriDates(a.occurrence, b.occurrence))
  }

  const defaultResults = useMemo(() => sortByUpcoming(miqaats), [miqaats])

  const searchResults = useMemo(() => {
    if (!query.trim()) {
      return defaultResults
    }

    if (!fuse) return []

    const results = fuse.search(query.trim())
    return sortByUpcoming(results.map((result) => result.item))
  }, [query, defaultResults, fuse])

  const handleSelect = (miqaatEntry: { item: IMiqaat; year: number; occurrence: HijriDate }) => {
    const { item, year } = miqaatEntry
    navigation.navigate("Calendar", {
      highlight: {
        year,
        month: item.month,
        day: item.date,
      },
    })
  }

  const renderItem = ({
    item,
  }: {
    item: {
      item: IMiqaat
      year: number
      occurrence: HijriDate
    }
  }) => {
    const { item: miqaat, occurrence, year } = item
    const hijriMonth = occurrence.getMonthName()
    const dateLabel = `${miqaat.date} ${hijriMonth} ${year}`

    return (
      <Pressable style={$resultItem} onPress={() => handleSelect(item)}>
        <View style={$resultContent}>
          <Image
            source={
              miqaat.image
                ? { uri: miqaat.image }
                : require("../../../assets/images/event_icon.png")
            }
            style={$resultImage}
            resizeMode="cover"
          />
          <View style={$resultTextContainer}>
            <Text weight="medium" style={$resultTitle}>
              {miqaat.name}
            </Text>
            <Text size="xxs" style={$resultDate}>
              {dateLabel}
            </Text>
          </View>
        </View>
      </Pressable>
    )
  }

  return (
    <Screen
      preset="fixed"
      safeAreaEdges={["top"]}
      backgroundColor={colors.palette.neutral100}
      contentContainerStyle={$screenContainer}
    >
      <View style={$searchContainer}>
        <Pressable onPress={() => navigation.goBack()} style={$searchIconButton} hitSlop={8}>
          <IconChevronLeft color={colors.palette.primary500} />
        </Pressable>
        <TextInput
          ref={inputRef}
          placeholder="Search miqaats"
          placeholderTextColor={colors.palette.neutral400}
          value={query}
          onChangeText={setQuery}
          style={$searchInput}
          autoCorrect={false}
          autoCapitalize="none"
          clearButtonMode="while-editing"
        />
      </View>

      <FlatList
        data={searchResults}
        keyExtractor={(item) => `${item.item.id}-${item.year}`}
        renderItem={renderItem}
        contentContainerStyle={$listContent}
        keyboardShouldPersistTaps="handled"
      />
    </Screen>
  )
})

const $screenContainer: ViewStyle = {
  flex: 1,
  backgroundColor: colors.palette.neutral100,
}

const $searchContainer: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  marginBottom: spacing.md,
  marginHorizontal: spacing.md,
  backgroundColor: colors.palette.neutral100,
  ...shadowProps,
  height: 50,
  marginTop: spacing.md,
  borderRadius: spacing.sm,
}

const $searchIconButton: ViewStyle = {
  padding: spacing.xs,
}

const $searchInput: TextStyle = {
  flex: 1,
  fontSize: 16,
  fontFamily: typography.primary.medium,
  color: colors.palette.neutral900,
  paddingHorizontal: spacing.xs,
  paddingVertical: spacing.xs,
}

const $listContent: ViewStyle = {
  paddingHorizontal: spacing.xxs,
  paddingBottom: spacing.xxl,
}

const $resultItem: ViewStyle = {
  backgroundColor: colors.white,
  paddingVertical: spacing.md,
  paddingHorizontal: spacing.md,
  borderBottomWidth: 1,
  borderBottomColor: colors.palette.neutral200,
}

const $resultContent: ViewStyle = {
  alignItems: "center",
  flexDirection: "row",
}

const $resultImage: ImageStyle = {
  height: 42,
  width: 42,
  borderRadius: spacing.lg,
  backgroundColor: colors.palette.primary100,
}

const $resultTextContainer: ViewStyle = {
  flex: 1,
  marginLeft: spacing.sm,
}

const $resultTitle: TextStyle = {
  fontSize: 16,
  color: colors.palette.neutral900,
}

const $resultDate: TextStyle = {
  color: colors.palette.neutral500,
  marginTop: spacing.xxxs,
}

export default CalendarSearch
