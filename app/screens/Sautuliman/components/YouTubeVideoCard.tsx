import { IconBrandYoutube } from "@tabler/icons-react-native"
import { Text } from "app/components"
import { IYouTubeVideo } from "app/models/YouTubeStore"
import { spacing } from "app/theme"
import { typography } from "app/theme/typography"
import { useColors } from "app/theme/useColors"
import React, { useCallback, useState } from "react"
import {
  ViewStyle,
  TextStyle,
  View,
  TouchableHighlight,
  Image,
  ImageStyle,
  Pressable,
} from "react-native"
import YoutubePlayer from "react-native-youtube-iframe"

interface YouTubeVideoCardProps {
  item: IYouTubeVideo
  onPress?: (item: IYouTubeVideo) => void
}

// Helper function to format duration
const formatDuration = (seconds: number | null): string => {
  if (!seconds) return ""
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }
  return `${minutes}:${secs.toString().padStart(2, "0")}`
}

export function YouTubeVideoCard({ item, onPress }: YouTubeVideoCardProps) {
  const colors = useColors()
  const [playing, setPlaying] = useState(false)
  const [showPlayer, setShowPlayer] = useState(false)

  const onStateChange = useCallback((state: string) => {
    if (state === "ended") {
      setPlaying(false)
    }
  }, [])

  const handleCardPress = useCallback(() => {
    if (onPress) {
      onPress(item)
    } else {
      // Toggle player or open in browser
      setShowPlayer(!showPlayer)
    }
  }, [item, onPress, showPlayer])

  const handleThumbnailPress = useCallback(() => {
    setShowPlayer(true)
  }, [])

  const thumbnailUrl =
    item.thumbnail_high || item.thumbnail_medium || item.thumbnail || item.thumbnail_default

  return (
    <View style={$videoCardContainer}>
      {showPlayer ? (
        <View style={$videoCard(colors)}>
          <YoutubePlayer
            height={220}
            play={playing}
            videoId={item.video_id}
            onChangeState={onStateChange}
          />
          <Pressable style={$closeButton(colors)} onPress={() => setShowPlayer(false)} hitSlop={8}>
            <Text style={$closeButtonText}>Close</Text>
          </Pressable>
        </View>
      ) : (
        <TouchableHighlight
          underlayColor={colors.palette.neutral200}
          onPress={handleCardPress}
          style={$videoCard(colors)}
        >
          <View style={$videoCardContent}>
            {/* Thumbnail */}
            <Pressable onPress={handleThumbnailPress} style={$thumbnailContainer}>
              {thumbnailUrl ? (
                <Image source={{ uri: thumbnailUrl }} style={$thumbnail} />
              ) : (
                <View style={$thumbnailPlaceholder(colors)}>
                  <IconBrandYoutube size={32} color={colors.palette.primary500} />
                </View>
              )}
              {/* Play overlay */}
              <View style={$playOverlay}>
                {/* <View style={$playButton()}>
                  <IconBrandYoutube
                    size={24}
                    color={colors.palette.neutral100}
                    fill={colors.palette.neutral100}
                  />
                </View> */}
              </View>
              {/* Duration badge */}
              {item.duration && (
                <View style={$durationBadge()}>
                  <Text style={$durationText}>{formatDuration(item.duration)}</Text>
                </View>
              )}
            </Pressable>

            {/* Video Info */}
            <View style={$videoInfo}>
              <Text
                color={colors.text}
                text={item.title}
                style={$videoTitle}
                numberOfLines={2}
                weight="medium"
              />

              <View style={$metadataRow}>
                {item.upload_date && item.view_count && (
                  <Text color={colors.palette.neutral500} text=" • " style={$metadataText} />
                )}
                {item.upload_date && (
                  <Text
                    color={colors.palette.neutral500}
                    text={item.upload_date}
                    style={$metadataText}
                  />
                )}
              </View>
              {item.description && (
                <Text
                  color={colors.palette.neutral600}
                  text={item.description}
                  style={$videoDescription}
                  numberOfLines={2}
                />
              )}
            </View>
          </View>
        </TouchableHighlight>
      )}
    </View>
  )
}

const $videoCardContainer: ViewStyle = {
  marginBottom: spacing.md,
  paddingHorizontal: spacing.md,
}

const $videoCard = (colors: any): ViewStyle => ({
  backgroundColor: colors.background,
  borderRadius: 12,
  overflow: "hidden",
})

const $videoCardContent: ViewStyle = {
  flexDirection: "row",
}

const $thumbnailContainer: ViewStyle = {
  width: 160,
  height: 90,
  borderRadius: 8,
  overflow: "hidden",
  marginRight: spacing.md,
  position: "relative",
  borderWidth: 1,
  borderColor: "#f4f5f9",
}

const $thumbnail: ImageStyle = {
  width: "100%",
  height: "100%",
  resizeMode: "cover",
}

const $thumbnailPlaceholder = (colors: any): ViewStyle => ({
  width: "100%",
  height: "100%",
  backgroundColor: colors.palette.primary100,
  justifyContent: "center",
  alignItems: "center",
})

const $playOverlay: ViewStyle = {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  justifyContent: "center",
  alignItems: "center",
}

const $playButton = (): ViewStyle => ({
  width: 48,
  height: 48,
  borderRadius: 24,
  backgroundColor: "rgba(0, 0, 0, 0.7)",
  justifyContent: "center",
  alignItems: "center",
})

const $durationBadge = (): ViewStyle => ({
  position: "absolute",
  bottom: 4,
  right: 4,
  backgroundColor: "rgba(0, 0, 0, 0.8)",
  paddingHorizontal: 6,
  paddingVertical: 2,
  borderRadius: 4,
})

const $durationText: TextStyle = {
  fontSize: 11,
  fontFamily: typography.primary.bold,
  color: "#fff",
}

const $videoInfo: ViewStyle = {
  flex: 1,
  justifyContent: "flex-start",
}

const $videoTitle: TextStyle = {
  fontSize: 16,
  fontFamily: typography.primary.medium,
  marginBottom: spacing.xxs,
  lineHeight: 20,
}

const $metadataRow: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  marginBottom: spacing.xs,
}

const $metadataText: TextStyle = {
  fontSize: 12,
  fontFamily: typography.primary.normal,
}

const $videoDescription: TextStyle = {
  fontSize: 13,
  fontFamily: typography.primary.normal,
  lineHeight: 18,
}

const $closeButton = (colors: any): ViewStyle => ({
  padding: spacing.sm,
  backgroundColor: colors.palette.neutral200,
  alignItems: "center",
})

const $closeButtonText: TextStyle = {
  fontSize: 14,
  fontFamily: typography.primary.medium,
  color: "#000",
}
