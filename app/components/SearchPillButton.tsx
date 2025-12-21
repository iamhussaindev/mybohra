import { SCREEN_WIDTH } from "@gorhom/bottom-sheet"
import { colors, spacing } from "app/theme"
import { useColors } from "app/theme/useColors"
import { BlurView } from "expo-blur"
import React from "react"
import { Pressable, TextStyle, View, ViewStyle } from "react-native"

import { Icon } from "./Icon"
import { Text } from "./Text"

interface SearchPillButtonProps {
  onPress?: () => void
}

export function SearchPillButton({ onPress }: SearchPillButtonProps) {
  const colors = useColors()

  const handlePress = () => {
    onPress?.()
  }

  return (
    <Pressable style={$searchButtonPressable()} hitSlop={8} onPress={handlePress}>
      <BlurView intensity={50} tint="prominent" style={$searchButton()}>
        <View style={$searchButtonContent}>
          <Icon icon="search" size={14} color={colors.palette.neutral500} />
          <Text text="Search" style={$searchButtonText} color={colors.palette.neutral500} />
        </View>
      </BlurView>
    </Pressable>
  )
}

const $searchButtonPressable = (): ViewStyle => ({
  position: "absolute",
  bottom: 50,
  right: SCREEN_WIDTH / 2 - 50,
})

const $searchButtonContent: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  gap: spacing.xs,
  justifyContent: "center",
  borderRadius: spacing.sm,
}

const $searchButtonText: TextStyle = {
  fontSize: 14,
  fontWeight: "bold",
  lineHeight: 16,
}

const $searchButton = (): ViewStyle => ({
  width: 100,
  height: 32,
  borderRadius: 100,
  overflow: "hidden",
  borderWidth: 1,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  borderColor: colors.palette.neutral600,
})
