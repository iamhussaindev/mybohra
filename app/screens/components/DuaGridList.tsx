import { IconDotsVertical } from "@tabler/icons-react-native"
import { Text } from "app/components"
import { useSoundPlayer } from "app/hooks/useAudio"
// Removed manual analytics - using Firebase only
import { ILibrary } from "app/models/LibraryStore"
import { colors, spacing } from "app/theme"
import LottieView from "lottie-react-native"
import React, { useEffect, useRef } from "react"
import { Dimensions, TextStyle, View, ViewStyle, ImageStyle, Pressable, Image } from "react-native"
import ReactNativeHapticFeedback from "react-native-haptic-feedback"
import { State, Track } from "react-native-track-player"

const screenWidth = Dimensions.get("window").width

const convertListToGrid = (items: ILibrary[], columns?: number): ILibrary[][] | ILibrary[][][] => {
  // For HomeScreen: 4-column grid
  const grid: ILibrary[][] = []
  for (let i = 0; i < items.length; i += columns ?? 2) {
    grid.push(items.slice(i, i + (columns ?? 2)))
  }
  return grid
}

export default function DuaGridList({
  items,
  navigation,
  currentSound,
  handleItemLongPress,
  columns,
  title = "Daily Duas",
  pinnedIds = [],
  showOptions = true,
}: {
  items: ILibrary[]
  navigation: any
  currentSound?: Track
  duasScreen?: boolean
  title?: string
  handleItemLongPress?: (item: ILibrary) => void
  columns?: number
  pinnedIds?: number[]
  showOptions?: boolean
}) {
  // Removed manual analytics - using Firebase only

  return (
    <View style={$container}>
      <Text style={$header} text={title} weight="bold" preset="subheading" />
      <View style={$container}>
        {(convertListToGrid(items, columns) as ILibrary[][]).map((row, rowIndex) => (
          <View key={rowIndex} style={$rowContainer}>
            {row.map((item, itemIndex) => (
              <DuaCard
                key={item.id + itemIndex}
                currentSoundId={currentSound?.id ?? -1}
                navigation={navigation}
                item={item}
                isFirstInRow={itemIndex === 0}
                isLastInRow={itemIndex === row.length - 1}
                isFirstRow={rowIndex === 0}
                isLastRow={rowIndex === (convertListToGrid(items) as ILibrary[][]).length - 1}
                columns={columns}
                duasScreen={false}
                isPinned={pinnedIds.includes(item.id)}
                showOptions={showOptions}
                onLongPress={
                  handleItemLongPress ??
                  ((item: ILibrary) => {
                    // Trigger haptic feedback
                    ReactNativeHapticFeedback.trigger("impactMedium", {
                      enableVibrateFallback: true,
                      ignoreAndroidSystemSettings: false,
                    })

                    // Removed manual analytics - using Firebase only
                    console.log("Long press detected, opening bottom sheet for:", item.name)
                  })
                }
              />
            ))}
            {Array.from({ length: 4 - row.length }).map((_, emptyIndex) => (
              <View key={`empty-${emptyIndex}`} style={$emptySpace} />
            ))}
          </View>
        ))}
      </View>
    </View>
  )
}

const $header: TextStyle = {
  marginStart: spacing.lg,
}

interface DailyCardProps {
  item: ILibrary
  navigation: any
  currentSoundId: number
  isFirstInRow: boolean
  isLastInRow: boolean
  isFirstRow: boolean
  isLastRow: boolean
  duasScreen: boolean
  onLongPress: (item: ILibrary) => void
  columns?: number
  isPinned?: boolean
  showOptions?: boolean
}

function DuaCard(props: DailyCardProps) {
  const isCurrentPlaying = props.item.id === props.currentSoundId
  const { state } = useSoundPlayer()
  // Removed manual analytics - using Firebase only

  const handlePress = () => {
    // Removed manual analytics - using Firebase only
    props.navigation.navigate("PdfViewer", { ...props.item })
  }

  const handleLongPress = () => {
    // Trigger haptic feedback
    ReactNativeHapticFeedback.trigger("impactLight", {
      enableVibrateFallback: true,
      ignoreAndroidSystemSettings: false,
    })

    props.onLongPress(props.item)
  }

  const $soundAnimation = useRef<LottieView>(null)

  useEffect(() => {
    if (state === State.Playing && isCurrentPlaying) {
      $soundAnimation.current?.play()
    } else {
      $soundAnimation.current?.pause()
    }
  }, [state])

  return (
    <Pressable
      onPress={handlePress}
      onLongPress={props.showOptions ? handleLongPress : undefined}
      style={({ pressed }) => [
        { width: (screenWidth - spacing.lg * 2 - 10) / (props.columns ?? 2) },
        $cardStyle,
        !isCurrentPlaying
          ? { backgroundColor: colors.white }
          : {
              backgroundColor: colors.white,
            },
        pressed && $pressedCard,
      ]}
    >
      <View style={$cardContent}>
        {!isCurrentPlaying ? (
          <Image style={$cardPdfImage} source={require("../../../assets/images/pdf.png")} alt="" />
        ) : (
          <LottieView
            style={$cardLottie}
            source={require("../../../assets/animation/music.json")}
            autoPlay
            loop
            ref={$soundAnimation}
          />
        )}
        <Text style={$cardText} text={props.item.name} />
      </View>
      {/* {props.isPinned && (
        <View style={$pinnedIcon}>
          <IconHeartFilled size={16} color={colors.palette.primary500} />
        </View>
      )} */}
      {props.showOptions && (
        <Pressable
          onPress={props.showOptions ? handleLongPress : undefined}
          style={$longPressButton}
        >
          <IconDotsVertical size={18} color={colors.palette.neutral900} />
        </Pressable>
      )}
    </Pressable>
  )
}

const $longPressButton: ViewStyle = {
  position: "absolute",
  right: 0,
  bottom: 10,
  padding: spacing.sm,
  zIndex: 100,
  alignItems: "center",
  justifyContent: "center",
}

const $cardContent: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  gap: 4,
}

const $rowContainer: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-between",
  gap: 10,
  paddingHorizontal: spacing.lg,
}

const $cardPdfImage: ImageStyle = {
  height: 24,
  width: 24,
  position: "relative",
  zIndex: 100,
}

const $cardLottie: ViewStyle = {
  height: 24,
  width: 24,
  position: "relative",
  zIndex: 100,
}

const $cardStyle: ViewStyle = {
  borderWidth: 1,
  borderColor: colors.border,
  borderRadius: 10,
  paddingHorizontal: 10,
  borderCurve: "continuous",

  height: 60,
  display: "flex",
  justifyContent: "center",
  shadowColor: colors.gray,
  backgroundColor: colors.white,
  shadowOffset: {
    width: 2,
    height: 2,
  },
  shadowOpacity: 0.9,
  shadowRadius: 3.84,
  elevation: 5,
  marginBottom: 10,
}

const $cardText: TextStyle = {
  fontSize: 12,
  lineHeight: 14,
  flexWrap: "wrap",
  maxWidth: "70%",
}

const $pressedCard: ViewStyle = {
  backgroundColor: colors.gray,
  opacity: 0.8,
}

const $emptySpace: ViewStyle = {
  width: (screenWidth - spacing.lg * 2 - 30) / 2,
}

const $container: ViewStyle = {
  flexDirection: "column",
  marginTop: 10,
  overflow: "visible",
  marginBottom: 16,
}
