import { useNavigation } from "@react-navigation/native"
import { IconGpsFilled } from "@tabler/icons-react-native"
import { Screen, Text, Icon } from "app/components"
import Header from "app/components/Header"
import { useTheme } from "app/contexts/ThemeContext"
import { useLocationCoords } from "app/hooks/useLocationCoords"
import { useStores } from "app/models"
import { AppStackScreenProps } from "app/navigators"
import { spacing } from "app/theme"
import { useColors } from "app/theme/useColors"
import React, { useEffect, useRef, useState } from "react"
import {
  View,
  Animated,
  Easing,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  Dimensions,
  ImageStyle,
  TouchableOpacity,
} from "react-native"
import CompassHeading from "react-native-compass-heading"
import Geolocation from "react-native-geolocation-service"

const KAABA_LAT = 21.422487
const KAABA_LNG = 39.826206

export function QiblaScreen() {
  const colors = useColors()
  const theme = useTheme()
  const navigation = useNavigation<AppStackScreenProps<"Qibla">["navigation"]>()
  const locationCoords = useLocationCoords()
  const [lat, setLat] = useState<number | null>(null)
  const [lng, setLng] = useState<number | null>(null)
  const [qiblaDir, setQiblaDir] = useState<number | null>(null) // degrees
  const [heading, setHeading] = useState<number>(0) // device azimuth

  const { dataStore } = useStores()
  const currentLocation = dataStore.currentLocation
  const dialAnim = useRef(new Animated.Value(0)).current
  const arrowAnim = useRef(new Animated.Value(0)).current

  // Ask for location permission (Android)
  const requestLocationPermission = async () => {
    return true
  }

  // Get GPS and compute Qibla
  const fetchGPS = async () => {
    // Try to use existing location from store first
    if (locationCoords) {
      setLat(locationCoords.latitude)
      setLng(locationCoords.longitude)
      const qibla = calculateQiblaDirection(locationCoords.latitude, locationCoords.longitude)
      setQiblaDir(qibla)
      return
    }

    // Fallback to Geolocation API
    const hasPermission = await requestLocationPermission()
    if (!hasPermission) {
      return
    }

    Geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords

        setLat(latitude)
        setLng(longitude)

        const qibla = calculateQiblaDirection(latitude, longitude)
        setQiblaDir(qibla)
      },
      (error) => {
        console.warn("Location error:", error)
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 5000,
        forceRequestLocation: true,
      },
    )
  }

  // Same math logic as your Kotlin (atan2 + normalization)
  const calculateQiblaDirection = (userLat: number, userLng: number): number => {
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

  const toRad = (deg: number) => (deg * Math.PI) / 180
  const toDeg = (rad: number) => (rad * 180) / Math.PI

  // Setup compass
  useEffect(() => {
    fetchGPS()

    const degreeUpdateRate = 3 // similar to sensor rate
    CompassHeading.start(degreeUpdateRate, ({ heading: hdg }: { heading: number }) => {
      setHeading(hdg)
    })

    return () => {
      CompassHeading.stop()
    }
  }, [locationCoords])

  // Animate dial rotation (background compass)
  useEffect(() => {
    Animated.timing(dialAnim, {
      toValue: -heading, // rotate opposite to heading
      duration: 500,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start()
  }, [heading, dialAnim])

  // Animate Qibla arrow
  useEffect(() => {
    if (qiblaDir == null) return

    // In Kotlin: arrow uses (-currentAzimuth + qiblaDir)
    const targetAngle = -heading + qiblaDir

    Animated.timing(arrowAnim, {
      toValue: targetAngle,
      duration: 500,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start()
  }, [heading, qiblaDir, arrowAnim])

  const dialRotate = dialAnim.interpolate({
    inputRange: [-360, 360],
    outputRange: ["-360deg", "360deg"],
  })

  const arrowRotate = arrowAnim.interpolate({
    inputRange: [-720, 720],
    outputRange: ["-720deg", "720deg"],
  })

  if (!lat || !lng || qiblaDir === null) {
    return (
      <Screen preset="fixed" style={$screen(colors)}>
        <View style={$centerContainer}>
          <ActivityIndicator size="large" color={colors.tint} />
          <Text text="Loading Qibla direction..." style={$loadingText} />
        </View>
      </Screen>
    )
  }

  const handleNavigateToAR = () => {
    navigation.navigate("ARNamazMat")
  }

  return (
    <Screen
      safeAreaEdges={["top"]}
      backgroundColor={colors.accentBackground}
      preset="fixed"
      style={$screen(colors)}
    >
      <Header
        title="Qibla Direction"
        showBackButton
        rightActions={
          <TouchableOpacity
            onPress={handleNavigateToAR}
            style={$arButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Icon icon="view" size={24} color={colors.tint} />
          </TouchableOpacity>
        }
      />
      <View style={$contentContainer}>
        <View style={$compassWrapper}>
          <View style={$compassContainer}>
            <View style={$dialContainer}>
              <Animated.Image
                source={
                  theme.isDark
                    ? require("../../../assets/images/dial_dark.png")
                    : require("../../../assets/images/dial.png")
                }
                style={[$dialImage, { transform: [{ rotate: dialRotate }] }]}
                resizeMode="contain"
              />

              {qiblaDir != null && (
                <Animated.View
                  style={[$qiblaArrowContainer, { transform: [{ rotate: arrowRotate }] }]}
                >
                  <Animated.Image
                    source={require("../../../assets/images/jarum_qiblat.png")}
                    style={$qiblaArrowImage}
                    resizeMode="contain"
                  />
                </Animated.View>
              )}
            </View>
            <View style={$qiblaDirectionContainer}>
              <Text
                text={`${qiblaDir.toFixed(2)}°`}
                color={colors.text}
                style={$qiblaDegLabel}
                weight="bold"
              />
            </View>
            <View style={$qiblaLocationContainer}>
              <IconGpsFilled style={$qiblaLocationIcon} size={24} color={colors.tint} />
              <Text
                text={`${currentLocation.city}${
                  currentLocation.country ? `, ${currentLocation.country}` : ""
                } ${currentLocation.state ? `, ${currentLocation.state}` : ""}`}
                color={colors.text}
                style={$qiblaLabel}
                weight="bold"
              />
            </View>
            <View style={$qiblaDirectionContainer}>
              <Text
                text={`Heading: ${heading.toFixed(2)}°`}
                color={colors.text}
                style={$qiblaDirectionLabel}
                weight="bold"
              />
            </View>

            <View style={$noteContainer}>
              <Text
                text="Note: This is the Qibla direction from your current location to the Kaaba."
                color={colors.text}
                style={$noteLabel}
                weight="bold"
              />
            </View>
          </View>
        </View>
      </View>
    </Screen>
  )
}

const $noteContainer: ViewStyle = {
  flexDirection: "row",
  justifyContent: "center",
  marginTop: spacing.md,
}

const $noteLabel: TextStyle = { fontSize: 14, textAlign: "center" }

const $qiblaDegLabel: TextStyle = {
  fontSize: 24,
  textAlign: "center",
  marginTop: spacing.md,
}

const $qiblaLocationIcon: ImageStyle = {
  marginRight: spacing.xs,
}

const $qiblaLocationContainer: ViewStyle = {
  marginTop: spacing.md,
  flexDirection: "row",
}

const $qiblaDirectionLabel: TextStyle = {
  fontSize: 14,
}

const $qiblaDirectionContainer: ViewStyle = {
  flexDirection: "row",
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window")
const COMPASS_SIZE = Math.min(SCREEN_WIDTH * 0.85, SCREEN_HEIGHT * 0.6)

const $qiblaLabel: TextStyle = {
  fontSize: 16,
  textTransform: "uppercase",
  letterSpacing: 1,
}

const $qiblaArrowContainer: ViewStyle = {
  width: COMPASS_SIZE,
  height: COMPASS_SIZE,
  alignItems: "center",
  justifyContent: "center",
}

const $qiblaArrowImage: ImageStyle = {
  position: "absolute",
  width: COMPASS_SIZE / 4,
  height: COMPASS_SIZE / 4,
  top: -36,
}

const $dialContainer: ViewStyle = {
  width: COMPASS_SIZE,
  height: COMPASS_SIZE,
  alignItems: "center",
  justifyContent: "center",
}

const $dialImage: ImageStyle = {
  width: COMPASS_SIZE,
  height: COMPASS_SIZE,
  position: "absolute",
  top: 0,
  left: 0,
}

const $contentContainer: ViewStyle = {
  width: "100%",
  height: Dimensions.get("window").height - 80,
  marginTop: spacing.xxl * 2,
}

const $screen = (colors: any): ViewStyle => {
  return {
    flex: 1,
    backgroundColor: colors.accentBackground,
    height: SCREEN_HEIGHT,
  }
}

const $compassWrapper: ViewStyle = {
  flex: 1,
  width: "100%",
  alignItems: "center",
  maxHeight: COMPASS_SIZE,
}

const $compassContainer: ViewStyle = {
  width: COMPASS_SIZE,
  height: COMPASS_SIZE,
  alignItems: "center",
  justifyContent: "center",
  position: "relative",
}

const $centerContainer = {
  flex: 1,
  // justifyContent: "center" as const,
  // alignItems: "center" as const,
  padding: spacing.xl,
}

const $loadingText: TextStyle = {
  marginTop: spacing.md,
  textAlign: "center",
}

const $arButton: ViewStyle = {
  padding: spacing.xs,
  alignItems: "center",
  justifyContent: "center",
}

// const $infoLabel: ViewStyle = {
//   marginBottom: spacing.xs,
// }

// const $infoValue: ViewStyle = {
//   marginTop: spacing.xs,
// }

// const styles = StyleSheet.create({
//   compassImage: {
//     height: COMPASS_SIZE,
//     width: COMPASS_SIZE,
//   },
//   qiblaArrow: {
//     height: COMPASS_SIZE * 0.75,
//     left: COMPASS_SIZE * 0.125,
//     position: "absolute",
//     top: COMPASS_SIZE * 0.125,
//     width: COMPASS_SIZE * 0.75,
//   },
// })
