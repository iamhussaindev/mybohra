import { Text } from "app/components"
import { useSoundPlayer } from "app/hooks/useAudio"
// Removed manual analytics - using Firebase only
import { ILibrary } from "app/models/LibraryStore"
import { colors, spacing } from "app/theme"
import { useColors } from "app/theme/useColors"
import LottieView from "lottie-react-native"
import React, { useEffect, useRef } from "react"
import {
  Dimensions,
  TextStyle,
  View,
  ViewStyle,
  ImageStyle,
  Pressable,
  TouchableOpacity,
  Image,
} from "react-native"
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
  hideTitle = false,
  items,
  navigation,
  currentSound,
  handleItemLongPress,
  columns,
  title = "Daily Duas",
  pinnedIds = [],
  showOptions = true,
  onViewAll,
}: {
  hideTitle?: boolean
  items: ILibrary[]
  navigation: any
  currentSound?: Track
  duasScreen?: boolean
  title?: string
  handleItemLongPress?: (item: ILibrary) => void
  columns?: number
  pinnedIds?: number[]
  showOptions?: boolean
  onViewAll?: () => void
}) {
  const colors = useColors()

  return (
    <View style={$container}>
      {!hideTitle && (
        <View style={$headerContainer}>
          <Text
            style={$header}
            color={colors.text}
            text={title}
            weight="bold"
            preset="subheading"
          />
          {onViewAll && (
            <TouchableOpacity onPress={onViewAll} style={$viewAllButton}>
              <Text weight="bold" style={$viewAllText} text="View All" preset="formHelper" />
            </TouchableOpacity>
          )}
        </View>
      )}
      <View style={$container}>
        {(convertListToGrid(items, columns) as ILibrary[][]).map((row, rowIndex) => (
          <View key={rowIndex} style={$rowContainer}>
            {row.map((item, itemIndex) => (
              <DuaCard
                key={item.id + itemIndex + item.name}
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

const $headerContainer: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  paddingHorizontal: spacing.lg,
  marginBottom: spacing.xs,
}

const $header: TextStyle = {
  flex: 1,
}

const $viewAllButton: ViewStyle = {
  paddingHorizontal: spacing.xs,
  borderWidth: 1,
  borderColor: colors.palette.primary500,
  borderRadius: 8,
}

const $viewAllText: TextStyle = {
  color: colors.palette.primary500,
  fontWeight: "800",
  fontSize: 12,
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

  const handlePress = () => {
    props.navigation.navigate("PdfViewer", { ...props.item })
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
      style={[
        $cardContainer,
        props.columns === 1
          ? { width: screenWidth - spacing.lg * 2 }
          : { width: (screenWidth - spacing.lg * 2 - 10) / (props.columns ?? 2) },
      ]}
    >
      <View style={$cardContent}>
        {!isCurrentPlaying ? (
          <View style={$cardPdfImage}>
            <Image source={require("../../../assets/icons/pdf.png")} style={$pdfImage} />
          </View>
        ) : (
          <LottieView
            style={$cardLottie}
            source={require("../../../assets/animation/music.json")}
            autoPlay
            loop
            ref={$soundAnimation}
          />
        )}
        <Text
          lineBreakMode="tail"
          numberOfLines={2}
          ellipsizeMode="tail"
          style={[$cardText, props.columns === 1 ? $cardTextFull : {}]}
          text={props.item.name}
        />
      </View>

      {/* {props.showOptions && (
        <Pressable
          onPress={props.showOptions ? handleLongPress : undefined}
          style={$longPressButton}
        >
          <IconDotsVertical size={18} color={colors.palette.neutral900} />
        </Pressable>
      )} */}
    </Pressable>
  )
}

const $pdfImage: ImageStyle = {
  height: 24,
  width: 24,
}

const $cardTextFull: TextStyle = {
  width: "100%",

  fontSize: 15,
}

// const $longPressButton: ViewStyle = {
//   position: "absolute",
//   height: 60,
//   right: 0,
//   padding: spacing.sm,
//   zIndex: 100,
//   alignItems: "center",
//   justifyContent: "center",
// }

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
  height: 32,
  width: 32,
  position: "relative",
  zIndex: 100,
  borderRadius: 32,
  padding: 4,
  alignItems: "center",
  justifyContent: "center",
  marginRight: 4,
}

const $cardLottie: ViewStyle = {
  height: 24,
  width: 24,
  position: "relative",
  zIndex: 100,
}

const $cardContainer: ViewStyle = {
  position: "relative",
  zIndex: 100,
  marginBottom: spacing.sm,
  borderWidth: 1,
  borderColor: colors.border,
  borderRadius: 10,
  height: 60,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "flex-start",
  paddingHorizontal: 8,
  shadowOpacity: 0.02,
  shadowRadius: 4,
  shadowOffset: { width: 0, height: 5 },
  backgroundColor: colors.white,
  borderCurve: "continuous",
}

const $cardText: TextStyle = {
  fontSize: 14,
  lineHeight: 18,
  flexWrap: "wrap",
  textTransform: "capitalize",
  maxWidth: "75%",
}

const $emptySpace: ViewStyle = {
  width: (screenWidth - spacing.lg * 2 - 30) / 2,
}

const $container: ViewStyle = {
  flexDirection: "column",
  marginTop: 10,
  overflow: "visible",
  marginBottom: 16,
  // backgroundColor: colors.palette.neutral100,
}
