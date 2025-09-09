

import { Icon, Text } from "app/components"
import HijriDate from "app/libs/HijriDate"
import { colors } from "app/theme"
import { momentTime } from "app/utils/currentTime"
import React, { useCallback, useEffect, useState } from "react"
import { TextStyle, View, ViewStyle } from "react-native"

export function CurrentTime() {
  const getCurrentTime = useCallback(() => {
    const date = momentTime()
    const hijriDate = new HijriDate()
    return {
      hijri: `${hijriDate.day} ${hijriDate.getShortMonthName()}`,
      gregorian: date.format("D MMM hh:mm A"),
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
      <Icon icon="calendar" size={12} color={colors.tint} />
      <Text weight="bold" style={[$textStyle, $hijriStyle]}>
        {currentTime.hijri}
      </Text>
      <Text weight="normal" style={$textStyle}>
        {" "}
        /{" "}
      </Text>
      <Text weight="bold" style={$textStyle}>
        {currentTime.gregorian}
      </Text>
    </View>
  )
}

const $viewContainer: ViewStyle = {
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  marginTop: -4,
}

const $textStyle: TextStyle = {
  fontSize: 13,
  fontWeight: "bold",
}

const $hijriStyle: TextStyle = {
  color: colors.tint,
  marginStart: 6,
}
