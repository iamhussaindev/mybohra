import { useNavigation } from "@react-navigation/native"
import { BackButton } from "app/appComponents/BackButton"
import { Button, Icon, Text } from "app/components"
import { Calendar } from "app/libs/Calendar"
import { AppStackScreenProps } from "app/navigators"
import { colors } from "app/theme"
import React from "react"
import { Pressable, TextStyle, View, ViewStyle } from "react-native"

export default function CalendarHeader({
  setCalendar,
  calendar,
  setSelectedDate,
}: {
  calendar: Calendar
  setCalendar: any
  setSelectedDate: any
}) {
  const navigation = useNavigation<AppStackScreenProps<"Calendar">["navigation"]>()

  const handleToday = () => {
    setCalendar(new Calendar({ miqaats: calendar.miqaats }))
    setSelectedDate(calendar.getToday)
  }

  const handleOpenSearch = () => {
    navigation.navigate("CalendarSearch")
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
        <Pressable onPress={handleOpenSearch} style={$headerIconButton} hitSlop={8}>
          <Icon icon="search" size={20} color={colors.palette.neutral900} />
        </Pressable>
        <Button rounded={false} style={[$calendarRightButton, $headerButton]} onPress={handleToday}>
          <Text weight="bold" style={$calendarTodayButton}>
            Today
          </Text>
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
  alignItems: "center",
  justifyContent: "flex-start",
  gap: 12,
}

const $headerIconButton: ViewStyle = {
  padding: 8,
}

// const $settingIcon: ViewStyle = {
//   paddingLeft: 10,
// }

// const $headerLeftIcon: ImageStyle = {
//   position: "relative",
//   top: 2,
// }

const $headerLeft: ViewStyle = {
  display: "flex",
  flexDirection: "row",
  justifyContent: "flex-end",
  alignItems: "center",
  width: 100,
  backgroundColor: colors.transparent,
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
  backgroundColor: colors.transparent,
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
