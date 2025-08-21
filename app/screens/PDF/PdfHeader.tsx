import React, { useEffect } from "react"
import { Icon, Text } from "app/components"
import { Pressable, TextStyle, View, ViewStyle } from "react-native"
import { colors, spacing } from "app/theme"
import { BackButton } from "app/appComponents/BackButton"
import { ILibrary } from "app/models/LibraryStore"
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated"

interface HeaderProps extends ILibrary {
  isFullscreen?: boolean
}

export function Header(props: HeaderProps) {
  const translateY = useSharedValue(0)

  useEffect(() => {
    if (props.isFullscreen) {
      translateY.value = withTiming(-200, { duration: 100 }) // Slide up when entering fullscreen
    } else {
      translateY.value = withTiming(0, { duration: 100 }) // Slide down when exiting fullscreen
    }
  }, [props.isFullscreen, translateY])

  const animatedHeaderStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    }
  })

  return (
    <Animated.View style={[$header, animatedHeaderStyle]}>
      <BackButton style={$backButton} />
      <View style={$headerLocation}>
        <Text preset="bold" style={$headerTitle} text={props.name} />
      </View>
      <View style={$headerRight}>
        <Pressable style={$headerRightIcon}>
          <Icon color={colors.palette.neutral500} size={24} icon="bookmarkOutline" />
        </Pressable>
      </View>
    </Animated.View>
  )
}

const $headerTitle: TextStyle = {
  maxWidth: 200,
  textAlign: "center",
  fontSize: 14,
  lineHeight: 18,
}

const $headerRight: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
}

const $backButton: ViewStyle = {
  zIndex: 10,
  position: "relative",
}

const $headerRightIcon: ViewStyle = {
  alignItems: "center",
  justifyContent: "center",
  marginEnd: spacing.lg,
  zIndex: 10,
  position: "relative",
}

const $headerLocation: ViewStyle = {
  alignItems: "center",
  justifyContent: "center",
  position: "absolute",
  height: 50,
  left: 0,
  display: "flex",
  zIndex: 0,
  right: 0,
}

const $header: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-between",
  backgroundColor: colors.palette.neutral100,
  alignItems: "center",
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  zIndex: 100,
  borderBottomWidth: 1,
  borderBottomColor: colors.border,
  shadowColor: colors.gray,
  shadowOpacity: 0.5,
  shadowRadius: 5,
  shadowOffset: { width: 0, height: 5 },
}
