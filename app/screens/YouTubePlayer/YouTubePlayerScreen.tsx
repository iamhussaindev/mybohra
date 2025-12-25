import { Screen, Text } from "app/components"
import Header from "app/components/Header"
import { useStores } from "app/models"
import { IYouTubeVideo } from "app/models/YouTubeStore"
import { AppStackScreenProps } from "app/navigators"
import { spacing } from "app/theme"
import { typography } from "app/theme/typography"
import { useColors } from "app/theme/useColors"
import { observer } from "mobx-react-lite"
import React, { FC, useCallback, useEffect, useState } from "react"
import {
  ViewStyle,
  FlatList,
  View,
  ActivityIndicator,
  TextStyle,
  ImageStyle,
  Image,
  TouchableOpacity,
  Dimensions,
} from "react-native"
import YoutubePlayer from "react-native-youtube-iframe"

interface YouTubePlayerScreenProps extends AppStackScreenProps<"YouTubePlayer"> {}

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

export const YouTubePlayerScreen: FC<YouTubePlayerScreenProps> = observer(
  function YouTubePlayerScreen(props) {
    const colors = useColors()
    const { youtubeStore } = useStores()
    const [playing, setPlaying] = useState(true)
    const [recommendations, setRecommendations] = useState<IYouTubeVideo[]>([])
    const [loading, setLoading] = useState(false)
    const [currentVideo, setCurrentVideo] = useState<IYouTubeVideo | null>(
      props.route.params?.video as IYouTubeVideo | null,
    )

    // Update current video when route params change
    useEffect(() => {
      if (props.route.params?.video) {
        setCurrentVideo(props.route.params.video as IYouTubeVideo)
        setPlaying(true)
      }
    }, [props.route.params?.video])

    // Ensure video autoplays when currentVideo changes
    useEffect(() => {
      if (currentVideo) {
        setPlaying(true)
      }
    }, [currentVideo?.video_id])

    // Get recommendations based on current video's categories/tags
    useEffect(() => {
      if (!currentVideo) {
        setRecommendations([])
        return
      }

      const fetchRecommendations = async () => {
        setLoading(true)
        try {
          // Fetch videos with similar categories or tags, excluding current video
          const tags = currentVideo.tags || []
          const categories = currentVideo.categories || []

          let fetchedVideos: IYouTubeVideo[] = []

          // Try to get videos by tags first
          if (tags.length > 0) {
            fetchedVideos = await youtubeStore.fetchVideosByTags(tags, {
              limit: 20,
              sortBy: "view_count",
              sortOrder: "desc",
            })
          } else if (categories.length > 0) {
            // Fall back to categories
            fetchedVideos = await youtubeStore.fetchVideosByCategories(categories, {
              limit: 20,
              sortBy: "view_count",
              sortOrder: "desc",
            })
          } else {
            // Fall back to general videos sorted by views
            fetchedVideos = await youtubeStore.fetchVideosSortedByViews({
              limit: 20,
            })
          }

          // Filter out current video and limit to 10 recommendations
          const filtered = fetchedVideos
            .filter((video) => video.video_id !== currentVideo.video_id)
            .slice(0, 10)

          setRecommendations(filtered)
        } catch (error) {
          console.error("Error loading recommendations:", error)
          setRecommendations([])
        } finally {
          setLoading(false)
        }
      }

      fetchRecommendations()
    }, [currentVideo, youtubeStore])

    const onStateChange = useCallback((state: string) => {
      if (state === "ended") {
        setPlaying(false)
      } else if (state === "playing") {
        setPlaying(true)
      } else if (state === "paused") {
        setPlaying(false)
      }
    }, [])

    // Auto-play when player is ready
    const onReady = useCallback(() => {
      setPlaying(true)
    }, [])

    const handleVideoSelect = useCallback((video: IYouTubeVideo) => {
      // Update current video and reset playing state
      // Recommendations will be automatically fetched via useEffect when currentVideo changes
      setCurrentVideo(video)
      setPlaying(true)
    }, [])

    const renderRecommendationItem = useCallback(
      ({ item }: { item: IYouTubeVideo }) => {
        const thumbnailUrl =
          item.thumbnail_high || item.thumbnail_medium || item.thumbnail || item.thumbnail_default

        return (
          <TouchableOpacity
            style={$recommendationItem(colors)}
            onPress={() => handleVideoSelect(item)}
            activeOpacity={0.7}
          >
            <View style={$recommendationThumbnailContainer}>
              {thumbnailUrl ? (
                <Image source={{ uri: thumbnailUrl }} style={$recommendationThumbnail} />
              ) : (
                <View style={$recommendationThumbnailPlaceholder(colors)} />
              )}
              {item.duration && (
                <View style={$durationBadge}>
                  <Text style={$durationText}>{formatDuration(item.duration)}</Text>
                </View>
              )}
            </View>
            <View style={$recommendationInfo}>
              <Text
                text={item.title}
                style={$recommendationTitle}
                numberOfLines={2}
                weight="medium"
                color={colors.text}
              />
            </View>
          </TouchableOpacity>
        )
      },
      [colors, handleVideoSelect],
    )

    if (!currentVideo) {
      return (
        <Screen preset="fixed" backgroundColor={colors.background} safeAreaEdges={["top"]}>
          <Header title="YouTube Player" showBackButton />
          <View style={$errorContainer}>
            <Text style={$errorText(colors)}>No video selected</Text>
          </View>
        </Screen>
      )
    }

    const screenWidth = Dimensions.get("window").width
    const playerHeight = (screenWidth * 9) / 16 // 16:9 aspect ratio

    return (
      <Screen
        preset="fixed"
        backgroundColor={colors.background}
        safeAreaEdges={["top"]}
        contentContainerStyle={$screenContainer(colors)}
      >
        <Header title="YouTube Player" showBackButton />
        <View style={$playerContainer}>
          <YoutubePlayer
            key={currentVideo.video_id}
            height={playerHeight}
            play={playing}
            videoId={currentVideo.video_id}
            onChangeState={onStateChange}
            onReady={onReady}
            webViewStyle={{ opacity: 0.99 } as any}
          />
          <View style={$videoInfoContainer(colors)}>
            <Text
              text={currentVideo.title}
              style={$videoTitle}
              numberOfLines={2}
              weight="bold"
              color={colors.text}
            />
          </View>
        </View>
        <View style={$recommendationsContainer}>
          <Text
            text="Recommendations"
            style={$recommendationsTitle}
            weight="bold"
            color={colors.text}
          />
          {loading ? (
            <View style={$loadingContainer}>
              <ActivityIndicator size="small" color={colors.palette.primary500} />
            </View>
          ) : (
            <FlatList
              data={recommendations}
              renderItem={renderRecommendationItem}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={$recommendationsList}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                !loading ? (
                  <View style={$emptyContainer}>
                    <Text style={$emptyText(colors)}>No recommendations available</Text>
                  </View>
                ) : null
              }
            />
          )}
        </View>
      </Screen>
    )
  },
)

