import React from "react"
import { Button, Icon, Text } from "app/components"
import { colors, spacing } from "app/theme"
import { ImageStyle, TextStyle, View, ViewStyle } from "react-native"
import { BackButton } from "app/appComponents/BackButton"
import { Moment } from "moment"
import { momentTime } from "app/utils/currentTime"

export default function NamazScreenHeader({
  title,
  date,
  setDate,
  location,
}: {
  title: string
  date: Moment
  setDate: (date: Moment) => void
  location: string
}) {
  const handlePrevious = () => {
    setDate(date.clone().subtract(1, "day"))
  }

  const handleNext = () => {
    setDate(date.clone().add(1, "day"))
  }

  const handleToday = () => {
    setDate(momentTime())
  }

  return (
    <View>
      <View style={$headerContainer}>
        <View style={$headerRight}>
          <BackButton />
        </View>
        <View style={$header}>
          <Text style={$title} weight="normal">
            {title}
          </Text>
        </View>
        <View style={$headerLeft}>
          <Button style={[$calendarRightButton, $headerButton]} onPress={handleToday}>
            <Text weight="bold" style={$calendarTodayButton}>
              Today
            </Text>
          </Button>
        </View>
      </View>
      <View style={$headerControl}>
        <Button onPress={handlePrevious} style={$headerControlButton}>
          <Icon style={$iconStyle} size={24} color={colors.palette.primary500} icon="arrowLeft" />
        </Button>
        <View style={$headerCenter}>
          <Text weight="bold" style={$headerText}>
            {date.format("ddd, D MMM YYYY")}
          </Text>
          <Text weight="bold" style={$headerSubText}>
            {location}
          </Text>
        </View>
        <Button onPress={handleNext} style={$headerControlButton}>
          <Icon style={$iconStyle} size={24} color={colors.palette.primary500} icon="arrowRight" />
        </Button>
      </View>
    </View>
  )
}

const $calendarTodayButton: TextStyle = {
  color: colors.palette.primary500,
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

const $headerControlButton: ViewStyle = {
  maxHeight: 30,
  height: 30,
  minHeight: 30,
  width: "30%",
  borderColor: colors.transparent,
  borderRadius: 20,
}

const $headerControl: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-between",
  width: "100%",
  paddingVertical: 15,
  paddingHorizontal: spacing.xs,
  alignItems: "center",
  backgroundColor: colors.palette.neutral100,
}

const $iconStyle: ImageStyle = {
  height: 20,
  width: 20,
  position: "relative",
  top: -5,
}

const $headerText: TextStyle = {
  fontSize: 18,
}

const $headerCenter: ViewStyle = {
  flex: 1,
  alignItems: "center",
}

const $headerSubText: TextStyle = {
  fontSize: 14,
  color: colors.palette.neutral700,
}

const $headerRight: ViewStyle = {
  display: "flex",
  flexDirection: "row",
  justifyContent: "space-between",
  width: 100,
}

const $headerLeft: ViewStyle = {
  display: "flex",
  flexDirection: "row",
  justifyContent: "flex-end",
  width: 100,
}

const $title: TextStyle = {
  marginBottom: 0,
  fontSize: 16,
}

const $header: ViewStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
}

const $headerContainer: ViewStyle = {
  justifyContent: "space-between",
  alignItems: "center",
  flexDirection: "row",
  borderBottomColor: colors.palette.neutral200,
  borderBottomWidth: 1,
}
