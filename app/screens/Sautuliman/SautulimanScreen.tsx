import { Screen, Text } from "app/components"
import Header from "app/components/Header"
import { useStores } from "app/models"
import { IYouTubeVideo } from "app/models/YouTubeStore"
import { AppStackScreenProps } from "app/navigators"
import { spacing } from "app/theme"
import { useColors } from "app/theme/useColors"
import { observer } from "mobx-react-lite"
import React, { FC, useCallback, useEffect, useState } from "react"
import { ViewStyle, FlatList, View, ActivityIndicator, TextStyle } from "react-native"

import { YouTubeVideoCard } from "./components/YouTubeVideoCard"

interface SautulimanScreenProps extends AppStackScreenProps<"Sautuliman"> {}

export const SautulimanScreen: FC<SautulimanScreenProps> = observer(function SautulimanScreen() {
  const colors = useColors()
  const { youtubeStore } = useStores()

  const [videos, setVideos] = useState<IYouTubeVideo[]>([])
  const [loading, setLoading] = useState(false)

  const fetchVideos = useCallback(async () => {
    setLoading(true)
    try {
      const items = await youtubeStore.fetchVideosByTags([], {
        limit: 50,
        sortBy: "created_at",
        sortOrder: "desc",
      })
      setVideos(items)
    } catch (error) {
      console.error("Error loading Sautuliman videos:", error)
      setVideos([])
    } finally {
      setLoading(false)
    }
  }, [youtubeStore])

  useEffect(() => {
    fetchVideos()
  }, [fetchVideos])

  const handleVideoPress = useCallback((item: IYouTubeVideo) => {
    // Video playback is handled in YouTubeVideoCard
    // This can be used for navigation or other actions in the future
  }, [])

  const renderVideoItem = ({ item }: { item: IYouTubeVideo }) => {
    return <YouTubeVideoCard item={item} onPress={handleVideoPress} />
  }

  console.log("videos", videos)

  return (
    <Screen
      preset="fixed"
      backgroundColor={colors.background}
      safeAreaEdges={["top"]}
      contentContainerStyle={$screenContainer(colors)}
    >
      <Header title="Sautuliman" showBackButton />
      {loading ? (
        <View style={$loadingContainer}>
          <ActivityIndicator size="large" color={colors.palette.primary500} />
        </View>
      ) : (
        <FlatList
          data={videos}
          renderItem={renderVideoItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={$listContent}
          ListEmptyComponent={
            !loading ? (
              <View style={$emptyContainer}>
                <Text style={$emptyText(colors)}>No videos found</Text>
              </View>
            ) : null
          }
        />
      )}
    </Screen>
  )
})

const $screenContainer = (colors: any): ViewStyle => ({
  flex: 1,
  backgroundColor: colors.background,
})

const $loadingContainer: ViewStyle = {
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
}

const $listContent: ViewStyle = {
  paddingVertical: spacing.md,
}

const $emptyContainer: ViewStyle = {
  paddingVertical: spacing.xxl,
  alignItems: "center",
}

const $emptyText = (colors: any): TextStyle => ({
  fontSize: 16,
  color: colors.palette.neutral500,
})