const $screenContainer = (colors: any): ViewStyle => ({
  flex: 1,
  backgroundColor: colors.background,
})

const $playerContainer: ViewStyle = {
  backgroundColor: "#000",
}

const $videoInfoContainer = (colors: any): ViewStyle => ({
  padding: spacing.md,
  backgroundColor: colors.background,
  borderBottomWidth: 1,
  borderBottomColor: colors.border,
})

const $videoTitle: TextStyle = {
  fontSize: 18,
  fontFamily: typography.primary.bold,
  marginBottom: spacing.xs,
  lineHeight: 24,
}

const $recommendationsContainer: ViewStyle = {
  flex: 1,
}

const $recommendationsTitle: TextStyle = {
  fontSize: 18,
  fontFamily: typography.primary.bold,
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.sm,
}

const $recommendationsList: ViewStyle = {
  paddingBottom: spacing.lg,
}

const $recommendationItem = (colors: any): ViewStyle => ({
  flexDirection: "row",
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.xs,
  backgroundColor: colors.background,
})

const $recommendationThumbnailContainer: ViewStyle = {
  width: 160 / 1.5,
  height: 90 / 1.5,
  borderRadius: 8,
  overflow: "hidden",
  marginRight: spacing.md,
  position: "relative",
}

const $recommendationThumbnail: ImageStyle = {
  width: "100%",
  height: "100%",
  resizeMode: "cover",
}

const $recommendationThumbnailPlaceholder = (colors: any): ViewStyle => ({
  width: "100%",
  height: "100%",
  backgroundColor: colors.palette.neutral200,
})

const $durationBadge: ViewStyle = {
  position: "absolute",
  bottom: 4,
  right: 4,
  backgroundColor: "rgba(0, 0, 0, 0.8)",
  paddingHorizontal: 6,
  paddingVertical: 2,
  borderRadius: 4,
}

const $durationText: TextStyle = {
  fontSize: 11,
  fontFamily: typography.primary.bold,
  color: "#fff",
}

const $recommendationInfo: ViewStyle = {
  flex: 1,
  justifyContent: "flex-start",
}

const $recommendationTitle: TextStyle = {
  fontSize: 14,
  fontFamily: typography.primary.medium,
  marginBottom: spacing.xxs,
  lineHeight: 18,
}

const $loadingContainer: ViewStyle = {
  paddingVertical: spacing.lg,
  alignItems: "center",
}

const $emptyContainer: ViewStyle = {
  paddingVertical: spacing.xl,
  alignItems: "center",
}

const $emptyText = (colors: any): TextStyle => ({
  fontSize: 14,
  color: colors.palette.neutral500,
})

const $errorContainer: ViewStyle = {
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
}

const $errorText = (colors: any): TextStyle => ({
  fontSize: 16,
  color: colors.palette.neutral500,
})
