import { useNavigation } from "@react-navigation/native"
import { Icon, Screen, Text } from "app/components"
import Header from "app/components/Header"
import { useStores } from "app/models"
import { IYouTubeVideo } from "app/models/YouTubeStore"
import { AppStackScreenProps } from "app/navigators"
import { spacing } from "app/theme"
import { typography } from "app/theme/typography"
import { useColors } from "app/theme/useColors"
import { observer } from "mobx-react-lite"
import React, { FC, useCallback, useEffect, useState, useRef } from "react"
import {
  ViewStyle,
  FlatList,
  View,
  ActivityIndicator,
  TextStyle,
  ScrollView,
  Pressable,
} from "react-native"

import { YouTubeVideoCard } from "./components/YouTubeVideoCard"

interface SautulimanScreenProps extends AppStackScreenProps<"Sautuliman"> {}

export const SautulimanScreen: FC<SautulimanScreenProps> = observer(function SautulimanScreen() {
  const colors = useColors()
  const navigation = useNavigation()
  const { youtubeStore } = useStores()

  const [videos, setVideos] = useState<IYouTubeVideo[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [selectedFilter, setSelectedFilter] = useState<{
    type: "tag" | "category"
    value: string
  } | null>(null)
  const offsetRef = useRef(0)
  const pageSize = 20

  const loadingMoreRef = useRef(false)
  const hasMoreRef = useRef(true)

  const hasSetDefaultFilterRef = useRef(false)
  const hasFetchedTagsRef = useRef(false)

  // Fetch tags and categories on mount, then set default filter
  useEffect(() => {
    const loadTagsAndSetDefault = async () => {
      if (!hasFetchedTagsRef.current) {
        hasFetchedTagsRef.current = true
        await Promise.all([youtubeStore.fetchTags(), youtubeStore.fetchCategories()])

        // Set default filter immediately after fetching
        const tags = youtubeStore.getTags() as Array<{ tag: string; count: number }>
        const categories = youtubeStore.getCategories() as Array<{
          category: string
          count: number
        }>

        if (!hasSetDefaultFilterRef.current && (tags.length > 0 || categories.length > 0)) {
          // Combine and sort by count
          const allFilters = [
            ...tags.map((t) => ({ type: "tag" as const, value: t.tag, count: t.count })),
            ...categories.map((c) => ({
              type: "category" as const,
              value: c.category,
              count: c.count,
            })),
          ].sort((a, b) => b.count - a.count)

          // Select the most popular one (first in sorted list)
          if (allFilters.length > 0) {
            hasSetDefaultFilterRef.current = true
            setSelectedFilter({ type: allFilters[0].type, value: allFilters[0].value })
          }
        }
      }
    }

    loadTagsAndSetDefault()
  }, [youtubeStore])

  const fetchVideos = useCallback(
    async (isLoadMore = false) => {
      if (isLoadMore) {
        // Prevent multiple simultaneous loads
        if (loadingMoreRef.current || !hasMoreRef.current) return

        loadingMoreRef.current = true
        setLoadingMore(true)
        const currentOffset = offsetRef.current

        try {
          let items: IYouTubeVideo[] = []
          if (selectedFilter) {
            if (selectedFilter.type === "tag") {
              items = await youtubeStore.fetchVideosByTags([selectedFilter.value], {
                limit: pageSize,
                offset: currentOffset,
                sortBy: "view_count",
                sortOrder: "desc",
              })
            } else if (selectedFilter.type === "category") {
              items = await youtubeStore.fetchVideosByCategories([selectedFilter.value], {
                limit: pageSize,
                offset: currentOffset,
                sortBy: "view_count",
                sortOrder: "desc",
              })
            }
          } else {
            items = await youtubeStore.fetchVideosByTags([], {
              limit: pageSize,
              offset: currentOffset,
              sortBy: "view_count",
              sortOrder: "desc",
            })
          }

          if (items.length === 0) {
            hasMoreRef.current = false
            setHasMore(false)
          } else {
            setVideos((prev) => [...prev, ...items])
            offsetRef.current = currentOffset + items.length

            // If we got fewer items than requested, there are no more
            if (items.length < pageSize) {
              hasMoreRef.current = false
              setHasMore(false)
            }
          }
        } catch (error) {
          console.error("Error loading more Sautuliman videos:", error)
        } finally {
          loadingMoreRef.current = false
          setLoadingMore(false)
        }
        return
      }

      // Initial load
      setLoading(true)
      offsetRef.current = 0
      hasMoreRef.current = true
      setHasMore(true)
      setVideos([])

      try {
        let items: IYouTubeVideo[] = []
        if (selectedFilter) {
          if (selectedFilter.type === "tag") {
            items = await youtubeStore.fetchVideosByTags([selectedFilter.value], {
              limit: pageSize,
              offset: 0,
              sortBy: "view_count",
              sortOrder: "desc",
            })
          } else if (selectedFilter.type === "category") {
            items = await youtubeStore.fetchVideosByCategories([selectedFilter.value], {
              limit: pageSize,
              offset: 0,
              sortBy: "view_count",
              sortOrder: "desc",
            })
          }
        } else {
          items = await youtubeStore.fetchVideosByTags([], {
            limit: pageSize,
            offset: 0,
            sortBy: "view_count",
            sortOrder: "desc",
          })
        }

        if (items.length === 0) {
          hasMoreRef.current = false
          setHasMore(false)
        } else {
          setVideos(items)
          offsetRef.current = items.length
          // If we got fewer items than requested, there are no more
          if (items.length < pageSize) {
            hasMoreRef.current = false
            setHasMore(false)
          }
        }
      } catch (error) {
        console.error("Error loading Sautuliman videos:", error)
        setVideos([])
      } finally {
        setLoading(false)
      }
    },
    [youtubeStore, selectedFilter],
  )

  // Reload videos when filter changes (this will trigger after default filter is set)
  useEffect(() => {
    // Fetch videos when filter changes - the default filter will be set in the other useEffect
    if (selectedFilter !== null || hasSetDefaultFilterRef.current) {
      fetchVideos(false)
    }
  }, [selectedFilter, fetchVideos])

  const handleLoadMore = useCallback(() => {
    if (!loadingMore && hasMore) {
      fetchVideos(true)
    }
  }, [loadingMore, hasMore, fetchVideos])

  const handleVideoPress = useCallback(
    (item: IYouTubeVideo) => {
      ;(navigation as any).navigate("YouTubePlayer", { video: item })
    },
    [navigation],
  )

  const renderVideoItem = ({ item }: { item: IYouTubeVideo }) => {
    return <YouTubeVideoCard item={item} onPress={handleVideoPress} />
  }

  const tags = youtubeStore.getTags() as Array<{ tag: string; count: number }>
  const categories = youtubeStore.getCategories() as Array<{ category: string; count: number }>

  // Combine tags and categories for tabs
  const allFilters = [
    ...tags.map((t) => ({ type: "tag" as const, value: t.tag, label: t.tag, count: t.count })),
    ...categories.map((c) => ({
      type: "category" as const,
      value: c.category,
      label: c.category,
      count: c.count,
    })),
  ].sort((a, b) => b.count - a.count) // Sort by count descending

  return (
    <Screen
      preset="fixed"
      backgroundColor={colors.background}
      safeAreaEdges={["top"]}
      contentContainerStyle={$screenContainer(colors)}
    >
      <Header
        title="Sautuliman Videos"
        showBackButton
        rightActions={
          <Pressable
            onPress={() => {
              ;(navigation as any).navigate("YouTubeSearch")
            }}
            hitSlop={8}
          >
            <Icon icon="search" size={20} color={colors.text} />
          </Pressable>
        }
      />
      <View style={$tabsContainer(colors)}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={$tabsContent}
          keyboardShouldPersistTaps="handled"
        >
          {allFilters.map((filter, idx) => {
            const isSelected =
              selectedFilter?.type === filter.type && selectedFilter?.value === filter.value
            return (
              <Pressable
                style={[
                  $tabItem(colors, isSelected),
                  idx === allFilters.length - 1 && { marginEnd: spacing.md },
                ]}
                key={`${filter.type}-${filter.value}`}
                onPress={() => {
                  const newFilter = isSelected ? null : { type: filter.type, value: filter.value }
                  setSelectedFilter(newFilter)
                }}
              >
                <Text style={$tabItemText(colors, isSelected)}>{filter.label}</Text>
              </Pressable>
            )
          })}
        </ScrollView>
      </View>
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
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={
            !loading ? (
              <View style={$emptyContainer}>
                <Text style={$emptyText(colors)}>No videos found</Text>
              </View>
            ) : null
          }
          ListFooterComponent={
            loadingMore ? (
              <View style={$loadingMoreContainer}>
                <ActivityIndicator size="small" color={colors.palette.primary500} />
              </View>
            ) : !hasMore && videos.length > 0 ? (
              <View style={$endOfListContainer}>
                {/* <Text style={$endOfListText(colors)}>No more videos</Text> */}
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

const $loadingMoreContainer: ViewStyle = {
  paddingVertical: spacing.lg,
  alignItems: "center",
}

const $endOfListContainer: ViewStyle = {
  paddingVertical: spacing.md,
  alignItems: "center",
}

const $endOfListText = (colors: any): TextStyle => ({
  fontSize: 14,
  color: colors.palette.neutral500,
})

const $tabsContainer = (_colors: any): ViewStyle => ({
  marginStart: spacing.md,
  marginBottom: spacing.md,
  gap: spacing.md,
})

const $tabsContent: ViewStyle = {
  gap: spacing.xs,
}

const $tabItem = (colors: any, isSelected: boolean): ViewStyle => ({
  paddingHorizontal: spacing.sm,
  paddingVertical: spacing.xxxs,
  borderRadius: 100,
  borderWidth: 1,
  borderColor: isSelected ? colors.palette.primary500 : colors.palette.neutral400,
  backgroundColor: isSelected ? colors.palette.primary100 : colors.palette.neutral200,
})

const $tabItemText = (colors: any, isSelected: boolean): TextStyle => ({
  fontSize: 14,
  fontFamily: typography.primary.medium,
  color: isSelected ? colors.palette.primary600 : colors.palette.neutral900,
  textTransform: "capitalize",
})
