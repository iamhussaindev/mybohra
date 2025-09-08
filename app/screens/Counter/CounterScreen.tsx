import { Icon, Screen, Text } from "app/components"
import Header from "app/components/Header"
import { AppStackScreenProps } from "app/navigators"
import { typography } from "app/theme"
import { observer } from "mobx-react-lite"
import React, { FC, useCallback, useEffect, useRef, useState } from "react"
import {
  TextStyle,
  View,
  ViewStyle,
  Pressable,
  Dimensions,
  Alert,
  Text as TextArabic,
  Image,
  ImageStyle,
} from "react-native"
import ReactNativeHapticFeedback from "react-native-haptic-feedback"
import * as Progress from "react-native-progress"
import { PanGestureHandler, PanGestureHandlerGestureEvent } from "react-native-gesture-handler"
import Animated, {
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  runOnJS,
} from "react-native-reanimated"
import AsyncStorage from "@react-native-async-storage/async-storage"
import TasbeehSelector from "./TasbeehSelector"
import GoalSelector from "./GoalSelector"
import BottomSheet, { SCREEN_HEIGHT, SCREEN_WIDTH } from "@gorhom/bottom-sheet"
import { useStores } from "app/models"
import FullScreenLoader from "../Loader/FullScreenLoader"
import { ITasbeeh } from "app/models/TasbeehStore"

interface CounterScreenProps extends AppStackScreenProps<"Counter"> {}

const counterHeight = SCREEN_HEIGHT * 0.25

