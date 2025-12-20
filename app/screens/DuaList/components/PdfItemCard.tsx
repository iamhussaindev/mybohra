import { IconDotsVertical } from "@tabler/icons-react-native"
import { Text } from "app/components"
import { ILibrary } from "app/models/LibraryStore"
import { spacing } from "app/theme"
import { typography } from "app/theme/typography"
import { useColors } from "app/theme/useColors"
import { momentTime } from "app/utils/currentTime"
import React, { useRef } from "react"
import {
  View,
  ViewStyle,
  Pressable,
  TouchableHighlight,
  Image,
  ImageStyle,
  TextStyle,
} from "react-native"
import ReactNativeHapticFeedback from "react-native-haptic-feedback"

// Helper function to format relative time
const formatTimeAgo = (dateString: string): string => {
  const date = momentTime(new Date(dateString))
  const now = momentTime()
  const diffInHours = now.diff(date, "hours")
  const diffInDays = now.diff(date, "days")

  if (diffInHours < 1) {
    const diffInMinutes = now.diff(date, "minutes")
    if (diffInMinutes < 1) return "Just now"
    return `Opened ${diffInMinutes} ${diffInMinutes === 1 ? "minute" : "minutes"} ago`
  } else if (diffInHours < 24) {
    return `Opened ${diffInHours} ${diffInHours === 1 ? "hour" : "hours"} ago`
  } else if (diffInDays < 7) {
    return `Opened ${diffInDays} ${diffInDays === 1 ? "day" : "days"} ago`
  } else {
    return date.format("MMM D, YYYY")
  }
}

interface PdfItemCardProps {
  item: ILibrary & { lastOpened?: string }
  onPress: (item: ILibrary) => void
  onLongPress?: (
    item: ILibrary,
    position: { x: number; y: number; width: number; height: number },
  ) => void
  onOptionsPress: (item: ILibrary) => void
}

export function PdfItemCard({ item, onPress, onLongPress, onOptionsPress }: PdfItemCardProps) {
  const colors = useColors()
  const itemRef = useRef<View>(null)
  const timeAgo = item.lastOpened ? formatTimeAgo(item.lastOpened) : ""

  const handleLongPress = (e: any) => {
    e.stopPropagation()
    // Trigger stronger haptic feedback on long press
    try {
      ReactNativeHapticFeedback.trigger("impactMedium", {
        enableVibrateFallback: true,
        ignoreAndroidSystemSettings: false,
      })
    } catch (error) {
      console.log("Haptic feedback error:", error)
    }

    // Measure the item position
    if (onLongPress && itemRef.current) {
      itemRef.current.measure((x, y, width, height, pageX, pageY) => {
        onLongPress(item, {
          x: pageX,
          y: pageY,
          width,
          height,
        })
      })
    }
  }

  const handleOptionsPress = (e: any) => {
    e.stopPropagation()
    // Trigger haptic feedback on press
    try {
      ReactNativeHapticFeedback.trigger("impactLight", {
        enableVibrateFallback: true,
        ignoreAndroidSystemSettings: false,
      })
    } catch (error) {
      console.log("Haptic feedback error:", error)
    }
    onOptionsPress(item)
  }

  return (
    <View ref={itemRef} collapsable={false}>
      <TouchableHighlight
        underlayColor={colors.palette.neutral200}
        onPress={() => onPress(item)}
        onLongPress={onLongPress ? handleLongPress : undefined}
        style={$pdfCard(colors)}
      >
        <View style={$pdfCardContent}>
          <View style={$pdfIconContainer}>
            <Image source={require("../../../../assets/images/file.png")} style={$icon} />
          </View>
          <View style={$pdfTextContainer}>
            <Text
              color={colors.text}
              text={item.name}
              style={$pdfTitle}
              numberOfLines={2}
              weight="medium"
            />
            {timeAgo && <Text color={colors.text} text={timeAgo} style={$pdfTimestamp(colors)} />}
          </View>
          <Pressable
            onPress={handleOptionsPress}
            style={({ pressed }) => [$bookmarkButton, pressed && $bookmarkButtonPressed(colors)]}
            hitSlop={8}
          >
            <IconDotsVertical size={20} color={colors.palette.neutral800} />
          </Pressable>
        </View>
      </TouchableHighlight>
    </View>
  )
}

const $pdfCard = (colors: any): ViewStyle => ({
  backgroundColor: colors.background,
  marginBottom: spacing.sm,
  paddingHorizontal: spacing.sm,
  paddingVertical: spacing.xxs,
  borderColor: colors.border,
})

const $pdfCardContent: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
}

const $pdfIconContainer: ViewStyle = {
  width: 40,
  height: 40,
  justifyContent: "center",
  alignItems: "center",
  marginRight: spacing.md,
}

const $icon: ImageStyle = {
  width: 24,
  height: 24,
}

const $pdfTextContainer: ViewStyle = {
  flex: 1,
  justifyContent: "center",
}

const $pdfTitle: TextStyle = {
  fontSize: 16,
  fontFamily: typography.primary.medium,
  textTransform: "capitalize",
}

const $pdfTimestamp = (colors: any): TextStyle => ({
  fontSize: 13,
  fontFamily: typography.primary.normal,
  color: colors.palette.neutral500,
})

const $bookmarkButton: ViewStyle = {
  padding: spacing.xs,
  justifyContent: "center",
  alignItems: "center",
  borderRadius: 8,
}

const $bookmarkButtonPressed = (colors: any): ViewStyle => ({
  backgroundColor: colors.palette.neutral200,
})
