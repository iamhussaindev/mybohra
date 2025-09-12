import { BottomSheetFlatList } from "@gorhom/bottom-sheet"
import { Text } from "app/components"
import { colors, spacing } from "app/theme"
import React from "react"
import { Pressable, TextStyle, ViewStyle } from "react-native"

const ReminderOffsetSelector = ({ setOffset }: { setOffset: (offset: number) => void }) => {
  const handleOffsetPress = (offset: number) => {
    setOffset(offset)
  }

  // Generate offset options: 1 hour 55 minutes down to 5 minutes in 5-minute intervals
  const generateOffsetOptions = () => {
    const options = []
    // Start from 115 minutes (1 hour 55 minutes) and go down to 5 minutes
    for (let minutes = 60; minutes >= 5; minutes -= 5) {
      options.push(minutes)
    }
    return options.reverse()
  }

  const offsetOptions = generateOffsetOptions()

  const formatOffsetLabel = (minutes: number) => {
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60)
      const remainingMinutes = minutes % 60
      if (remainingMinutes === 0) {
        return `${hours} hour${hours > 1 ? "s" : ""}`
      } else {
        return `${hours}h ${remainingMinutes}m`
      }
    } else {
      return `${minutes} minutes`
    }
  }

  return (
    <BottomSheetFlatList
      contentContainerStyle={$contentStyle}
      style={$contentStyle}
      data={offsetOptions}
      renderItem={({ item, index }) => {
        return (
          <Pressable onPress={() => handleOffsetPress(item)} style={$offsetItem} key={index}>
            <Text style={$offsetText}>{formatOffsetLabel(item)}</Text>
            <Text style={$offsetSubtext}>before prayer time</Text>
          </Pressable>
        )
      }}
      showsVerticalScrollIndicator={false}
    />
  )
}

const $contentStyle: ViewStyle = {
  backgroundColor: colors.background,
  paddingBottom: spacing.xl,
}

const $offsetItem: ViewStyle = {
  paddingVertical: spacing.md,
  paddingHorizontal: spacing.lg,
  borderBottomWidth: 0.5,
  borderBottomColor: colors.palette.neutral200,
  alignItems: "center",
  justifyContent: "space-between",
  flexDirection: "row",
}

const $offsetText: TextStyle = {
  fontSize: 18,
  fontWeight: "600",
  color: colors.text,
  marginBottom: spacing.xs,
}

const $offsetSubtext: TextStyle = {
  fontSize: 14,
  color: colors.palette.neutral600,
}

export default ReminderOffsetSelector
