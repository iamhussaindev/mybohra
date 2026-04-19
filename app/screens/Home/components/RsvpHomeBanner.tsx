import { IconChevronRight } from "@tabler/icons-react-native"
import { Text } from "app/components"
import { spacing } from "app/theme"
import { useColors } from "app/theme/useColors"
import React from "react"
import { Image, ImageStyle, Pressable, View, ViewStyle } from "react-native"

export type RsvpHomeBannerProps = {
  onPress: () => void
}

export function RsvpHomeBanner({ onPress }: RsvpHomeBannerProps) {
  const colors = useColors()

  return (
    <Pressable
      onPress={onPress}
      style={[$shell, { borderColor: colors.border, backgroundColor: colors.background }]}
      accessibilityRole="button"
      accessibilityLabel="RSVP and jaman"
    >
      <View style={$row}>
        <View style={[$iconWrap, { backgroundColor: colors.palette.neutral300 }]}>
          <Image
            source={require("../../../../assets/images/event_icon.png")}
            style={$icon}
            resizeMode="contain"
          />
        </View>
        <View style={$textCol}>
          <Text preset="subheading" weight="bold" color={colors.text} text="RSVP & Jaman" />
          <Text
            preset="formHelper"
            color={colors.textDim}
            text="Create a link so guests can confirm — save food and stress."
            numberOfLines={2}
          />
        </View>
        <IconChevronRight size={22} color={colors.textDim} style={$chevron} />
      </View>
    </Pressable>
  )
}

const $shell: ViewStyle = {
  marginHorizontal: spacing.lg,
  marginBottom: spacing.md,
  borderRadius: 16,
  borderWidth: 1,
  overflow: "hidden",
}

const $row: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  paddingVertical: spacing.md,
  paddingHorizontal: spacing.md,
  gap: spacing.sm,
}

const $iconWrap: ViewStyle = {
  width: 56,
  height: 56,
  borderRadius: 14,
  alignItems: "center",
  justifyContent: "center",
}

const $icon: ImageStyle = {
  width: 36,
  height: 36,
}

const $textCol: ViewStyle = {
  flex: 1,
  minWidth: 0,
}

const $chevron: ViewStyle = {
  marginLeft: spacing.xxs,
}
