import { Icon, Text } from "app/components"
import { formatTime } from "app/helpers/audio.helper"
import { useSoundPlayer } from "app/hooks/useAudio"
import { colors, spacing } from "app/theme"
import LottieView from "lottie-react-native"
import React, { useEffect, useRef } from "react"
import { Dimensions, ImageStyle, Pressable, TextStyle, View, ViewStyle } from "react-native"

export default function SoundPlayerHome({ navigation }: { navigation: any }) {
  const { currentSound, toggleSound, state, position, duration } = useSoundPlayer()
  const soundAnimation = useRef<LottieView>(null)

  if (!currentSound) return null

  useEffect(() => {
    if (state === "playing") {
      soundAnimation.current?.play()
    } else {
      soundAnimation.current?.pause()
    }
  }, [state])

  const screenWidth = Dimensions.get("window").width ?? 0
  const totalWidth = screenWidth - 48

  const width = (totalWidth * (position ?? 0)) / (duration ?? 0) ?? 0
  const seekWidth = isNaN(width) ? 0 : width

  return (
    <Pressable
      onPress={() => {
        if (currentSound.startedFrom === "PDF") {
          const item = JSON.parse(currentSound.item)
          navigation.navigate("PdfViewer", item)
        }
      }}
      style={$container}
    >
      <View style={$innerContainer}>
        <View style={[$seekContainer, { width: seekWidth }]} />
        <View style={$soundContainer}>
          <Pressable style={$iconContainer} onPress={toggleSound}>
            <Icon
              color={colors.white}
              style={$icon}
              icon={state === "playing" ? "pause" : "play"}
            />
          </Pressable>
          <Text>{currentSound.title}</Text>
        </View>
        <View style={$soundContainerRight}>
          <Text weight="bold" style={$soundText}>
            {formatTime(position ?? 0)}
          </Text>
          <LottieView
            style={$soundIcon}
            ref={soundAnimation}
            source={require("../../../../assets/animation/music.json")}
            autoPlay
            loop
          />
        </View>
      </View>
    </Pressable>
  )
}

const $innerContainer: ViewStyle = {
  position: "relative",
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  overflow: "hidden",
  paddingHorizontal: spacing.sm,
  paddingVertical: spacing.xs,
}

const $seekContainer: ViewStyle = {
  height: 45,
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  borderRadius: 10,
  backgroundColor: colors.palette.primary100,
}

const $iconContainer: ViewStyle = {
  backgroundColor: colors.palette.primary500,
  borderRadius: 100,
  marginRight: spacing.xs,
  padding: spacing.xs,
}

const $soundContainer: ViewStyle = {
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
}

const $soundText: TextStyle = {
  marginRight: spacing.sm,
  fontSize: 14,
  color: colors.palette.primary500,
}

const $soundContainerRight: ViewStyle = {
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
}

const $icon: ImageStyle = {
  width: 12,
  height: 12,
}

const $soundIcon: ViewStyle = {
  width: 20,
  height: 20,
}

const $container: ViewStyle = {
  height: 46,
  marginHorizontal: spacing.lg,
  borderWidth: 1,
  marginTop: spacing.lg,
  borderColor: colors.gray,
  borderRadius: 10,
  backgroundColor: colors.white,

  shadowOpacity: 0.5,
  shadowOffset: { width: 0, height: 2 },
  shadowRadius: 4,
  shadowColor: colors.border,
}