export const CounterScreen: FC<CounterScreenProps> = observer(function CounterScreen() {
  const [count, setCount] = useState(0)
  const [isPressed, setIsPressed] = useState(false)
  const [goal, setGoal] = useState(33)
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null)

  // Drag state for counter positioning
  const translateX = useSharedValue(Math.max(20, SCREEN_WIDTH - counterHeight - 30)) // Initial right position with bounds check
  const translateY = useSharedValue(
    Math.max(SCREEN_HEIGHT * 0.5 - counterHeight, SCREEN_HEIGHT - counterHeight - 180),
  ) // Initial bottom position with bounds check

  const { tasbeehStore } = useStores()
  const list = tasbeehStore.list

  // Get selected tasbeeh from store
  const selectedTasbeeh = tasbeehStore.selectedTasbeeh

  useEffect(() => {
    // Load selected tasbeeh and saved tasbeeh list on component mount
    console.log("Loading tasbeeh data...")
    tasbeehStore.fetchTasbeeh() // Load the tasbeeh list first
    tasbeehStore.loadSelectedTasbeeh()
    tasbeehStore.loadDefaultTasbeehCount().then(() => {
      setCount(tasbeehStore.defaultTasbeehCount)
      setGoal(tasbeehStore.defaultTasbeehGoal)
    }) // Load default count and goal
    loadCounterPosition()
  }, [])

  // Monitor when tasbeeh list is loaded and trigger count loading
  useEffect(() => {
    console.log("Tasbeeh list loaded, length:", tasbeehStore.list.length)
    if (tasbeehStore.list.length > 0) {
      console.log("Tasbeeh list is available, triggering count loading...")
      // Add a small delay to ensure all data is loaded
      setTimeout(() => {
        console.log("Delayed count loading triggered...")
      }, 100)
    }
  }, [tasbeehStore.list])

  const loadCounterPosition = async () => {
    try {
      const savedX = await AsyncStorage.getItem("counterPositionX")
      const savedY = await AsyncStorage.getItem("counterPositionY")

      if (savedX && savedY) {
        const x = parseFloat(savedX)
        const y = parseFloat(savedY)

        // Validate saved position is within bounds
        const validX = Math.max(20, Math.min(SCREEN_WIDTH - counterHeight - 20, x))
        const validY = Math.max(
          SCREEN_HEIGHT * 0.5 - counterHeight,
          Math.min(SCREEN_HEIGHT - counterHeight - 120, y),
        )

        translateX.value = validX
        translateY.value = validY
      }
    } catch (error) {
      console.log("Error loading counter position:", error)
    }
  }

  const saveCounterPosition = async (x: number, y: number) => {
    try {
      await AsyncStorage.setItem("counterPositionX", x.toString())
      await AsyncStorage.setItem("counterPositionY", y.toString())
    } catch (error) {
      console.log("Error saving counter position:", error)
    }
  }

  const handlePress = useCallback(() => {
    setCount((prevCount) => {
      if (prevCount !== 0 && prevCount === goal) {
        return prevCount
      }
      const newCount = prevCount + 1
      ReactNativeHapticFeedback.trigger("impactLight")

      tasbeehStore.saveDefaultCount(newCount)

      return newCount
    })
  }, [goal, tasbeehStore, selectedTasbeeh])

  const handlePressIn = () => {
    setIsPressed(true)
  }

  const handlePressOut = () => {
    setIsPressed(false)
  }

  const $counterContainer: ViewStyle = {
    backgroundColor: "#ffdeac",
    width: counterHeight,
    height: counterHeight,
    borderRadius: counterHeight,
    borderWidth: 10,
    borderColor: "#ffe8c3",
  }

  const $pressableContainer: ViewStyle = {
    ...$counterContainer,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  }

  const $bottomSheetRefGoal = useRef<BottomSheet>(null)
  const $bottomSheetRef = useRef<BottomSheet>(null)
  const $count = useRef(0)

  const handleNegativePress = () => {
    setCount((prevCount) => {
      if (prevCount === 0) {
        return prevCount
      }
      const newCount = prevCount - 1

      tasbeehStore.saveDefaultCount(newCount)

      return newCount
    })
  }

  useEffect(() => {
    $count.current = count
  }, [count])

  const handleOpenBottomSheet = useCallback(() => {
    $bottomSheetRef.current?.snapToIndex(1)
  }, [])

  const handleResetPress = () => {
    Alert.alert("Reset", "Are you sure you want to reset?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Reset",
        onPress: () => {
          setCount(0)

          tasbeehStore.saveDefaultCount(0)
          tasbeehStore.setSelectedTasbeeh(null)
          setCount(0)
          setGoal(0)
        },
      },
    ])
  }

  // Gesture handler for dragging the counter
  const gestureHandler = useAnimatedGestureHandler<PanGestureHandlerGestureEvent>({
    onStart: (_, context: any) => {
      context.startX = translateX.value
      context.startY = translateY.value
    },
    onActive: (event, context: any) => {
      const newX = context.startX + event.translationX
      const newY = context.startY + event.translationY

      // Constrain to bottom area (last 40% of screen height)
      const minY = SCREEN_HEIGHT * 0.5 - counterHeight // Allow more vertical range
      const maxY = SCREEN_HEIGHT - counterHeight - 120 // Keep margin from action buttons (they're at bottom 40px)
      const constrainedY = Math.max(minY, Math.min(maxY, newY))

      // Constrain horizontally to screen bounds
      const minX = 20 // Keep some margin from left edge
      const maxX = SCREEN_WIDTH - counterHeight - 20 // Keep some margin from right edge
      const constrainedX = Math.max(minX, Math.min(maxX, newX))

      translateX.value = constrainedX
      translateY.value = constrainedY
    },
    onEnd: () => {
      // Save the final position
      runOnJS(saveCounterPosition)(translateX.value, translateY.value)
      // Optional: Add haptic feedback when dragging ends
      runOnJS(ReactNativeHapticFeedback.trigger)("impactLight")
    },
  })

  // Animated style for the counter
  const animatedCounterStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }, { translateY: translateY.value }],
    }
  })

  const startContinuousDecrement = () => {
    if (count === 0) {
      return
    }
    const id = setInterval(() => {
      setCount((prevCount) => {
        const newCount = Math.max(prevCount - 1, 0)

        tasbeehStore.saveDefaultCount(newCount)
        return newCount
      })
      ReactNativeHapticFeedback.trigger("impactLight")
    }, 200)
    setIntervalId(id)
  }

  const stopContinuousDecrement = () => {
    if (intervalId) {
      clearInterval(intervalId)
      setIntervalId(null)
    }
  }

  const fontSize = Dimensions.get("screen").width * 0.2

  const calculateArabicFontSize = (text: string | null | undefined) => {
    if (!text) return fontSize
    const baseSize = Dimensions.get("screen").width * 0.24
    const length = text.length

    if (length <= 10) return baseSize
    if (length <= 20) return baseSize * 0.4
    if (length <= 30) return baseSize * 0.4
    return baseSize * 0.4
  }

  const fontSizeArabic = calculateArabicFontSize(selectedTasbeeh?.arabicText)

  if (tasbeehStore.all.length === 0) {
    return <FullScreenLoader />
  }

  const handleItemClick = (item: ITasbeeh) => {
    if ($count.current === 0) {
      tasbeehStore.setSelectedTasbeeh(item.id)
      setGoal(item.count || 0)
      $bottomSheetRef.current?.close()
      return
    }

    Alert.alert("Reset Counter", "Are you sure you want to reset the counter?", [
      { text: "Cancel", style: "cancel", onPress: () => $bottomSheetRef.current?.close() },
      {
        text: "OK",
        onPress: () => {
          tasbeehStore.setSelectedTasbeeh(item.id)
          setCount(0)
          $count.current = 0
          setGoal(item.count || 0)

          tasbeehStore.saveDefaultCount(0)
          $bottomSheetRef.current?.close()
        },
      },
    ])
  }

  const hideCounter = selectedTasbeeh?.count === -1

  return (
    <Screen
      preset="fixed"
      backgroundColor="rgb(254, 244, 227)"
      safeAreaEdges={["top"]}
      contentContainerStyle={$screenContainer}
    >
      <Header
        title={
          <View style={$selectTasbeehContainer}>
            <Pressable onPress={handleOpenBottomSheet} style={$selectTasbeehButton}>
              <Text ellipsizeMode="tail" numberOfLines={1} style={$selectTasbeehText}>
                {selectedTasbeeh?.name ?? "Select Tasbeeh"}
              </Text>
              <Icon size={18} color="white" icon="arrowRight" />
            </Pressable>
            <Pressable
              style={$closeTasbeehButton}
              onPress={() => {
                handleResetPress()
              }}
            >
              <Icon size={18} color="white" icon="x" />
            </Pressable>
          </View>
        }
        showBackButton
        rightActions={<View />}
      />
      <View style={$container}>
        <View style={$tasbeehContainer}>
          {selectedTasbeeh?.image ? (
            <>
              <Image
                style={goal === -1 ? $imageTasbeehFullScreen : $imageTasbeeh}
                source={{ uri: selectedTasbeeh?.image }}
              />
            </>
          ) : (
            <View style={$tasbeehTextContainer}>
              <TextArabic
                textBreakStrategy="simple"
                style={[
                  $tasbeehTextArabic,
                  {
                    fontSize: fontSizeArabic,
                    fontFamily:
                      selectedTasbeeh?.type === "DEENI"
                        ? typography.arabic.amiri
                        : typography.arabic.kanz,
                  },
                ]}
              >
                {selectedTasbeeh?.arabicText}
              </TextArabic>
            </View>
          )}
        </View>
        {!hideCounter ? (
          <PanGestureHandler onGestureEvent={gestureHandler}>
            <Animated.View style={[$counterContainerBgMain, animatedCounterStyle]}>
              <View style={[$counterContainerBg, isPressed && $counterContainerBgPressed]} />
              {count > 1 && goal !== 0 ? (
                <Progress.Circle
                  style={$progressCircle}
                  progress={count / goal}
                  size={counterHeight + 5}
                  strokeCap="round"
                  borderWidth={0}
                  color="#aa5302"
                />
              ) : null}
              <Pressable
                onPress={handlePress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                style={$pressableContainer}
              >
                <Text weight="bold" style={$counterText}>
                  {count}
                </Text>
                {goal ? <Text style={$goalText}>{goal}</Text> : null}
              </Pressable>
            </Animated.View>
          </PanGestureHandler>
        ) : null}

        <View style={$actionButtonsContainer}>
          <Pressable
            onLongPress={startContinuousDecrement}
            onPressOut={stopContinuousDecrement}
            onPress={handleNegativePress}
            style={$actionButton}
          >
            <Icon color="rgb(102, 65, 0)" size={20} icon="minusCircle" />
          </Pressable>
          {goal !== -1 && (
            <Pressable onPress={() => $bottomSheetRefGoal.current?.expand()} style={$actionButton}>
              <Text weight="bold" style={$actionButtonText}>
                {goal === 0 ? "GOAL" : goal}
              </Text>
            </Pressable>
          )}
          <Pressable onPress={handleResetPress} style={$actionButton}>
            <Icon color="rgb(102, 65, 0)" size={20} icon="undo" />
          </Pressable>
        </View>
      </View>

      <TasbeehSelector
        handleItemClick={handleItemClick}
        setCount={setCount}
        list={list ?? []}
        count={count}
        sheetRef={$bottomSheetRef}
        setGoal={setGoal}
      />
      <GoalSelector sheetRef={$bottomSheetRefGoal} setGoal={setGoal} />
    </Screen>
  )
})

