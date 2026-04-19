import { IconChevronRight } from "@tabler/icons-react-native"
import { Text } from "app/components"
import { spacing } from "app/theme"
import { useColors } from "app/theme/useColors"
import React from "react"
import { Image, ImageStyle, Pressable, StyleSheet, View, ViewStyle } from "react-native"
import { LinearGradient } from "react-native-linear-gradient"

export type NearestMazaarBannerProps = {
  name: string
  distanceKm: number
  subtitle?: string
  imageUri?: string | null
  onPress: () => void
}

function distanceLabel(km: number): string {
  if (km < 1) return "Nearby — less than 1 km"
  const rounded = Math.round(km)
  return rounded <= 1 ? "About 1 km away" : `About ${rounded} km away`
}

const BANNER_HEIGHT = 200

export function NearestMazaarBanner({
  name,
  distanceKm,
  subtitle,
  imageUri,
  onPress,
}: NearestMazaarBannerProps) {
  const colors = useColors()

  return (
    <Pressable
      onPress={onPress}
      style={[$shell, { borderColor: colors.border }]}
      accessibilityRole="button"
      accessibilityLabel={`Nearest mazaar: ${name}`}
    >
      <View style={$frame}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={$bgImage} resizeMode="cover" />
        ) : (
          <View style={[$bgImage, { backgroundColor: colors.palette.neutral300 }]} />
        )}

        <LinearGradient
          pointerEvents="none"
          colors={["rgba(0,0,0,0.05)", "rgba(0,0,0,0.35)", "rgba(0,0,0,0.82)"]}
          locations={[0, 0.45, 1]}
          style={StyleSheet.absoluteFill}
        />

        <View style={$textRow}>
          <View style={$textCol}>
            <Text
              preset="subheading"
              color={colors.absoluteWhite}
              weight="bold"
              numberOfLines={2}
              text={name}
            />
            <Text
              preset="formLabel"
              color="rgba(255,255,255,0.9)"
              text={distanceLabel(distanceKm)}
            />
            {subtitle ? (
              <Text
                preset="formHelper"
                color="rgba(255,255,255,0.75)"
                numberOfLines={2}
                text={subtitle}
              />
            ) : null}
          </View>
          <IconChevronRight size={26} color={colors.absoluteWhite} style={$chevron} />
        </View>
      </View>
    </Pressable>
  )
}

const $shell: ViewStyle = {
  marginHorizontal: spacing.lg,
  marginBottom: spacing.md,
  borderRadius: 16,
  overflow: "hidden",
  borderWidth: 1,
}

const $frame: ViewStyle = {
  height: BANNER_HEIGHT,
  width: "100%",
  position: "relative",
}

const $bgImage: ImageStyle = {
  ...StyleSheet.absoluteFillObject,
  width: "100%",
  height: "100%",
}

const $textRow: ViewStyle = {
  ...StyleSheet.absoluteFillObject,
  flexDirection: "row",
  alignItems: "flex-end",
  justifyContent: "space-between",
  paddingHorizontal: spacing.md,
  paddingBottom: spacing.md,
  paddingTop: spacing.sm,
}

const $textCol: ViewStyle = {
  flex: 1,
  paddingRight: spacing.sm,
}

const $chevron: ViewStyle = {
  marginBottom: spacing.xs,
  opacity: 0.95,
}
