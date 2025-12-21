import { IconChevronLeft } from "@tabler/icons-react-native"
import { Screen, Text } from "app/components"
import { shadowProps } from "app/helpers/shadow.helper"
import { ILibrary, useStores } from "app/models"
import { AppStackScreenProps } from "app/navigators"
import { spacing, typography } from "app/theme"
import { useColors } from "app/theme/useColors"
import { observer } from "mobx-react-lite"
import React, { useEffect, useRef, useState, useCallback } from "react"
import {
  FlatList,
  Image,
  ImageStyle,
  Pressable,
  TextInput,
  TextStyle,
  View,
  ViewStyle,
  ActivityIndicator,
} from "react-native"

type DuaListSearchProps = AppStackScreenProps<"DuaListSearch" | "DuaListSearchModal">

export const DuaListSearch: React.FC<DuaListSearchProps> = observer(function DuaListSearch(props) {
  const { navigation } = props
  const colors = useColors()
  const { libraryStore } = useStores()
  const [query, setQuery] = useState("")
  const [searchResults, setSearchResults] = useState<ILibrary[]>([])
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
        const results = await libraryStore.searchLibrary(searchQuery.trim())
        setSearchResults(results)
      } catch (error) {
        console.error("Error searching library:", error)
        setSearchResults([])
      } finally {
        setIsSearching(false)
      }
    },
    [libraryStore],
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

  const handleSelect = (item: ILibrary) => {
    navigation.navigate("PdfViewer", {
      id: item.id,
      name: item.name,
      description: item.description,
      audio_url: item.audio_url ?? "",
      pdf_url: item.pdf_url ?? "",
      youtube_url: item.youtube_url ?? "",
      metadata: item.metadata,
      tags: item.tags ?? [],
      categories: item.categories ?? [],
    })
  }

  const renderItem = ({ item }: { item: ILibrary }) => {
    return (
      <Pressable style={$resultItem(colors)} onPress={() => handleSelect(item)}>
        <View style={$resultContent()}>
          <View style={$resultImageContainer()}>
            <Image
              source={require("../../../assets/icons/pdf.png")}
              style={$resultImage()}
              resizeMode="contain"
            />
          </View>
          <View style={$resultTextContainer()}>
            <Text weight="medium" style={$resultTitle(colors)} numberOfLines={2}>
              {item.name}
            </Text>
          </View>
        </View>
      </Pressable>
    )
  }

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
          placeholder="Search duas..."
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
          keyExtractor={(item) => `dua-${item.id}`}
          renderItem={renderItem}
          contentContainerStyle={$listContent()}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            hasSearched && query.trim() ? (
              <View style={$emptyContainer()}>
                <Text style={$emptyText(colors)}>No results found</Text>
                <Text size="xs" style={$emptySubtext(colors)}>
                  Try a different search term
                </Text>
              </View>
            ) : !hasSearched ? (
              <View style={$emptyContainer()}>
                <Text style={$emptyText(colors)}>Start typing to search</Text>
                <Text size="xs" style={$emptySubtext(colors)}>
                  Search for duas by name
                </Text>
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

const $searchContainer = (colors: any): ViewStyle => ({
  flexDirection: "row",
  alignItems: "center",
  marginBottom: spacing.md,
  marginHorizontal: spacing.md,
  ...shadowProps,
  height: 50,
  marginTop: spacing.md,
  borderRadius: 100,
  backgroundColor: colors.background,
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

const $resultItem = (colors: any): ViewStyle => ({
  backgroundColor: colors.background,
  paddingVertical: spacing.md,
  paddingHorizontal: spacing.md,
  borderBottomWidth: 1,
  borderBottomColor: colors.palette.neutral200,
})

const $resultContent = (): ViewStyle => ({
  alignItems: "center",
  flexDirection: "row",
})

const $resultImageContainer = (): ViewStyle => ({
  width: 32,
  height: 32,
})

const $resultImage = (): ImageStyle => ({
  height: 24,
  width: 24,
})

const $resultTextContainer = (): ViewStyle => ({
  flex: 1,
  marginLeft: spacing.sm,
})

const $resultTitle = (colors: any): TextStyle => ({
  fontSize: 15,
  color: colors.palette.neutral900,
  marginBottom: spacing.xxxs,
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

export default DuaListSearch
