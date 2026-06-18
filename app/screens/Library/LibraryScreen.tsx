import { IconPlayerPlayFilled } from "@tabler/icons-react-native"
import { AudioItem, Screen, Text } from "app/components"
import Header from "app/components/Header"
import { useSoundPlayer } from "app/hooks/useAudio"
import { useStores } from "app/models"
import { ILibrary } from "app/models/LibraryStore"
import type { AppStackScreenProps } from "app/navigators"
import { spacing, typography } from "app/theme"
import { useColors } from "app/theme/useColors"
import { formatLabel } from "app/utils/labelHelper"
import { navigateLibraryAudioItem } from "app/utils/navigateLibraryItem"
import { observer } from "mobx-react-lite"
import React, { useEffect, useState, useCallback } from "react"
import {
  ViewStyle,
  ScrollView,
  Pressable,
  TextStyle,
  View,
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Image,
  ImageStyle,
  Dimensions,
} from "react-native"
import { LinearGradient } from "react-native-linear-gradient"
import { State } from "react-native-track-player"

type LibraryScreenProps = AppStackScreenProps<"Library">

export const LibraryScreen: React.FC<LibraryScreenProps> = observer(function LibraryScreen(props) {
  const { navigation } = props
  const colors = useColors()
  const { libraryStore, dataStore } = useStores()
  const [albums, setAlbums] = useState<Array<{ album: string; count: number }>>([])
  const [selectedAlbum, setSelectedAlbum] = useState<string | null>(null)
  const [libraryItems, setLibraryItems] = useState<ILibrary[]>([])
  const [loadingAlbums, setLoadingAlbums] = useState(true)
  const [loadingItems, setLoadingItems] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  const { currentSound, state } = useSoundPlayer()
  const screenWidth = Dimensions.get("window").width
  const gridItemWidth = (screenWidth - spacing.md * 3) / 2 // 2 columns with margins

  useEffect(() => {
    // const loadAlbums = async () => {
    //   setLoadingAlbums(true)
    //   try {
    //     await libraryStore.fetchAlbums({ filterAudioOnly: true })
    //     const fetchedAlbums = libraryStore.getAlbums() as Array<{ album: string; count: number }>

    //     // Filter albums to show only audio library albums (exclude DUA)
    //     const audioAlbums = fetchedAlbums
    //       .filter((a) => a.album && a.album !== "DUA")
    //       .sort((a, b) => {
    //         // Define priority order for albums
    //         const priority: Record<string, number> = {
    //           Popular: 1,
    //           Kalaam: 2,
    //           Madeh: 3,
    //           Nasihat: 4,
    //           Risa: 5,
    //         }
    //         const aPriority = priority[a.album] ?? 999
    //         const bPriority = priority[b.album] ?? 999
    //         if (aPriority !== bPriority) return aPriority - bPriority
    //         return a.album.localeCompare(b.album)
    //       })

    //     setAlbums(audioAlbums)
    //     // Auto-select first album
    //     if (audioAlbums.length > 0 && !selectedAlbum) {
    //       setSelectedAlbum(audioAlbums[0].album)
    //     }
    //   } catch (error) {
    //     console.error("Error loading albums:", error)
    //   } finally {
    //     setLoadingAlbums(false)
    //   }
    // }
    // loadAlbums()
    setLoadingAlbums(false)
    setAlbums([
      { album: "For you", count: 10 },
      { album: "Popular", count: 10 },
      { album: "Madeh", count: 10 },
      { album: "Nasihat", count: 10 },
      { album: "Risa", count: 10 },
    ])
    setSelectedAlbum("For you")
  }, [libraryStore])

  // Load library items function
  const loadItems = useCallback(
    async (showLoading = true) => {
      if (!selectedAlbum) {
        setLibraryItems([])
        return
      }

      if (showLoading) {
        setLoadingItems(true)
      }
      try {
        // Special handling for "For you" tab
        if (selectedAlbum === "For you") {
          // Get most played items from audio activity
          const mostPlayed = dataStore.getMostPlayedItems(20) // Get top 20
          const itemIds = mostPlayed.map((item) => item.itemId)

          if (itemIds.length > 0) {
            // Fetch library items by IDs
            const items = await libraryStore.fetchItemsByIds(itemIds)
            // Sort items to match the order of most played
            const sortedItems = itemIds
              .map((id) => items.find((item) => item.id === id))
              .filter((item): item is ILibrary => item !== undefined)
            setLibraryItems(sortedItems)
          } else {
            setLibraryItems([])
          }
        } else {
          // Regular album/category fetch
          const items = await libraryStore.fetchByCategories([selectedAlbum], {
            filterAudioOnly: true,
          })
          setLibraryItems(items)
        }
      } catch (error) {
        console.error("Error loading library items:", error)
        setLibraryItems([])
      } finally {
        if (showLoading) {
          setLoadingItems(false)
        }
      }
    },
    [selectedAlbum, libraryStore, dataStore],
  )

  // Load library items when album changes
  useEffect(() => {
    loadItems()
  }, [loadItems])

  // Handle pull to refresh
  const handleRefresh = useCallback(async () => {
    if (!selectedAlbum) return

    setRefreshing(true)
    try {
      await loadItems(false)
    } finally {
      setRefreshing(false)
    }
  }, [selectedAlbum, loadItems])

  const handleItemPress = useCallback(
    (item: ILibrary) => {
      const albumToUse =
        selectedAlbum === "For you" ? item.album || "" : selectedAlbum || item.album || ""
      void navigateLibraryAudioItem(navigation, item, { album: albumToUse })
    },
    [navigation, selectedAlbum],
  )

  return (
    <Screen
      preset="fixed"
      backgroundColor={colors.background}
      safeAreaEdges={["top"]}
      contentContainerStyle={$screenContainer(colors)}
    >
      <Header title="Library" showBackButton />
      {loadingAlbums ? (
        <View style={$loadingContainer}>
          <ActivityIndicator size="large" color={colors.palette.primary500} />
        </View>
      ) : (
        <>
          <View style={$tabsContainer(colors)}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={$tabsContent}
              keyboardShouldPersistTaps="handled"
            >
              {albums.map((album, idx) => {
                const isSelected = selectedAlbum === album.album
                return (
                  <Pressable
                    style={[
                      $tabItem(colors, isSelected),
                      idx === albums.length - 1 && { marginEnd: spacing.md },
                    ]}
                    key={album.album}
                    onPress={() => {
                      setSelectedAlbum(album.album)
                    }}
                  >
                    <Text style={$tabItemText(colors, isSelected)}>{formatLabel(album.album)}</Text>
                  </Pressable>
                )
              })}
            </ScrollView>
          </View>

          {loadingItems ? (
            <View style={$loadingItemsContainer}>
              <ActivityIndicator size="large" color={colors.palette.primary500} />
            </View>
          ) : selectedAlbum === "For you" ? (
            <FlatList
              key="grid-list"
              data={libraryItems}
              bounces={false}
              keyExtractor={(item) => item.id.toString()}
              numColumns={2}
              renderItem={({ item }) => (
                <GridAudioItem
                  item={item}
                  currentSound={currentSound}
                  state={state}
                  onPress={handleItemPress}
                  width={gridItemWidth}
                />
              )}
              contentContainerStyle={$gridContent}
              columnWrapperStyle={$gridRow}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={handleRefresh}
                  colors={[colors.palette.primary500]}
                  tintColor={colors.palette.primary500}
                />
              }
              ListEmptyComponent={
                <View style={$emptyContainer}>
                  <Text style={$emptyText(colors)}>No audio tracks found</Text>
                </View>
              }
            />
          ) : (
            <FlatList
              key="list-view"
              bounces={false}
              data={libraryItems}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <AudioItem
                  item={item}
                  currentSound={currentSound}
                  state={state}
                  onPress={handleItemPress}
                />
              )}
              contentContainerStyle={$listContent}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={handleRefresh}
                  colors={[colors.palette.primary500]}
                  tintColor={colors.palette.primary500}
                />
              }
              ListEmptyComponent={
                selectedAlbum ? (
                  <View style={$emptyContainer}>
                    <Text style={$emptyText(colors)}>No audio tracks found</Text>
                  </View>
                ) : null
              }
            />
          )}
        </>
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

const $tabsContainer = (_colors: any): ViewStyle => ({
  marginStart: spacing.md,
  gap: spacing.md,
})

const $tabsContent: ViewStyle = {
  gap: spacing.xs,
  paddingBottom: spacing.xs,
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
  color: isSelected ? colors.tintText : colors.palette.neutral900,
  textTransform: "capitalize",
})

