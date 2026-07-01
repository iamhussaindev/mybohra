import { IconChevronLeft } from "@tabler/icons-react-native"
import { Screen, Text } from "app/components"
import { shadowProps } from "app/helpers/shadow.helper"
import { useDebouncedValue } from "app/hooks/useDebouncedValue"
import type { ILibrary } from "app/models"
import type { AppStackScreenProps } from "app/navigators"
import { useLibraryAlbums, useLibrarySearch } from "app/services/supabase/queries/library.query"
import { spacing, typography } from "app/theme"
import { useColors } from "app/theme/useColors"
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
  ScrollView,
} from "react-native"

type DuaListSearchProps = AppStackScreenProps<"DuaListSearch" | "DuaListSearchModal">

export function DuaListSearch(props: DuaListSearchProps) {
  const { navigation } = props
  const colors = useColors()
  const [query, setQuery] = useState("")
  const [selectedAlbum, setSelectedAlbum] = useState<string | null>(null)
  const debouncedQuery = useDebouncedValue(query, 500)

  const inputRef = useRef<TextInput>(null)
  const { data: albums = [] } = useLibraryAlbums()
  const hasQuery = debouncedQuery.trim().length > 0

  const { data: searchResults = [], isFetching, isLoading } = useLibrarySearch(
    debouncedQuery,
    selectedAlbum,
    hasQuery,
  )

  const isSearching = hasQuery && (isFetching || isLoading)
  const hasSearched = hasQuery

  useEffect(() => {
    const timeout = setTimeout(() => {
      inputRef.current?.focus()
    }, 100)
    return () => clearTimeout(timeout)
  }, [])

  const handleSelect = useCallback(
    (item: ILibrary) => {
      navigation.pop()
      navigation.navigate("PdfViewer", {
        id: item.id,
        name: item.name,
        description: item.description,
        audio_url: item.audio_url ?? null,
        pdf_url: item.pdf_url ?? null,
        youtube_url: item.youtube_url ?? null,
        metadata: item.metadata,
        tags: item.tags ?? null,
        categories: item.categories ?? null,
      })
    },
    [navigation],
  )

  const renderItem = useCallback(
    ({ item }: { item: ILibrary }) => (
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
    ),
    [colors, handleSelect],
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

      <View style={$searchTabContainer(colors)}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={$searchTabContent(colors)}
          keyboardShouldPersistTaps="handled"
        >
          {albums.map((album, idx) => {
            const isSelected = selectedAlbum === album.album
            return (
              <Pressable
                style={[
                  $searchTabItem(colors, isSelected),
                  idx === albums.length - 1 && { marginEnd: spacing.md },
                ]}
                key={album.album}
                onPress={() => setSelectedAlbum(isSelected ? null : album.album)}
              >
                <Text style={$searchTabItemText(colors, isSelected)}>{album.album}</Text>
              </Pressable>
            )
          })}
        </ScrollView>
      </View>

      {isSearching ? (
        <View style={$loadingContainer()}>
          <ActivityIndicator size="large" color={colors.palette.primary500} />
          <Text style={$loadingText(colors)}>Searching...</Text>
        </View>
      ) : (
        <FlatList
          data={searchResults as ILibrary[]}
          keyExtractor={(item) => `dua-${item.id}`}
          renderItem={renderItem}
          contentContainerStyle={$listContent()}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            hasSearched ? (
              <View style={$emptyContainer()}>
                <Text style={$emptyText(colors)}>No results found</Text>
                <Text size="xs" style={$emptySubtext(colors)}>
                  Try a different search term
                </Text>
              </View>
            ) : (
              <View style={$emptyContainer()}>
                <Text style={$emptyText(colors)}>Start typing to search</Text>
                <Text size="xs" style={$emptySubtext(colors)}>
                  Search for duas by name
                </Text>
              </View>
            )
          }
        />
      )}
    </Screen>
  )
}

const $searchTabContainer = (_colors: any): ViewStyle => ({
  marginStart: spacing.md,
  marginBottom: spacing.md,
  gap: spacing.md,
})

const $searchTabContent = (_colors: any): ViewStyle => ({
  gap: spacing.xs,
})

const $searchTabItem = (colors: any, isSelected: boolean): ViewStyle => ({
  paddingHorizontal: spacing.sm,
  paddingVertical: spacing.xxxs,
  borderRadius: 100,
  borderWidth: 1,
  borderColor: isSelected ? colors.palette.primary500 : colors.palette.neutral400,
  backgroundColor: colors.palette.neutral300,
})

const $searchTabItemText = (colors: any, isSelected: boolean): TextStyle => ({
  fontSize: 14,
  fontFamily: typography.primary.medium,
  color: isSelected ? colors.palette.neutral900 : colors.palette.neutral900,
  textTransform: "capitalize",
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
