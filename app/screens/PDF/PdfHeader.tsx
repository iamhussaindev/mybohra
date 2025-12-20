import { BackButton } from "app/appComponents/BackButton"
import { Icon, Text } from "app/components"
import { useStores } from "app/models"
import { ILibrary } from "app/models/LibraryStore"
import { spacing } from "app/theme"
import { useColors } from "app/theme/useColors"
import { observer } from "mobx-react-lite"
import React, { useEffect, useState } from "react"
import { Pressable, TextStyle, View, ViewStyle } from "react-native"
import ReactNativeHapticFeedback from "react-native-haptic-feedback"
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated"

interface HeaderProps extends ILibrary {
  isFullscreen?: boolean
  togglePin: () => void
}

export const Header = observer(function Header(props: HeaderProps) {
  const { dataStore } = useStores()
  const colors = useColors()
  const [isPinned, setIsPinned] = useState<boolean>(false)
  const translateY = useSharedValue(0)
  const iconScale = useSharedValue(1)
  useEffect(() => {
    setIsPinned(dataStore.isPdfPinned(props.id))
  }, [dataStore.pinnedPdfs])
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

  const animatedIconStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: iconScale.value }],
    }
  })

  const handlePinPress = () => {
    // Haptic feedback
    ReactNativeHapticFeedback.trigger("impactLight", {
      enableVibrateFallback: true,
      ignoreAndroidSystemSettings: false,
    })

    // Scale animation - press down then spring back
    iconScale.value = withSpring(0.8, { damping: 10, stiffness: 300 }, () => {
      iconScale.value = withSpring(1, { damping: 10, stiffness: 300 })
    })

    // Toggle pin
    props.togglePin()
    setIsPinned(!isPinned)
  }

  return (
    <Animated.View style={[$header(colors), animatedHeaderStyle]}>
      <BackButton style={$backButton} />
      <View style={$headerLocation}>
        <Text
          weight="medium"
          style={$headerTitle}
          text={props.name}
          color={colors.text}
          numberOfLines={1}
          ellipsizeMode="tail"
        />
      </View>
      <View style={$headerRight}>
        <Pressable onPress={handlePinPress} style={$headerRightIcon}>
          <Animated.View style={animatedIconStyle}>
            <Icon
              color={isPinned ? colors.palette.primary500 : colors.palette.neutral500}
              size={24}
              icon={isPinned ? "bookmarkOutline" : "bookmarkOutline"}
            />
          </Animated.View>
        </Pressable>
      </View>
    </Animated.View>
  )
})

const $headerTitle: TextStyle = {
  maxWidth: 200,
  textAlign: "center",
  fontSize: 16,
  lineHeight: 20,
  textTransform: "capitalize",
  flexShrink: 1,
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

const $header = (colors: any): ViewStyle => ({
  flexDirection: "row",
  justifyContent: "space-between",
  backgroundColor: colors.background,
  alignItems: "center",
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  zIndex: 100,
})
