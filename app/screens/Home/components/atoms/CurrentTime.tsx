import React, { useCallback, useEffect, useState } from "react"
import { Icon, Text } from "app/components"
import HijriDate from "app/libs/HijriDate"
import { momentTime } from "app/utils/currentTime"
import { TextStyle, View, ViewStyle } from "react-native"
import { colors } from "app/theme"

export function CurrentTime() {
  const getCurrentTime = useCallback(() => {
    const date = momentTime()
    const hijriDate = new HijriDate()
    // return `${hijriDate.day} ${hijriDate.getShortMonthName()} / ${date.format("D MMMM")}`
    return {
      hijri: `${hijriDate.day} ${hijriDate.getShortMonthName()}`,
      gregorian: date.format("D MMMM hh:mm A"),
    }
  }, [])

  const [currentTime, setCurrentTime] = useState(() => getCurrentTime())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(getCurrentTime())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  return (
    <View style={$viewContainer}>
      <Icon icon="calendar" size={16} color={colors.tint} />
      <Text style={[$textStyle, $hijriStyle]}>{currentTime.hijri}</Text>
      <Text style={$textStyle}> / </Text>
      <Text style={$textStyle}>{currentTime.gregorian}</Text>
    </View>
  )
}

const $viewContainer: ViewStyle = {
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
}

const $textStyle: TextStyle = {
  fontSize: 16,
  fontWeight: "bold",
}

const $hijriStyle: TextStyle = {
  color: colors.tint,
  marginStart: 6,
}
