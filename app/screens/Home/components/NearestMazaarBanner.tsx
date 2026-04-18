import { SBox, Text } from "app/components"
import { spacing } from "app/theme"
import { useColors } from "app/theme/useColors"
import React from "react"
import { Dimensions, Pressable, TextStyle, View, ViewStyle } from "react-native"

const screenWidth = Dimensions.get("window").width

export type NearestMazaarBannerProps = {
  name: string
  distanceKm: number
  subtitle?: string
  onPress: () => void
}

function distanceLabel(km: number): string {
  if (km < 1) return "Nearby — less than 1 km"
  const rounded = Math.round(km)
  return rounded <= 1 ? "About 1 km away" : `About ${rounded} km away`
}

export function NearestMazaarBanner({
  name,
  distanceKm,
  subtitle,
  onPress,
}: NearestMazaarBannerProps) {
  const colors = useColors()

  return (
    <Pressable onPress={onPress}>
      <SBox
        backgroundColor={colors.background}
        borderRadius={1}
        borderColor={colors.border}
        cornerRadius={0.24}
        height={200}
        width={screenWidth - 50}
        style={$wrap}
      >
        <View style={$row}>
          <Text
            style={$title}
            preset="formLabel"
            color={colors.palette.primary500}
            weight="bold"
            text="Nearest Mazaar"
          />
          <Text
            preset="subheading"
            color={colors.text}
            weight="bold"
            numberOfLines={2}
            text={name}
          />
          <Text preset="formHelper" color={colors.textDim} text={distanceLabel(distanceKm)} />
          {subtitle ? (
            <Text preset="formHelper" color={colors.textDim} numberOfLines={2} text={subtitle} />
          ) : null}
        </View>
      </SBox>
    </Pressable>
  )
}

const $wrap: ViewStyle = {
  marginHorizontal: spacing.lg,
  marginBottom: spacing.sm,
}

const $row: ViewStyle = {
  alignItems: "center",
  justifyContent: "space-between",
  flexDirection: "row",
  flexWrap: "wrap",
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.md,
  gap: spacing.md,
}

const $title: TextStyle = {
  fontSize: 16,
  fontWeight: "bold",
}
