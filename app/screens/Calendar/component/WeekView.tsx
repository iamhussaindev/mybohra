

import { Text } from "app/components"
import { CalendarDay } from "app/libs/Calendar"
import { colors, typography } from "app/theme"
import React from "react"
import { Dimensions, FlatList, Pressable, TextStyle, View, ViewStyle } from "react-native"

const screenWidth = Dimensions.get("window").width

export function WeekView({
  week,
  selectedDate,
  setSelectedDate,
}: {
  week: CalendarDay[]
  selectedDate?: CalendarDay
  setSelectedDate: (date: CalendarDay) => void
}) {
  const showArabic = true

  return (
    <View style={$weekContainer}>
      <FlatList
        style={$dayList}
        data={week}
        renderItem={({ item, index }) => {
          const filler = item?.filler
          const selected =
            selectedDate?.date.day === item.date.day &&
            selectedDate.date?.month === item.date?.month &&
            !item.isToday
          return (
            <Pressable
              onPress={() => {
                if (!item.filler) setSelectedDate(item)
              }}
              key={index}
              style={[$dayContainer, item.isToday && $dayToday]}
            >
              {selected && !item.isToday ? <View style={[$highlight, $daySelected]} /> : null}

              <View style={$dayContainerInner}>
                <Text
                  weight="medium"
                  style={[
                    $dayText,
                    showArabic && $dayTextArabic,
                    filler && $dayFiller,
                    item?.isToday && $dayTodayText,
                    selected && $daySelectedText,
                    item.hasMiqaats && !filler && !selected && { color: colors.green },
                  ]}
                >
                  {!showArabic ? item.date.day : item?.date.toArabic()}
                </Text>
              </View>
              <Text
                weight="bold"
                style={[$gregText, item?.isToday && $gregToday, selected && $gregSelected]}
              >
                {item?.gregorian.format("D MMM")}
              </Text>

              {item.hasMiqaats && !filler ? <View style={$miqaatDot} /> : null}
            </Pressable>
          )
        }}
        getItemLayout={(_, index) => ({
          length: screenWidth / 7,
          offset: (screenWidth / 7) * index,
          index,
        })}
        horizontal
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
      />
    </View>
  )
}

const dayHeight = screenWidth / 7 + 15

const $weekContainer: ViewStyle = {
  flexDirection: "row",
  backgroundColor: colors.palette.neutral100,
}

const $miqaatDot: ViewStyle = {
  position: "absolute",
  bottom: 4,
  height: 5,
  width: 5,
  borderRadius: 4,
  backgroundColor: colors.yellow,
  shadowColor: colors.yellow,
  shadowOffset: { width: 0, height: 0 },
  shadowOpacity: 0.5,
  shadowRadius: 5,
}

const $highlight: ViewStyle = {
  borderRightWidth: 1,
  borderLeftWidth: 1,
  borderTopWidth: 1,
  borderBottomWidth: 1,
  borderRadius: 2,
  position: "absolute",
  height: dayHeight,
  width: screenWidth / 7,
}

const $daySelected: ViewStyle = {
  borderLeftColor: colors.yellow,
  borderRightColor: colors.yellow,
  borderTopColor: colors.yellow,
  borderBottomColor: colors.yellow,
  backgroundColor: `rgba(240, 147, 43, 0.1)`,
}

const $dayToday: ViewStyle = {
  borderRightWidth: 1,
  borderLeftWidth: 1,
  borderTopWidth: 1,
  borderBottomWidth: 1,
  borderLeftColor: colors.palette.primary500,
  borderRightColor: colors.palette.primary500,
  borderTopColor: colors.palette.primary500,
  borderBottomColor: colors.palette.primary500,
  backgroundColor: `rgba(201, 24, 74, 0.1)`,
}

const $daySelectedText: TextStyle = {
  color: colors.yellow,
}

const $gregSelected: TextStyle = {
  color: colors.yellow,
}

const $gregToday: TextStyle = {
  color: colors.palette.primary500,
}

const $dayTodayText: TextStyle = {
  color: colors.palette.primary500,
}

const $dayList: ViewStyle = {}

const $dayContainer: ViewStyle = {
  height: dayHeight,
  width: screenWidth / 7,
  justifyContent: "center",
  alignItems: "center",
  padding: 16,
  borderRightColor: colors.border,
  borderRightWidth: 1,
  borderBottomColor: colors.border,
  borderBottomWidth: 1,
  position: "relative",
}

const $dayContainerInner: ViewStyle = {
  position: "relative",
}

const $dayText: TextStyle = {
  lineHeight: 30,
  fontSize: 20,
  width: "100%",
  fontWeight: "bold",
}

const $dayTextArabic: TextStyle = {
  fontFamily: typography.arabic.kanz,
  lineHeight: 60,
  fontSize: 42,
  width: "100%",
}

const $gregText: TextStyle = {
  fontSize: 10,
  marginTop: -8,
  color: colors.palette.neutral500,
  width: screenWidth / 7,
  textAlign: "center",
}

const $dayFiller: TextStyle = {
  color: colors.palette.neutral400,
}
