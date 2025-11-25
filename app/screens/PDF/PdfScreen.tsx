import Slider from "@react-native-community/slider"
import { Icon, Screen, Text } from "app/components"
import { formatTime } from "app/helpers/audio.helper"
import { useSoundPlayer } from "app/hooks/useAudio"
import { useStores } from "app/models"
import { ILibrary } from "app/models/LibraryStore"
import { AppStackScreenProps } from "app/navigators"
import { colors } from "app/theme"
import { observer } from "mobx-react-lite"
import React, { FC, useEffect, useRef, useState } from "react"
import { Alert, Dimensions, TextStyle, TouchableHighlight, ViewStyle } from "react-native"
import Pdf from "react-native-pdf"
import * as Progress from "react-native-progress"
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated"
import { State } from "react-native-track-player"

import { Header } from "./PdfHeader"

interface PdfScreenProps extends AppStackScreenProps<"PdfViewer"> {}

export const PdfScreen: FC<PdfScreenProps> = observer(function PdfScreen(props) {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [enablePaging, setEnablePaging] = useState(false)
  const [loading, setLoading] = useState(true)
  const $pdfRef = useRef<Pdf>(null)

  const { dataStore } = useStores()

  const translateY = useSharedValue(0)

  useEffect(() => {
    if (isFullscreen) {
      translateY.value = withTiming(200, { duration: 100 }) // Slide up when entering fullscreen
    } else {
      translateY.value = withTiming(0, { duration: 100 }) // Slide down when exiting fullscreen
    }
  }, [isFullscreen, translateY])

  const $animatedHeaderStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    }
  })

  if (!props.route.params) {
    return null
  }

  const item: ILibrary = props.route.params as unknown as ILibrary

  useEffect(() => {
    dataStore.recordPdfOpen(item.id)
  }, [dataStore, item.id])

  const source = {
    uri: item.pdf_url ?? "",
    cache: true,
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  const {
    playSound,
    currentSound,
    state,
    toggleSound,
    stopSound,
    duration,
    position,
    speed,
    setSpeed,
    seek,
  } = useSoundPlayer()

  const isCurrent = currentSound?.id === item.id

  const showPlayer =
    (state === State.Playing ||
      state === State.Paused ||
      state === State.Ready ||
      state === State.Buffering) &&
    isCurrent

  const buffering = state === State.Buffering && isCurrent

  const togglePin = async () => {
    const wasPinned = dataStore.isPdfPinned(item.id)
    await dataStore.togglePinPdf(item.id)
    Alert.alert(
      wasPinned ? "Unpinned" : "Pinned",
      `"${item.name}" has been ${wasPinned ? "unpinned" : "pinned"} to your home screen.`,
      [{ text: "OK" }],
    )
  }

  return (
    <Screen
      preset="fixed"
      backgroundColor={isFullscreen ? "white" : "white"}
      safeAreaEdges={["top"]}
      style={isFullscreen ? $fullscreenContainer : $container}
    >
      <Header isFullscreen={isFullscreen} togglePin={togglePin} {...item} />
      {!loading && item.audio_url && (
        <>
          <Animated.View
            style={[$player, $animatedHeaderStyle, showPlayer ? $playerVisible : $playerHidden]}
          >
            {showPlayer && (
              <Slider
                style={$slider}
                minimumValue={0}
                minimumTrackTintColor={colors.palette.primary500}
                maximumTrackTintColor="#ffffff"
                value={position ?? 0}
                tapToSeek={true}
                maximumValue={duration ?? 0}
                onValueChange={(value) => {
                  seek(value)
                }}
              />
            )}
            {showPlayer && (
              <Text weight="bold" style={$playerText}>
                {formatTime(position ?? 0)}
              </Text>
            )}

            {showPlayer && (
              <TouchableHighlight
                underlayColor={colors.palette.primary400}
                style={$actionButton}
                onPress={() => {
                  setSpeed(1.5)
                }}
              >
                <Text weight="bold" style={$speedText}>
                  {speed}
                </Text>
              </TouchableHighlight>
            )}
            {showPlayer && (
              <TouchableHighlight
                underlayColor={colors.palette.primary400}
                style={$actionButton}
                onPress={() => {
                  seek((position ?? 0) - 10)
                }}
              >
                <Icon icon={"timeBackward"} color={colors.white} size={16} />
              </TouchableHighlight>
            )}
            <TouchableHighlight
              underlayColor={colors.palette.primary400}
              style={$playerButton}
              onPress={() => {
                if (showPlayer) {
                  toggleSound()
                } else {
                  playSound(item, "PDF")
                }
              }}
            >
              {!buffering ? (
                <Icon
                  icon={state === State.Playing && isCurrent ? "pause" : "play"}
                  color={colors.white}
                  size={24}
                />
              ) : (
                <Progress.CircleSnail
                  size={36}
                  color={colors.white}
                  strokeCap="round"
                  indeterminate
                  thickness={3}
                />
              )}
            </TouchableHighlight>

            {showPlayer && (
              <TouchableHighlight
                underlayColor={colors.palette.primary400}
                style={$actionButton}
                onPress={() => {
                  seek((position ?? 0) + 10)
                }}
              >
                <Icon icon="timeForward" color={colors.white} size={16} />
              </TouchableHighlight>
            )}
            {showPlayer && (
              <TouchableHighlight
                underlayColor={colors.palette.primary400}
                style={$actionButton}
                onPress={() => {
                  stopSound()
                }}
              >
                <Icon icon="stop" color={colors.white} size={16} />
              </TouchableHighlight>
            )}
            {showPlayer && (
              <Text weight="bold" style={$playerText}>
                {formatTime(duration ?? 0)}
              </Text>
            )}
          </Animated.View>
        </>
      )}

      <Pdf
        singlePage={false}
        spacing={0}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        source={source}
        ref={$pdfRef}
        onLoadComplete={(numberOfPages) => {
          if (numberOfPages > 1) {
            setEnablePaging(true)
          }
          setLoading(false)
        }}
        enableAnnotationRendering={true}
        onPageSingleTap={() => toggleFullscreen()}
        style={isFullscreen ? $fullscreenPdf : $pdf}
        fitPolicy={2}
        enableAntialiasing={true}
        enablePaging={enablePaging}
      />
    </Screen>
  )
})