const $loadingItemsContainer: ViewStyle = {
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  paddingVertical: spacing.xxl,
}

const $listContent: ViewStyle = {
  paddingVertical: spacing.sm,
  paddingBottom: spacing.xxl,
}

const $emptyContainer: ViewStyle = {
  paddingVertical: spacing.xxl,
  alignItems: "center",
}

const $emptyText = (colors: any): TextStyle => ({
  fontSize: 16,
  color: colors.palette.neutral500,
})

const $gridContent: ViewStyle = {
  padding: spacing.md,
  paddingBottom: spacing.xxl,
}

const $gridRow: ViewStyle = {
  justifyContent: "space-between",
  marginBottom: spacing.md,
}

// Grid Audio Item Component
interface GridAudioItemProps {
  item: ILibrary
  currentSound?: any
  state?: any
  onPress: (item: ILibrary) => void
  width: number
}

const GridAudioItem: React.FC<GridAudioItemProps> = ({
  item,
  currentSound,
  state,
  onPress,
  width,
}) => {
  const colors = useColors()
  const isActive = currentSound?.id?.toString() === item.id.toString()
  const isPlaying = isActive && state === State.Playing

  return (
    <Pressable style={[$gridItem, { width }]} onPress={() => onPress(item)}>
      <View style={$gridItemImageContainer}>
        <Image
          source={require("../../../assets/images/album_arts.jpg")}
          style={$gridItemImage}
          resizeMode="cover"
        />
        <LinearGradient colors={["transparent", "rgba(0,0,0,0.7)"]} style={$gridItemOverlay}>
          {isActive && (
            <View style={$gridItemPlayButton}>
              <IconPlayerPlayFilled size={24} color={colors.white} />
            </View>
          )}
        </LinearGradient>
      </View>
      <View style={$gridItemTextContainer}>
        <Text style={$gridItemTitle(colors)} weight="medium" numberOfLines={2}>
          {item.name}
        </Text>
        {item.album && (
          <Text style={$gridItemSubtitle(colors)} numberOfLines={1}>
            {item.album}
          </Text>
        )}
      </View>
    </Pressable>
  )
}