const $actionButtonText: TextStyle = {
  fontSize: 13,
  lineHeight: 25,
  color: "rgb(102, 65, 0)",
  fontFamily: typography.number.bold,
}

const $imageTasbeeh: ImageStyle = {
  width: SCREEN_WIDTH,
  height: SCREEN_HEIGHT * 0.3, // Default height for when goal is set
  objectFit: "contain",
  resizeMode: "contain",
  marginBottom: 20,
  marginTop: 20, // Add top margin for spacing
  justifyContent: "center",
  alignItems: "center",
  display: "flex",
  alignSelf: "center", // Ensure image is centered
}

const $imageTasbeehFullScreen: ImageStyle = {
  width: SCREEN_WIDTH,
  height: SCREEN_HEIGHT - 200, // Full screen minus header and some margin
  objectFit: "contain",
  resizeMode: "contain",
  justifyContent: "center",
  alignItems: "center",
  display: "flex",
  alignSelf: "center",
}

const $tasbeehTextContainer: ViewStyle = {
  flex: 0, // Don't take up all available space
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  minHeight: 200,
  width: "100%",
  // paddingHorizontal: 20,
  paddingVertical: 20,
  marginTop: 20, // Add top margin for spacing
}

const $progressCircle: ViewStyle = {
  position: "absolute",
  top: -2.5, // Center it on the counter
  left: -2.5,
  height: counterHeight + 5,
  width: counterHeight + 5,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
}

