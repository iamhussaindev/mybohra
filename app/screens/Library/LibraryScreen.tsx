import { AudioItem, Screen, Text } from "app/components"
import Header from "app/components/Header"
import { useSoundPlayer } from "app/hooks/useAudio"
import { useStores } from "app/models"
import { ILibrary } from "app/models/LibraryStore"
import { AppStackScreenProps } from "app/navigators"
import { spacing, typography } from "app/theme"
import { useColors } from "app/theme/useColors"
import { formatLabel } from "app/utils/labelHelper"
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
} from "react-native"

type LibraryScreenProps = AppStackScreenProps<"Library">

export const LibraryScreen: React.FC<LibraryScreenProps> = observer(function LibraryScreen(props) {
  const { navigation } = props
  const colors = useColors()
  const { libraryStore } = useStores()
  const [albums, setAlbums] = useState<Array<{ album: string; count: number }>>([])
  const [selectedAlbum, setSelectedAlbum] = useState<string | null>(null)
  const [libraryItems, setLibraryItems] = useState<ILibrary[]>([])
  const [loadingAlbums, setLoadingAlbums] = useState(true)
  const [loadingItems, setLoadingItems] = useState(false)

  const { currentSound, state } = useSoundPlayer()

  useEffect(() => {
    const loadAlbums = async () => {
      setLoadingAlbums(true)
      try {
        await libraryStore.fetchAlbums({ filterAudioOnly: true })
        const fetchedAlbums = libraryStore.getAlbums() as Array<{ album: string; count: number }>

        // Filter albums to show only audio library albums (exclude DUA)
        const audioAlbums = fetchedAlbums
          .filter((a) => a.album && a.album !== "DUA")
          .sort((a, b) => {
            // Define priority order for albums
            const priority: Record<string, number> = {
              Popular: 1,
              Kalaam: 2,
              Madeh: 3,
              Nasihat: 4,
              Risa: 5,
            }
            const aPriority = priority[a.album] ?? 999
            const bPriority = priority[b.album] ?? 999
            if (aPriority !== bPriority) return aPriority - bPriority
            return a.album.localeCompare(b.album)
          })

        setAlbums(audioAlbums)
        // Auto-select first album
        if (audioAlbums.length > 0 && !selectedAlbum) {
          setSelectedAlbum(audioAlbums[0].album)
        }
      } catch (error) {
        console.error("Error loading albums:", error)
      } finally {
        setLoadingAlbums(false)
      }
    }
    loadAlbums()
  }, [libraryStore])

  // Load library items when album changes
  useEffect(() => {
    const loadItems = async () => {
      if (!selectedAlbum) {
        setLibraryItems([])
        return
      }

      setLoadingItems(true)
      try {
        const items = await libraryStore.fetchByAlbum(selectedAlbum, { filterAudioOnly: true })
        setLibraryItems(items)
      } catch (error) {
        console.error("Error loading library items:", error)
        setLibraryItems([])
      } finally {
        setLoadingItems(false)
      }
    }

    loadItems()
  }, [selectedAlbum, libraryStore])

  const handleItemPress = useCallback(
    (item: ILibrary) => {
      navigation.navigate("AudioPlayer" as any, { album: selectedAlbum || item.album || "" })
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
          ) : (
            <FlatList
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
  marginTop: spacing.md,
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
  borderColor: isSelected ? colors.palette.primary500 : colors.palette.neutral300,
  backgroundColor: isSelected ? colors.palette.primary100 : colors.palette.neutral200,
})

const $tabItemText = (colors: any, isSelected: boolean): TextStyle => ({
  fontSize: 14,
  fontFamily: typography.primary.medium,
  color: isSelected ? colors.palette.primary600 : colors.palette.neutral900,
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

export default LibraryScreen