const $gridItem: ViewStyle = {
  marginBottom: spacing.md,
}

const $gridItemImageContainer: ViewStyle = {
  width: "100%",
  aspectRatio: 1,
  borderRadius: 12,
  overflow: "hidden",
  marginBottom: spacing.xs,
  backgroundColor: "#e0e0e0",
}

const $gridItemImage: ImageStyle = {
  width: "100%",
  height: "100%",
}

const $gridItemOverlay: ViewStyle = {
  position: "absolute",
  bottom: 0,
  left: 0,
  right: 0,
  height: "40%",
  justifyContent: "flex-end",
  alignItems: "center",
  paddingBottom: spacing.xs,
}

const $gridItemPlayButton: ViewStyle = {
  width: 40,
  height: 40,
  borderRadius: 20,
  backgroundColor: "rgba(255, 255, 255, 0.3)",
  justifyContent: "center",
  alignItems: "center",
}

const $gridItemTextContainer: ViewStyle = {
  paddingHorizontal: spacing.xs,
}

const $gridItemTitle = (colors: any): TextStyle => ({
  fontSize: 14,
  color: colors.text,
  marginBottom: spacing.xxxs,
})

const $gridItemSubtitle = (colors: any): TextStyle => ({
  fontSize: 12,
  color: colors.palette.neutral500,
})

export default LibraryScreen
