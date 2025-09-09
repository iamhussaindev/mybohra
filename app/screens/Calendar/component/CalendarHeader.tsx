

import { BackButton } from "app/appComponents/BackButton"
import { Button, Icon, Text } from "app/components"
import { Calendar } from "app/libs/Calendar"
import { colors } from "app/theme"
import React from "react"
import { ImageStyle, TextStyle, View, ViewStyle } from "react-native"

export default function CalendarHeader({
  setCalendar,
  calendar,
  setSelectedDate,
}: {
  calendar: Calendar
  setCalendar: any
  setSelectedDate: any
}) {
  const handleToday = () => {
    setCalendar(new Calendar({ miqaats: calendar.miqaats }))
    setSelectedDate(calendar.getToday)
  }

  return (
    <View style={$calendarHeader}>
      <View style={$headerRight}>
        <BackButton style={$headerButton} />
      </View>
      <View style={$calendarMonth}>
        <Text style={$calendarMonthHijri} size="md" weight="bold"></Text>
      </View>
      <View style={$headerLeft}>
        <Button style={[$calendarRightButton, $headerButton]} onPress={handleToday}>
          <Text weight="bold" style={$calendarTodayButton}>
            Today
          </Text>
        </Button>
        <Button style={[$headerButton, $settingIcon]} onPress={handleToday}>
          <Icon style={$headerLeftIcon} icon="settings" size={20} />
        </Button>
      </View>
    </View>
  )
}

const $calendarTodayButton: TextStyle = {
  color: colors.palette.primary500,
}

const $headerRight: ViewStyle = {
  display: "flex",
  flexDirection: "row",
  justifyContent: "space-between",
  width: 100,
}

const $settingIcon: ViewStyle = {
  paddingLeft: 10,
}

const $headerLeftIcon: ImageStyle = {
  position: "relative",
  top: 2,
}

const $headerLeft: ViewStyle = {
  display: "flex",
  flexDirection: "row",
  justifyContent: "flex-end",
  alignItems: "center",
  width: 100,
}

const $calendarMonthHijri: TextStyle = {
  marginBottom: 0,
  color: colors.palette.neutral500,
}

const $headerButton: ViewStyle = {
  borderWidth: 0,
  alignItems: "center",
  justifyContent: "center",
  display: "flex",
}

const $calendarRightButton: ViewStyle = {
  borderRadius: 10,
  display: "flex",
  justifyContent: "flex-start",
  backgroundColor: colors.transparent,
}

const $calendarMonth: ViewStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
}

const $calendarHeader: ViewStyle = {
  justifyContent: "space-between",
  alignItems: "center",
  flexDirection: "row",
}
