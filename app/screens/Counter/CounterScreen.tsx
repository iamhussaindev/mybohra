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
  const [selectedTasbeeh, setSelectedTasbeeh] = useState<any>(null)
  const [goal, setGoal] = useState(33)
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null)

  const { tasbeehStore } = useStores()
  const list = tasbeehStore.list

  useEffect(() => {
    setCount(tasbeehStore.defaultTasbeehCount)
    setGoal(tasbeehStore.defaultTasbeehGoal)
  }, [tasbeehStore.defaultTasbeehCount])

  const handlePress = useCallback(() => {
    if (count !== 0 && count === goal) {
      return
    }
    setCount((prevCount) => prevCount + 1)
    ReactNativeHapticFeedback.trigger("impactLight")
  }, [count, goal])

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
    if (count === 0) {
      return
    }
    setCount((prevCount) => prevCount - 1)
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
      { text: "Reset", onPress: () => setCount(0) },
    ])
  }

  const startContinuousDecrement = () => {
    if (count === 0) {
      return
    }
    const id = setInterval(() => {
      setCount((prevCount) => Math.max(prevCount - 1, 0))
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

  const calculateArabicFontSize = (text: string | undefined) => {
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
      setSelectedTasbeeh(item)
      setGoal(item.count || 0)
      $bottomSheetRef.current?.close()
      return
    }

    Alert.alert("Reset Counter", "Are you sure you want to reset the counter?", [
      { text: "Cancel", style: "cancel", onPress: () => $bottomSheetRef.current?.close() },
      {
        text: "OK",
        onPress: () => {
          setSelectedTasbeeh(item)
          setCount(0)
          $count.current = 0
          setGoal(item.count || 0)
          $bottomSheetRef.current?.close()
        },
      },
    ])
  }

  const handleSavePress = () => {
    if (!selectedTasbeeh) {
      tasbeehStore.setDefaultTasbeehCount(count, goal)
    }
    tasbeehStore.saveCurrentCount(selectedTasbeeh?.id, count)
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
                setSelectedTasbeeh(null)
                setCount(0)
                setGoal(0)
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
                height={hideCounter ? SCREEN_HEIGHT - 200 : 200}
                style={$imageTasbeeh}
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
          <View style={$counterContainerBgMain}>
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
          </View>
        ) : null}

        {count > 0 ? (
          <Pressable onPress={handleSavePress} style={$saveButton}>
            {tasbeehStore.savingCount ? (
              <Progress.CircleSnail thickness={1} size={14} color="rgb(102, 65, 0)" />
            ) : (
              <Icon color="rgb(102, 65, 0)" size={14} icon="save" />
            )}
            <Text style={$saveText}>
              {tasbeehStore.savingCount
                ? "Saving..."
                : tasbeehStore.defaultTasbeehCount === count
                ? "Saved"
                : "Save"}
            </Text>
          </Pressable>
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
          <Pressable onPress={() => $bottomSheetRefGoal.current?.expand()} style={$actionButton}>
            <Text weight="bold" style={$actionButtonText}>
              {goal}
            </Text>
          </Pressable>
          <Pressable onPress={handleResetPress} style={$actionButton}>
            <Icon color="rgb(102, 65, 0)" size={20} icon="undo" />
          </Pressable>
          <Pressable style={$actionButton}>
            <Icon color="rgb(102, 65, 0)" size={20} icon="save" />
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
        setSelectedTasbeeh={setSelectedTasbeeh}
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
  objectFit: "contain",
  resizeMode: "contain",
  marginBottom: 20,
  justifyContent: "center",
  alignItems: "center",
  display: "flex",
}

const $tasbeehTextContainer: ViewStyle = {
  height: 250,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
}

const $progressCircle: ViewStyle = {
  position: "absolute",
  height: 250,
  width: 250,
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

const $saveButton: ViewStyle = {
  backgroundColor: "white",
  paddingHorizontal: 20,
  marginTop: 40,
  paddingVertical: 8,
  borderRadius: 30,
  justifyContent: "center",
  alignItems: "center",
  shadowColor: "rgb(0,0,0,0.01)",
  shadowOffset: {
    width: 0,
    height: 2,
  },
  shadowOpacity: 0.1,
  shadowRadius: 5,
  elevation: 5,
  flexDirection: "row",
  gap: 10,
}

const $saveText: TextStyle = {
  fontSize: 14,
  lineHeight: 16,
  color: "rgb(102, 65, 0)",
  fontFamily: typography.primary.regular,
}

const $tasbeehContainer: ViewStyle = {
  marginTop: 10,
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 10,
}

const $tasbeehTextArabic: TextStyle = {
  fontFamily: typography.arabic.kanz,
  letterSpacing: 0.1,
  color: "#894a10",
  marginBottom: 40,
  marginTop: 20,
  textAlign: "center",
  paddingHorizontal: 30,
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
  position: "relative",
  justifyContent: "center",
  alignItems: "center",
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
}