const screenWidth = Dimensions.get("window").width

const $playerVisible: ViewStyle = {
  opacity: 1,
}

const $playerHidden: ViewStyle = {
  opacity: 1,
  borderTopWidth: 0,
}

const $slider: ViewStyle = {
  width: screenWidth + 100,
  height: 40,
  position: "absolute",
  top: -18.5,
  left: -3,
}

const $speedText: TextStyle = {
  fontSize: 12,
  color: colors.white,
}

const $playerText: TextStyle = {
  color: colors.palette.neutral600,
  fontSize: 14,
  fontWeight: "800",
  width: 50,
  textAlign: "center",
}

const $player: ViewStyle = {
  position: "absolute",
  bottom: 0,
  zIndex: 100,
  display: "flex",
  flexDirection: "row",
  justifyContent: "space-around",
  alignItems: "center",
  width: "100%",
  padding: 12,
  backgroundColor: colors.white,
  borderTopWidth: 1,
  borderTopColor: colors.border,
  paddingBottom: 24,
  paddingTop: 16,
}

const $playerButton: ViewStyle = {
  backgroundColor: colors.palette.primary500,
  borderRadius: 100,
  borderWidth: 0,
  zIndex: 100,
  height: 52,
  width: 52,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
}

const $actionButton: ViewStyle = {
  backgroundColor: colors.palette.primary500,
  borderRadius: 100,
  borderWidth: 0,
  zIndex: 100,
  height: 36,
  width: 36,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
}

const $container: ViewStyle = {
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
}

const $fullscreenContainer: ViewStyle = {
  ...$container,
  paddingTop: 0, // Remove any padding when in fullscreen mode
}

const $pdf: ViewStyle = {
  flex: 1,
  width: Dimensions.get("window").width,
  height: Dimensions.get("window").height,
  shadowOpacity: 0,
  elevation: 0,
  backgroundColor: "white",
}

const $fullscreenPdf: ViewStyle = {
  ...$pdf,
  width: Dimensions.get("window").width,
  height: Dimensions.get("window").height,
  backgroundColor: "white",
}
