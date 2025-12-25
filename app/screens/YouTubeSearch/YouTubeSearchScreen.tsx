import { IconChevronLeft } from "@tabler/icons-react-native"
import { Screen, Text } from "app/components"
import { shadowProps } from "app/helpers/shadow.helper"
import { useStores } from "app/models"
import { IYouTubeVideo } from "app/models/YouTubeStore"
import { AppStackScreenProps } from "app/navigators"
import { spacing, typography } from "app/theme"
import { useColors } from "app/theme/useColors"
import { observer } from "mobx-react-lite"
import React, { useEffect, useRef, useState, useCallback } from "react"
import {
  FlatList,
  Pressable,
  TextInput,
  TextStyle,
  View,
  ViewStyle,
  ActivityIndicator,
} from "react-native"

import { YouTubeVideoCard } from "../Sautuliman/components/YouTubeVideoCard"

type YouTubeSearchScreenProps = AppStackScreenProps<"YouTubeSearch">

export const YouTubeSearchScreen: React.FC<YouTubeSearchScreenProps> = observer(
  function YouTubeSearchScreen(props) {
    const { navigation } = props
    const colors = useColors()
    const { youtubeStore } = useStores()
    const [query, setQuery] = useState("")
    const [searchResults, setSearchResults] = useState<IYouTubeVideo[]>([])
    const [isSearching, setIsSearching] = useState(false)
    const [hasSearched, setHasSearched] = useState(false)

    const inputRef = useRef<TextInput>(null)
    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)

    useEffect(() => {
      // Focus input immediately when screen opens
      const timeout = setTimeout(() => {
        inputRef.current?.focus()
      }, 100)

      return () => clearTimeout(timeout)
    }, [])

    // Debounced search function
    const performSearch = useCallback(
      async (searchQuery: string) => {
        if (!searchQuery.trim()) {
          setSearchResults([])
          setIsSearching(false)
          setHasSearched(false)
          return
        }

        setIsSearching(true)
        setHasSearched(true)

        try {
          const results = await youtubeStore.searchVideos(searchQuery.trim(), 50)
          setSearchResults(results)
        } catch (error) {
          console.error("Error searching YouTube videos:", error)
          setSearchResults([])
        } finally {
          setIsSearching(false)
        }
      },
      [youtubeStore],
    )

    // Handle query changes with debouncing
    useEffect(() => {
      // Clear previous timeout
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }

      if (!query.trim()) {
        setSearchResults([])
        setIsSearching(false)
        setHasSearched(false)
        return
      }

      // Set loading state immediately
      setIsSearching(true)
      setHasSearched(true)

      // Debounce the search by 500ms
      searchTimeoutRef.current = setTimeout(() => {
        performSearch(query)
      }, 500)

      return () => {
        if (searchTimeoutRef.current) {
          clearTimeout(searchTimeoutRef.current)
        }
      }
    }, [query, performSearch])

    const handleVideoPress = useCallback(
      (item: IYouTubeVideo) => {
        navigation.navigate("YouTubePlayer" as any, { video: item })
      },
      [navigation],
    )

    const renderVideoItem = useCallback(
      ({ item }: { item: IYouTubeVideo }) => {
        return <YouTubeVideoCard item={item} onPress={handleVideoPress} />
      },
      [handleVideoPress],
    )

    return (
      <Screen
        preset="fixed"
        safeAreaEdges={["top"]}
        backgroundColor={colors.background}
        contentContainerStyle={$screenContainer(colors)}
      >
        <View style={$searchContainer(colors)}>
          <Pressable onPress={() => navigation.goBack()} style={$searchIconButton} hitSlop={8}>
            <IconChevronLeft color={colors.text} />
          </Pressable>
          <TextInput
            ref={inputRef}
            placeholder="Search YouTube videos..."
            placeholderTextColor={colors.palette.neutral400}
            value={query}
            onChangeText={setQuery}
            style={$searchInput(colors)}
            autoCorrect={false}
            autoCapitalize="none"
            clearButtonMode="while-editing"
          />
        </View>

        {isSearching ? (
          <View style={$loadingContainer()}>
            <ActivityIndicator size="large" color={colors.palette.primary500} />
            <Text style={$loadingText(colors)}>Searching...</Text>
          </View>
        ) : (
          <FlatList
            data={searchResults}
            keyExtractor={(item) => `youtube-${item.id}`}
            renderItem={renderVideoItem}
            contentContainerStyle={$listContent()}
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={
              hasSearched && query.trim() ? (
                <View style={$emptyContainer()}>
                  <Text style={$emptyText(colors)}>No videos found</Text>
                  <Text size="xs" style={$emptySubtext(colors)}>
                    Try a different search term
                  </Text>
                </View>
              ) : !hasSearched ? (
                <View style={$emptyContainer()}>
                  <Text style={$emptyText(colors)}>Start typing to search</Text>
                  <Text size="xs" style={$emptySubtext(colors)}>
                    Search for videos by title, description, tags, or channel
                  </Text>
                </View>
              ) : null
            }
          />
        )}
      </Screen>
    )
  },
)

const $screenContainer = (colors: any): ViewStyle => ({
  flex: 1,
  backgroundColor: colors.background,
})

const $searchContainer = (colors: any): ViewStyle => ({
  flexDirection: "row",
  alignItems: "center",
  marginBottom: spacing.md,
  marginHorizontal: spacing.md,
  ...shadowProps,
  borderColor: colors.palette.neutral400,
  height: 50,
  marginTop: spacing.md,
  borderRadius: 100,
  backgroundColor: colors.palette.neutral200,
})

const $searchIconButton: ViewStyle = {
  padding: spacing.xs,
}

const $searchInput = (colors: any): TextStyle => ({
  flex: 1,
  fontSize: 16,
  fontFamily: typography.primary.medium,
  color: colors.palette.neutral900,
  paddingHorizontal: spacing.xs,
  paddingVertical: spacing.xs,
})

const $listContent = (): ViewStyle => ({
  paddingHorizontal: spacing.xxs,
  paddingBottom: spacing.xxl,
})

const $loadingContainer = (): ViewStyle => ({
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  paddingVertical: spacing.xxl,
})

const $loadingText = (colors: any): TextStyle => ({
  marginTop: spacing.md,
  fontSize: 16,
  color: colors.palette.neutral600,
})

const $emptyContainer = (): ViewStyle => ({
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  paddingVertical: spacing.xxl,
})

const $emptyText = (colors: any): TextStyle => ({
  fontSize: 18,
  color: colors.palette.neutral600,
  marginBottom: spacing.xs,
})

const $emptySubtext = (colors: any): TextStyle => ({
  color: colors.palette.neutral500,
})

export default YouTubeSearchScreen
