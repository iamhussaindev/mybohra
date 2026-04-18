import { IconChevronLeft } from "@tabler/icons-react-native"
import { Screen, Text } from "app/components"
import { shadowProps } from "app/helpers/shadow.helper"
import HijriDate from "app/libs/HijriDate"
import { useStores } from "app/models"
import { IMiqaat } from "app/models/MiqaatStore"
import { AppStackScreenProps } from "app/navigators"
import { MiqaatCard } from "app/screens/components/MiqaatList"
import { spacing, typography } from "app/theme"
import { useColors } from "app/theme/useColors"
import Fuse from "fuse.js"
import { observer } from "mobx-react-lite"
import React, { useEffect, useRef, useState, useCallback, useMemo } from "react"
import {
  FlatList,
  Pressable,
  TextInput,
  TextStyle,
  View,
  ViewStyle,
  ActivityIndicator,
} from "react-native"

type MiqaatsSearchProps = AppStackScreenProps<"MiqaatsSearch">

export const MiqaatsSearchScreen: React.FC<MiqaatsSearchProps> = observer(
  function MiqaatsSearchScreen(props) {
    const { navigation } = props
    const colors = useColors()
    const { miqaatStore } = useStores()
    const [query, setQuery] = useState("")
    const [searchResults, setSearchResults] = useState<IMiqaat[]>([])
    const [isSearching, setIsSearching] = useState(false)
    const [hasSearched, setHasSearched] = useState(false)

    const inputRef = useRef<TextInput>(null)
    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)

    useEffect(() => {
      // Load miqaats if not already loaded
      if (miqaatStore.list.length === 0) {
        miqaatStore.fetchMiqaats()
      }
    }, [miqaatStore])

    useEffect(() => {
      // Focus input immediately when screen opens
      const timeout = setTimeout(() => {
        inputRef.current?.focus()
      }, 100)

      return () => clearTimeout(timeout)
    }, [])

    // Create Fuse instance for searching
    const fuse = useMemo(() => {
      const allMiqaats = miqaatStore.list
      if (allMiqaats.length === 0) return null

      return new Fuse(allMiqaats, {
        keys: [
          { name: "name", weight: 0.5 },
          { name: "description", weight: 0.3 },
          { name: "location", weight: 0.15 },
          { name: "type", weight: 0.05 },
        ],
        threshold: 0.3,
        ignoreLocation: true,
        includeScore: true,
      })
    }, [miqaatStore.list])

    // Debounced search function using Fuse.js
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
          if (!fuse) {
            setSearchResults([])
            return
          }

          // Use Fuse.js to search
          const fuseResults = fuse.search(searchQuery.trim())

          // Extract items from Fuse results and sort by score (lower is better)
          const results: IMiqaat[] = fuseResults
            .map((result) => result.item as IMiqaat)
            .sort((a, b) => {
              // Get scores for comparison
              const aScore = fuseResults.find((r) => (r.item as IMiqaat).id === a.id)?.score ?? 1
              const bScore = fuseResults.find((r) => (r.item as IMiqaat).id === b.id)?.score ?? 1

              // Sort by relevance score first
              if (aScore !== bScore) {
                return aScore - bScore
              }

              // Then sort by date (earlier dates first)
              if (a.month !== b.month) {
                return a.month - b.month
              }
              return a.date - b.date
            })

          setSearchResults(results)
        } catch (error) {
          console.error("Error searching miqaats:", error)
          setSearchResults([])
        } finally {
          setIsSearching(false)
        }
      },
      [fuse],
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

    const handleSelect = (item: IMiqaat) => {
      navigation.goBack()
      navigation.navigate("Calendar", {
        highlight: {
          year: new HijriDate().year,
          month: item.month,
          day: item.date,
        },
      })
    }

    const renderItem = ({ item }: { item: IMiqaat }) => {
      return (
        <Pressable style={$resultItem(colors)} onPress={() => handleSelect(item)}>
          <MiqaatCard item={item} />
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
            placeholder="Search miqaats..."
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
            keyExtractor={(item) => `miqaat-${item.id}`}
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
                    Search for miqaats by name, description, location, or type
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

const $resultItem = (colors: any): ViewStyle => ({
  backgroundColor: colors.background,
  paddingVertical: spacing.xs,
  paddingHorizontal: spacing.md,
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

export default MiqaatsSearchScreen
