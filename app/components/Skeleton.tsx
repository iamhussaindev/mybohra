import { colors } from "app/theme"
import React, { useEffect } from "react"
import { View, ViewStyle, Animated, Dimensions } from "react-native"

interface SkeletonProps {
  width?: number | string
  height?: number
  borderRadius?: number
  style?: ViewStyle
}

export function Skeleton({ width = "100%", height = 20, borderRadius = 4, style }: SkeletonProps) {
  const shimmerAnim = React.useRef(new Animated.Value(0)).current
  const screenWidth = Dimensions.get("window").width
  const skeletonWidth = typeof width === "number" ? width : screenWidth

  useEffect(() => {
    const shimmerAnimation = Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      }),
    )
    shimmerAnimation.start()
    return () => shimmerAnimation.stop()
  }, [shimmerAnim])

  const translateX = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-skeletonWidth * 2, skeletonWidth * 2],
  })

  return (
    <View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: colors.palette.neutral200,
          overflow: "hidden",
        },
        style,
      ]}
    >
      <Animated.View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: skeletonWidth,
          transform: [{ translateX }],
          backgroundColor: colors.palette.neutral300,
          opacity: 0.5,
        }}
      />
    </View>
  )
}

