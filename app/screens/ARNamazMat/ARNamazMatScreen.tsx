import { Screen, Text } from "app/components"
import Header from "app/components/Header"
import { useLocationCoords } from "app/hooks/useLocationCoords"
import { spacing } from "app/theme"
import { useColors } from "app/theme/useColors"
import { CameraView, useCameraPermissions } from "expo-camera"
import React, { useEffect, useState } from "react"
import {
  View,
  ViewStyle,
  TextStyle,
  Dimensions,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native"
import CompassHeading from "react-native-compass-heading"
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated"
import { accelerometer } from "react-native-sensors"

const KAABA_LAT = 21.422487
const KAABA_LNG = 39.826206
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window")
const MAT_WIDTH = SCREEN_WIDTH * 0.8
const MAT_HEIGHT = MAT_WIDTH * 1.5 // Prayer mat is typically longer than wide

export function ARNamazMatScreen() {
  const colors = useColors()
  const locationCoords = useLocationCoords()
  const [permission, requestPermission] = useCameraPermissions()
  const [lat, setLat] = useState<number | null>(null)
  const [lng, setLng] = useState<number | null>(null)
  const [qiblaDir, setQiblaDir] = useState<number | null>(null)
  const [heading, setHeading] = useState<number>(0)
  const [pitch, setPitch] = useState<number>(0) // Device tilt forward/backward
  const [roll, setRoll] = useState<number>(0) // Device tilt left/right

  // Animation values for 3D transforms
  const matRotationY = useSharedValue(0)
  const matRotationX = useSharedValue(0)
  const matScale = useSharedValue(1)
  const matOpacity = useSharedValue(0.9)

  // Calculate Qibla direction
  const calculateQiblaDirection = (userLat: number, userLng: number): number => {
    const toRad = (deg: number) => (deg * Math.PI) / 180
    const toDeg = (rad: number) => (rad * 180) / Math.PI

    const userLatRad = toRad(userLat)
    const kaabaLatRad = toRad(KAABA_LAT)
    const longDiff = toRad(KAABA_LNG - userLng)

    const y = Math.sin(longDiff) * Math.cos(kaabaLatRad)
    const x =
      Math.cos(userLatRad) * Math.sin(kaabaLatRad) -
      Math.sin(userLatRad) * Math.cos(kaabaLatRad) * Math.cos(longDiff)

    const result = (toDeg(Math.atan2(y, x)) + 360) % 360
    return result
  }

  // Get GPS and compute Qibla
  useEffect(() => {
    if (locationCoords) {
      setLat(locationCoords.latitude)
      setLng(locationCoords.longitude)
      const qibla = calculateQiblaDirection(locationCoords.latitude, locationCoords.longitude)
      setQiblaDir(qibla)
    }
  }, [locationCoords])

  // Setup compass heading
  useEffect(() => {
    const degreeUpdateRate = 3
    CompassHeading.start(degreeUpdateRate, ({ heading: hdg }: { heading: number }) => {
      setHeading(hdg)
    })

    return () => {
      CompassHeading.stop()
    }
  }, [])

  // Setup accelerometer for device tilt
  useEffect(() => {
    const subscription = accelerometer.subscribe(
      ({ x, y, z }) => {
        // Calculate pitch (forward/backward tilt)
        const pitchValue = Math.atan2(-x, Math.sqrt(y * y + z * z)) * (180 / Math.PI)
        setPitch(pitchValue)

        // Calculate roll (left/right tilt)
        const rollValue = Math.atan2(y, z) * (180 / Math.PI)
        setRoll(rollValue)
      },
      (error) => {
        console.warn("Accelerometer error:", error)
      },
    )

    return () => subscription.unsubscribe()
  }, [])

  // Update mat rotation based on Qibla direction and device orientation
  useEffect(() => {
    if (qiblaDir !== null) {
      // Calculate relative angle from device heading to Qibla
      const relativeAngle = (qiblaDir - heading + 360) % 360
      matRotationY.value = withSpring(relativeAngle, {
        damping: 15,
        stiffness: 100,
      })
    }
  }, [qiblaDir, heading])

  // Update mat tilt based on device pitch and roll
  useEffect(() => {
    // Apply pitch and roll with reduced sensitivity for smoother movement
    matRotationX.value = withSpring(pitch * 0.3, {
      damping: 20,
      stiffness: 150,
    })

    // Scale based on pitch to create depth effect
    const scaleValue = 1 - Math.abs(pitch) / 180
    matScale.value = withSpring(Math.max(0.7, Math.min(1.2, scaleValue)), {
      damping: 15,
      stiffness: 100,
    })
  }, [pitch, roll])

  // Animated style for 3D mat
  const matAnimatedStyle = useAnimatedStyle(() => {
    // Create perspective effect
    const perspective = 1000
    const rotateY = matRotationY.value
    const rotateX = matRotationX.value

    return {
      transform: [
        { perspective },
        { rotateY: `${rotateY}deg` },
        { rotateX: `${rotateX}deg` },
        { scale: matScale.value },
      ],
      opacity: matOpacity.value,
    }
  })

  // Request camera permission
  useEffect(() => {
    if (!permission) {
      requestPermission()
    }
  }, [permission])

  if (!permission) {
    return (
      <Screen preset="fixed" style={$screen(colors)}>
        <View style={$centerContainer}>
          <ActivityIndicator size="large" color={colors.tint} />
          <Text text="Requesting camera permission..." style={$loadingText} />
        </View>
      </Screen>
    )
  }

  if (!permission.granted) {
    return (
      <Screen preset="fixed" style={$screen(colors)}>
        <View style={$centerContainer}>
          <Text text="Camera permission is required" style={$errorText} weight="medium" />
          <TouchableOpacity
            style={[$permissionButton, { backgroundColor: colors.tint }]}
            onPress={requestPermission}
          >
            <Text text="Grant Permission" style={$permissionButtonText} />
          </TouchableOpacity>
        </View>
      </Screen>
    )
  }

  if (!lat || !lng || qiblaDir === null) {
    return (
      <Screen preset="fixed" style={$screen(colors)}>
        <View style={$centerContainer}>
          <ActivityIndicator size="large" color={colors.tint} />
          <Text text="Loading location and Qibla direction..." style={$loadingText} />
        </View>
      </Screen>
    )
  }

  return (
    <Screen safeAreaEdges={["top"]} preset="fixed" style={$screen(colors)}>
      <Header title="AR Namaz Mat" showBackButton rightActions={<View />} />
      <View style={$cameraContainer}>
        <CameraView style={$camera} facing="back">
          {/* 3D Namaz Mat Overlay */}
          <View style={$matContainer}>
            <Animated.View style={[$namazMat, matAnimatedStyle]}>
              {/* Mat Design */}
              <View style={[$matBase, { backgroundColor: colors.palette.primary500 }]}>
                {/* Qibla indicator (arrow pointing up when facing Qibla) */}
                <View style={$qiblaIndicator}>
                  <View style={[$qiblaArrow, { borderBottomColor: colors.white }]} />
                  <Text text="Qibla" style={$qiblaLabel} weight="bold" />
                </View>

                {/* Decorative pattern */}
                <View style={$matPattern}>
                  <View style={[$patternLine, { backgroundColor: colors.palette.primary300 }]} />
                  <View style={[$patternLine, { backgroundColor: colors.palette.primary300 }]} />
                </View>

                {/* Center circle (for positioning) */}
                <View style={[$centerCircle, { borderColor: colors.white }]} />
              </View>
            </Animated.View>
          </View>

          {/* Info overlay */}
          <View style={$infoOverlay}>
            <View style={[$infoCard, { backgroundColor: colors.palette.neutral200 }]}>
              <Text
                text={`Qibla: ${Math.round(qiblaDir)}°`}
                style={[$infoText, { color: colors.text }]}
                size="sm"
              />
              <Text
                text={`Heading: ${Math.round(heading)}°`}
                style={[$infoText, { color: colors.textDim }]}
                size="xs"
              />
            </View>
          </View>
        </CameraView>
      </View>
    </Screen>
  )
}

const $screen = (colors: any): ViewStyle => ({
  flex: 1,
  backgroundColor: colors.background,
})

const $centerContainer: ViewStyle = {
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  padding: spacing.xl,
}

const $loadingText: TextStyle = {
  marginTop: spacing.md,
  textAlign: "center",
}

const $errorText: TextStyle = {
  textAlign: "center",
  marginBottom: spacing.lg,
}

const $permissionButton: ViewStyle = {
  paddingHorizontal: spacing.xl,
  paddingVertical: spacing.md,
  borderRadius: 8,
  marginTop: spacing.md,
}

const $permissionButtonText: TextStyle = {
  color: "white",
  fontSize: 16,
  fontWeight: "600",
}

const $cameraContainer: ViewStyle = {
  flex: 1,
  width: "100%",
  height: SCREEN_HEIGHT - 100,
}

const $camera: ViewStyle = {
  flex: 1,
  width: "100%",
}

const $matContainer: ViewStyle = {
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  position: "absolute",
  width: "100%",
  height: "100%",
}

const $namazMat: ViewStyle = {
  width: MAT_WIDTH,
  height: MAT_HEIGHT,
  justifyContent: "center",
  alignItems: "center",
}

const $matBase: ViewStyle = {
  width: "100%",
  height: "100%",
  borderRadius: 12,
  borderWidth: 2,
  borderColor: "rgba(255, 255, 255, 0.3)",
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.3,
  shadowRadius: 8,
  elevation: 8,
}

const $qiblaIndicator: ViewStyle = {
  position: "absolute",
  top: 20,
  width: "100%",
  alignItems: "center",
  zIndex: 10,
}

const $qiblaArrow: ViewStyle = {
  width: 0,
  height: 0,
  borderLeftWidth: 15,
  borderRightWidth: 15,
  borderBottomWidth: 30,
  borderLeftColor: "transparent",
  borderRightColor: "transparent",
  marginBottom: spacing.xs,
}

const $qiblaLabel: TextStyle = {
  color: "white",
  fontSize: 14,
  textTransform: "uppercase",
  letterSpacing: 1,
}

const $matPattern: ViewStyle = {
  position: "absolute",
  width: "100%",
  height: "100%",
  justifyContent: "space-around",
  paddingVertical: spacing.xl,
}

const $patternLine: ViewStyle = {
  width: "80%",
  height: 2,
  alignSelf: "center",
  opacity: 0.5,
}

const $centerCircle: ViewStyle = {
  width: 60,
  height: 60,
  borderRadius: 30,
  borderWidth: 2,
  position: "absolute",
  bottom: MAT_HEIGHT * 0.3,
}

const $infoOverlay: ViewStyle = {
  position: "absolute",
  top: 20,
  right: 20,
  zIndex: 100,
}

const $infoCard: ViewStyle = {
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.sm,
  borderRadius: 8,
  minWidth: 120,
  alignItems: "center",
}

const $infoText: TextStyle = {
  marginVertical: spacing.xxs,
  textAlign: "center",
}
