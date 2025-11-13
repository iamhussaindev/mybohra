import { Text } from "app/components"
import { shadowProps } from "app/helpers/shadow.helper"
import { CalendarDay } from "app/libs/Calendar"
import { colors, spacing, typography } from "app/theme"
import React, { useCallback, useEffect, useRef } from "react"
import {
  Animated,
  Dimensions,
  Easing,
  FlatList,
  Pressable,
  StyleSheet,
  TextStyle,
  View,
  ViewStyle,
} from "react-native"

const screenWidth = Dimensions.get("window").width

export function WeekView({
  week,
  selectedDate,
  setSelectedDate,
  highlight,
}: {
  week: CalendarDay[]
  selectedDate?: CalendarDay
  setSelectedDate: (date: CalendarDay) => void
  highlight?: { key: string; trigger: number } | null
}) {
  const showArabic = true

  const renderDay = useCallback(
    ({ item }: { item: CalendarDay; index: number }) => {
      const selected =
        selectedDate?.date.day === item.date.day && selectedDate.date?.month === item.date?.month
      const dateKey = `${item.date.year}-${item.date.month}-${item.date.day}`
      const highlightTrigger =
        highlight && highlight.key === dateKey ? highlight.trigger : undefined

      return (
        <DayItem
          day={item}
          selected={selected}
          showArabic={showArabic}
          onPress={() => {
            if (!item.filler) setSelectedDate(item)
          }}
          highlightTrigger={highlightTrigger}
        />
      )
    },
    [highlight, selectedDate, setSelectedDate, showArabic],
  )

  return (
    <View style={$weekContainer}>
      <FlatList
        style={$dayList}
        data={week}
        renderItem={renderDay}
        getItemLayout={(_, index) => ({
          length: screenWidth / 7,
          offset: (screenWidth / 7) * index,
          index,
        })}
        horizontal
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item, index) =>
          `${item.date.year}-${item.date.month}-${item.date.day}-${
            item.filler ? "f" : "d"
          }-${index}`
        }
      />
    </View>
  )
}

function DayItem({
  day,
  selected,
  showArabic,
  onPress,
  highlightTrigger,
}: {
  day: CalendarDay
  selected: boolean
  showArabic: boolean
  onPress: () => void
  highlightTrigger?: number
}) {
  const highlightAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (highlightTrigger === undefined) return
    highlightAnim.stopAnimation()
    highlightAnim.setValue(0)
    Animated.sequence([
      Animated.timing(highlightAnim, {
        toValue: 0.85,
        duration: 220,
        easing: Easing.out(Easing.circle),
        useNativeDriver: true,
      }),
      Animated.timing(highlightAnim, {
        toValue: 0,
        duration: 600,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start()
  }, [highlightTrigger, highlightAnim])

  return (
    <Pressable
      onPress={onPress}
      disabled={day.filler}
      style={[$dayContainer, day.isToday && $dayToday]}
      android_ripple={{ color: colors.palette.accent100 }}
    >
      <View
        style={[
          $dayContainerInner,
          day.hasMiqaats && !day.filler && !selected && $dayContainerInnerMiqaat,
          selected && $dayContainerInnerSelected,
          day?.isToday && $dayContainerInnerToday,
        ]}
      >
        <Animated.View
          pointerEvents="none"
          style={[$dayHighlightOverlay, { opacity: highlightAnim }]}
        />
        <Text
          weight="medium"
          style={[
            $dayText,
            showArabic && $dayTextArabic,
            day.filler && $dayFiller,
            day.hasMiqaats && !day.filler && { color: colors.palette.primary500 },
            selected && $daySelectedText,
          ]}
        >
          {!showArabic ? day.date.day : day?.date.toArabic()}
        </Text>
      </View>
      <Text style={[$gregText, day?.isToday && $gregToday, selected && $gregSelected]}>
        {day?.gregorian.format("D MMM")}
      </Text>
    </Pressable>
  )
}

const $dayContainerInnerMiqaat: ViewStyle = {
  borderColor: colors.palette.primary500,
  borderWidth: 1,
  borderRadius: spacing.xxxl,
}

const dayHeight = screenWidth / 7 + 15

const $weekContainer: ViewStyle = {
  flexDirection: "row",
  paddingHorizontal: spacing.xs,
  backgroundColor: colors.palette.neutral100,
}

const $dayToday: ViewStyle = {}

const $daySelectedText: TextStyle = {
  color: colors.white,
}

const $gregSelected: TextStyle = {}

const $gregToday: TextStyle = {}

const $dayContainerInnerToday: TextStyle = {
  // transform: [{ scale: 1.15 }],
}

const $dayList: ViewStyle = {}

const $dayContainer: ViewStyle = {
  height: dayHeight,
  width: screenWidth / 7 - 2,
  justifyContent: "center",
  padding: 12,
  alignItems: "center",
  position: "relative",
}

const $dayContainerInner: ViewStyle = {
  position: "relative",
  borderRadius: spacing.xxxl,
  backgroundColor: colors.white,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  height: screenWidth / 7 - (16 + 4),
  width: screenWidth / 7 - (16 + 4),
  borderWidth: 2,
  borderColor: colors.palette.neutral200,
  ...shadowProps,
}

const $dayContainerInnerSelected: ViewStyle = {
  backgroundColor: colors.palette.primary500,
  borderColor: colors.palette.primary500,
}

const $dayText: TextStyle = {
  lineHeight: 30,
  fontSize: 20,
  textAlign: "center",
  width: "100%",
  fontWeight: "bold",
}

const $dayTextArabic: TextStyle = {
  fontFamily: typography.arabic.kanz,
  lineHeight: 50,
  fontSize: 32,
  width: "100%",
}

const $gregText: TextStyle = {
  fontSize: 12,
  marginTop: -2,
  color: colors.palette.neutral600,
  width: screenWidth / 7,
  textAlign: "center",
}

const $dayFiller: TextStyle = {
  color: colors.palette.neutral400,
}

const $dayHighlightOverlay: ViewStyle = {
  ...StyleSheet.absoluteFillObject,
  borderRadius: spacing.xxxl,
  backgroundColor: colors.palette.primary200,
}