const $goalText: TextStyle = {
  fontSize: 32,
  fontFamily: typography.number.light,
  lineHeight: 32,
  color: "#894a10",
  position: "absolute",
  bottom: 30,
}

const $tasbeehContainer: ViewStyle = {
  marginTop: 10,
  flexDirection: "column", // Change to column to stack content vertically
  justifyContent: "flex-start", // Position content at the top
  alignItems: "center", // Center content horizontally
  flex: 1, // Take up available space
  width: "100%",
  paddingHorizontal: 20,
  paddingTop: 20, // Add some top padding
}

const $tasbeehTextArabic: TextStyle = {
  fontFamily: typography.arabic.kanz,
  color: "#894a10",
  textAlign: "center",
  textAlignVertical: "center",
  paddingHorizontal: 20,
  lineHeight: undefined, // Let the font size determine line height for better readability
}

const $actionButtonsContainer: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-evenly",
  position: "absolute",
  bottom: 40,
  alignItems: "center",
  marginTop: 100,
  width: "100%",
  paddingHorizontal: 40,
  gap: 0,
  zIndex: 5, // Lower than counter to ensure counter is on top
}

const $actionButton: ViewStyle = {
  width: 60,
  backgroundColor: "white",
  padding: 10,
  borderRadius: 50,
  justifyContent: "center",
  alignItems: "center",
  elevation: 5,
  shadowColor: "rgb(0,0,0,0.01)",
  shadowOffset: {
    width: 0,
    height: 2,
  },
  shadowOpacity: 0.1,
  shadowRadius: 5,
}

const $counterContainerBgMain: ViewStyle = {
  position: "absolute",
  top: 0, // Start from top-left corner
  left: 0, // Start from top-left corner
  justifyContent: "center",
  alignItems: "center",
  zIndex: 10, // Ensure it's above other elements
  width: counterHeight,
  height: counterHeight,
}

const $counterContainerBg: ViewStyle = {
  backgroundColor: "#f1d19f",
  position: "absolute",
  width: counterHeight,
  height: counterHeight,
  borderRadius: counterHeight,
}

const $counterContainerBgPressed: ViewStyle = {
  backgroundColor: "#f1d19f",
}

const $selectTasbeehButton: ViewStyle = {
  backgroundColor: "#ac6a00",
  paddingHorizontal: 20,
  paddingVertical: 10,
  borderRadius: 30,
  width: 200,
  alignItems: "center",
  flexDirection: "row",
  justifyContent: "space-evenly",
  elevation: 5,
  shadowColor: "rgb(0,0,0,0.01)",
  shadowOffset: {
    width: 0,
    height: 2,
  },
  shadowOpacity: 0.1,
  shadowRadius: 5,
}

const $selectTasbeehText: TextStyle = {
  fontSize: 16,
  lineHeight: 16,
  color: "white",
  maxWidth: 150,
  textAlign: "center",
  paddingEnd: 20,
}

const $selectTasbeehContainer: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 10,
}

const $closeTasbeehButton: ViewStyle = {
  backgroundColor: "#ac6a00",
  paddingHorizontal: 20,
  paddingVertical: 10,
  borderRadius: 30,
  justifyContent: "center",
  alignItems: "center",
  elevation: 5,
}

const $screenContainer: ViewStyle = {
  backgroundColor: "rgb(254, 244, 227)",
  flex: 1,
  height: Dimensions.get("screen").height,
}

const $counterText: TextStyle = {
  textAlign: "center",
  fontSize: 60,
  lineHeight: 60,
  fontFamily: typography.number.medium,
  color: "#894a10",
}

const $container: ViewStyle = {
  flex: 1,
  alignItems: "center",
  justifyContent: "space-between",
  paddingBottom: 120, // Add padding to make room for the counter
}
