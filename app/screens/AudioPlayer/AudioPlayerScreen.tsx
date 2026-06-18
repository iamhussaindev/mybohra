import Slider from "@react-native-community/slider"
import {
  IconBookmark,
  IconBookmarkFilled,
  IconCast,
  IconCloudDownload,
  IconPdf,
  IconPlayerSkipBackFilled,
  IconPlayerSkipForwardFilled,
  IconProgressBolt,
  IconShare,
} from "@tabler/icons-react-native"
import { AudioItem, Icon, Screen, Skeleton, Switch, Text } from "app/components"
import { formatTime } from "app/helpers/audio.helper"
import { useSoundPlayer } from "app/hooks/useAudio"
import { useStores } from "app/models"
import { ILibrary } from "app/models/LibraryStore"
import type { AppStackScreenProps } from "app/navigators"
import { spacing, typography } from "app/theme"
import { useColors } from "app/theme/useColors"
import { observer } from "mobx-react-lite"
import React, { useEffect, useState, useCallback, useRef } from "react"
import {
  ViewStyle,
  FlatList,
  Pressable,
  TextStyle,
  View,
  Alert,
  Share,
  Image,
  ImageStyle,
  ActivityIndicator,
} from "react-native"
import TrackPlayer, { State } from "react-native-track-player"

type AudioPlayerScreenProps = AppStackScreenProps<"AudioPlayer">

// Helper function to format duration for track list
const formatDuration = (seconds: number | null | undefined): string => {
  if (!seconds) return "00:00"
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }
  return `${minutes}:${secs.toString().padStart(2, "0")}`
}

export const AudioPlayerScreen: React.FC<AudioPlayerScreenProps> = observer(
  function AudioPlayerScreen(props) {
    const { navigation, route } = props
    const colors = useColors()
    const { libraryStore, dataStore } = useStores()
    const {
      currentSound,
      toggleSound,
      state,
      duration,
      position,
      speed,
      setSpeed,
      seek,
      playQueue,
      playSound,
      skipToNext,
      skipToPrevious,
    } = useSoundPlayer()

    const album = route.params?.album as string | undefined
    const trackId = route.params?.trackId as number | undefined
    const [tracks, setTracks] = useState<ILibrary[]>([])
    const [currentTrackIndex, setCurrentTrackIndex] = useState(0)
    const [autoplay, setAutoplay] = useState(true)
    const loadedAlbumRef = useRef<string | null>(null)
    const loadedTrackIdRef = useRef<number | null>(null)
    const loadedTracksRef = useRef<ILibrary[]>([])
    const playQueueRef = useRef(playQueue)

    // Upnext items state
    const [upnextItemsBuffer, setUpnextItemsBuffer] = useState<ILibrary[]>([]) // Buffer of 100 items
    const [displayedUpnextItems, setDisplayedUpnextItems] = useState<ILibrary[]>([]) // 50 items to display
    const upnextLoadedRef = useRef<boolean>(false)

    // Get current track item from currentSound
    const currentTrackItem = currentSound?.item ? (JSON.parse(currentSound.item) as ILibrary) : null
    const currentTrackAlbum = currentTrackItem?.album

    // Keep playQueue ref updated
    useEffect(() => {
      playQueueRef.current = playQueue
    }, [playQueue])

    // Load tracks when album changes
    useEffect(() => {
      const loadTracks = async () => {
        if (!album) {
          console.log("no album, setting tracks to empty", route.params)
          setTracks([])
          loadedAlbumRef.current = null
          loadedTrackIdRef.current = null
          loadedTracksRef.current = []
          return
        }

        // Check if we need to reload (album changed or trackId changed)
        const albumChanged = loadedAlbumRef.current !== album
        const trackIdChanged = trackId !== undefined && loadedTrackIdRef.current !== trackId

        // Skip if we've already loaded this album and trackId (if provided)
        if (!albumChanged && !trackIdChanged) {
          return
        }

        // If album is already loaded but trackId changed, we can use existing tracks
        const isSameAlbum = loadedAlbumRef.current === album && loadedTracksRef.current.length > 0

        try {
          let items = loadedTracksRef.current

          // Only fetch if album changed or we don't have tracks yet
          if (albumChanged || !isSameAlbum) {
            // If we have a trackId but no valid album (e.g., from "For you" tab), fetch the item first to get its album
            if (trackId !== undefined && (!album || album === "For you")) {
              const itemById = await libraryStore.fetchItemsByIds([trackId])
              if (itemById.length > 0 && itemById[0].album) {
                // Use the item's actual album to fetch all tracks from that album
                items = await libraryStore.fetchByAlbum(itemById[0].album, {
                  filterAudioOnly: true,
                })
              } else {
                // Fallback: if no album found, just use the single item
                items = itemById
              }
            } else if (album) {
              // Fetch tracks for the album/category, filtering for items with audio
              items = await libraryStore.fetchByCategories([album], {
                filterAudioOnly: true,
              })
            } else {
              items = []
            }
            setTracks(items)
            loadedTracksRef.current = items
            loadedAlbumRef.current = album
          }

          // Check if current track is from the same album
          const isCurrentTrackFromSameAlbum =
            currentSound && currentTrackAlbum && currentTrackAlbum === album

          // Check if the trackId being opened is the same as the currently playing track
          const currentTrackId =
            currentSound?.id !== undefined
              ? typeof currentSound.id === "string"
                ? parseInt(currentSound.id, 10)
                : currentSound.id
              : null
          const isSameTrackPlaying = trackId !== undefined && currentTrackId === trackId

          // If we have a trackId but tracks aren't loaded yet, play the single track immediately
          if (trackId !== undefined && items.length === 0 && !isSameTrackPlaying) {
            // Fetch just this single item to play immediately
            const singleItem = await libraryStore.fetchItemsByIds([trackId])
            if (singleItem.length > 0 && singleItem[0].audio_url) {
              // Play the single track immediately
              playSound(singleItem[0], "LIBRARY")
              // If autoplay is off, pause immediately after setting up
              if (!autoplay) {
                await TrackPlayer.pause()
              }
              loadedTrackIdRef.current = trackId
              // Set the single item as tracks temporarily so UI can show it
              setTracks(singleItem)
              setCurrentTrackIndex(0)
              // Continue loading the full album in the background (will update tracks when loaded)
            }
          }

          if (items.length > 0) {
            // Determine which track to play
            let startIndex = 0

            // If trackId is provided, find its index
            if (trackId !== undefined) {
              const trackIndex = items.findIndex((t) => t.id === trackId)
              if (trackIndex !== -1) {
                startIndex = trackIndex
                loadedTrackIdRef.current = trackId
              }
            } else if (isCurrentTrackFromSameAlbum) {
              // Continue playing current track - don't reset the queue
              // Just sync the current track index
              const currentTrackIdStr = currentSound.id?.toString()
              if (currentTrackIdStr) {
                const index = items.findIndex((t) => t.id.toString() === currentTrackIdStr)
                if (index !== -1) {
                  startIndex = index
                }
              }
            }

            // If the same track is already playing, don't restart - just sync UI
            if (isSameTrackPlaying) {
              // Same track already playing - just sync index, don't restart playback
              setCurrentTrackIndex(startIndex)
            } else if (trackId !== undefined || !isCurrentTrackFromSameAlbum) {
              // Different track or different album - start new queue
              // Check if we're already playing the same track as a single item
              const isPlayingSingleTrack =
                currentTrackId === trackId && tracks.length === 1 && items.length > 1
              if (isPlayingSingleTrack) {
                // Already playing this track, just update the tracks list for the queue
                setCurrentTrackIndex(startIndex)
              } else {
                // Start new queue
                await playQueueRef.current(items, startIndex)
                // Update tracks state to match the queue
                setTracks(items)
                // If autoplay is off, pause immediately after setting up the queue
                if (!autoplay) {
                  await TrackPlayer.pause()
                }
                setCurrentTrackIndex(startIndex)
              }
            } else {
              // Same album, same track - just sync index
              setCurrentTrackIndex(startIndex)
            }
          }
        } catch (error) {
          console.error("Error loading tracks:", error)
        }
      }

      loadTracks()
    }, [album, trackId, libraryStore, currentSound?.id, currentTrackAlbum, autoplay])

    // Handle track completion - respect autoplay setting and add more upnext items
    useEffect(() => {
      if (state === State.Ended) {
        if (!autoplay) {
          // If autoplay is off and track ended, pause instead of auto-advancing
          TrackPlayer.pause()
        }
        // Add more items from buffer to displayed list when track ends
        // Keep displayed list at 50 items, adding new ones from buffer
        if (
          upnextItemsBuffer.length > displayedUpnextItems.length &&
          displayedUpnextItems.length < 50
        ) {
          const remainingItems = upnextItemsBuffer.slice(displayedUpnextItems.length)
          const itemsToAdd = remainingItems.slice(0, Math.min(10, 50 - displayedUpnextItems.length))
          setDisplayedUpnextItems((prev) => [...prev, ...itemsToAdd])
        }
      }
    }, [state, autoplay, upnextItemsBuffer, displayedUpnextItems])

    // Load customized upnext items when current track changes
    useEffect(() => {
      const loadUpnextItems = async () => {
        if (!currentTrackItem || !currentTrackItem.album) {
          setUpnextItemsBuffer([])
          setDisplayedUpnextItems([])
          upnextLoadedRef.current = false
          return
        }

        // Get recently played items to exclude (last 20 items)
        const recentlyPlayed = dataStore.getRecentlyPlayedItems(20)

        // Get user's most played items for sorting
        const mostPlayedItems = dataStore.getMostPlayedItems(100)
        const playCountMap = new Map<number, number>()
        mostPlayedItems.forEach((item) => {
          playCountMap.set(item.itemId, item.playCount)
        })

        // Fetch category popularity data
        await libraryStore.fetchCategories()
        const categories = libraryStore.getCategories() as Array<{ id: string; count: number }>
        const categoryPopularityMap = new Map<string, number>()
        categories.forEach((cat) => {
          categoryPopularityMap.set(cat.id, cat.count)
        })

        // Helper function to calculate category popularity score for an item
        const getCategoryPopularityScore = (item: ILibrary): number => {
          if (!item.categories || item.categories.length === 0) return 0
          return item.categories.reduce((sum, cat) => {
            return sum + (categoryPopularityMap.get(cat) ?? 0)
          }, 0)
        }

        // Fetch customized upnext items (fetch 100 for buffer, show 50)
        const upnextItems = await libraryStore.fetchCustomizedUpnext({
          album: currentTrackItem.album,
          categories: currentTrackItem.categories ?? null,
          tags: currentTrackItem.tags ?? null,
          excludeIds: recentlyPlayed,
          limit: 100,
        })

        // Filter out the current track from upnext
        const filteredUpnext = upnextItems.filter((item) => item.id !== currentTrackItem.id)

        // Sort by: category popularity, view_count, user play count, category match, tag match
        const currentCategories: string[] = currentTrackItem.categories ?? []
        const currentTags: string[] = currentTrackItem.tags ?? []

        const sortedUpnext = filteredUpnext.sort((a, b) => {
          // 1. Sort by category popularity score (descending) - prioritize popular category items
          const aCategoryPopularity = getCategoryPopularityScore(a)
          const bCategoryPopularity = getCategoryPopularityScore(b)
          if (aCategoryPopularity !== bCategoryPopularity) {
            return bCategoryPopularity - aCategoryPopularity
          }

          // 2. Sort by view_count (descending)
          const aViews = a.view_count ?? 0
          const bViews = b.view_count ?? 0
          if (aViews !== bViews) {
            return bViews - aViews
          }

          // 3. Sort by user play count (from audio activity)
          const aPlayCount = playCountMap.get(a.id) ?? 0
          const bPlayCount = playCountMap.get(b.id) ?? 0
          if (aPlayCount !== bPlayCount) {
            return bPlayCount - aPlayCount
          }

          // 4. Sort by category match (items with matching categories first)
          const aCategoryMatch =
            a.categories && currentCategories.length > 0
              ? a.categories.some((cat) => currentCategories.includes(cat))
              : false
          const bCategoryMatch =
            b.categories && currentCategories.length > 0
              ? b.categories.some((cat) => currentCategories.includes(cat))
              : false
          if (aCategoryMatch !== bCategoryMatch) {
            return bCategoryMatch ? 1 : -1
          }

          // 5. Sort by tag match (items with matching tags first)
          const aTagMatch =
            a.tags && currentTags.length > 0
              ? a.tags.some((tag) => currentTags.includes(tag))
              : false
          const bTagMatch =
            b.tags && currentTags.length > 0
              ? b.tags.some((tag) => currentTags.includes(tag))
              : false
          if (aTagMatch !== bTagMatch) {
            return bTagMatch ? 1 : -1
          }

          // 6. Finally, sort by name
          return (a.name || "").localeCompare(b.name || "")
        })

        // Store all 100 items in buffer
        setUpnextItemsBuffer(sortedUpnext)

        // Show first 50 items (excluding current track, which will be shown first separately)
        setDisplayedUpnextItems(sortedUpnext.slice(0, 50))
        upnextLoadedRef.current = true
      }

      loadUpnextItems()
    }, [
      currentTrackItem?.id,
      currentTrackItem?.album,
      currentTrackItem?.categories,
      currentTrackItem?.tags,
      libraryStore,
      dataStore,
    ])

    // Update current track index whenever currentSound changes (for UI sync)
    useEffect(() => {
      if (currentSound?.id && tracks.length > 0) {
        const currentTrackId = currentSound.id.toString()
        const index = tracks.findIndex((t) => t.id.toString() === currentTrackId)
        if (index !== -1) {
          setCurrentTrackIndex(index)
        }
      }
    }, [currentSound?.id, tracks.length])

    const handleTrackPress = async (item: ILibrary, _index?: number) => {
      // Check if this is the currently playing track
      const isCurrentTrack = currentSound?.id?.toString() === item.id.toString()

      if (isCurrentTrack) {
        // If clicking on the currently playing track, toggle play/pause
        toggleSound()
      } else {
        // Build the play queue: current track + upnext items
        const playQueueItems = currentTrackItem
          ? [currentTrackItem, ...displayedUpnextItems]
          : displayedUpnextItems

        // Find the index in the play queue
        const queueIndex = playQueueItems.findIndex((t) => t.id === item.id)
        if (queueIndex !== -1) {
          await playQueue(playQueueItems, queueIndex)
          // Update tracks state to match the queue
          setTracks(playQueueItems)
          setCurrentTrackIndex(queueIndex)
        }
      }
    }

    const handlePrevious = async () => {
      try {
        // If we're at the start (position < 3 seconds), go to previous track
        // Otherwise, restart current track
        if ((position ?? 0) < 3 && currentTrackIndex > 0) {
          await skipToPrevious()
        } else {
          // Restart current track
          await seek(0)
        }
      } catch (error) {
        console.error("Error skipping to previous:", error)
        await seek(0)
      }
    }

    const handleNext = async () => {
      try {
        await skipToNext()
      } catch (error) {
        console.error("Error skipping to next:", error)
      }
    }

    const handleOpenPDF = useCallback(() => {
      if (currentTrackItem && currentTrackItem.pdf_url) {
        // Track PDF view from audio player
        dataStore.recordPdfFromAudio(
          currentTrackItem.id, // PDF ID (same as audio ID if it's the same item)
          currentTrackItem.id, // Audio ID
          currentTrackItem.album ?? null,
        )

        navigation.navigate("PdfViewerModal", {
          id: currentTrackItem.id,
          name: currentTrackItem.name,
          description: currentTrackItem.description,
          audio_url: currentTrackItem.audio_url ?? "",
          pdf_url: currentTrackItem.pdf_url ?? "",
          youtube_url: currentTrackItem.youtube_url ?? "",
        })
      }
    }, [currentTrackItem, navigation, dataStore])

    const handleDownload = useCallback(() => {
      // TODO: Implement download functionality
      Alert.alert("Download", "Download functionality coming soon.")
    }, [])

    const handleSave = useCallback(async () => {
      if (currentTrackItem) {
        const wasPinned = dataStore.isLibraryPinned(currentTrackItem.id)
        dataStore.togglePinLibrary(currentTrackItem)
        Alert.alert(
          wasPinned ? "Removed from Saved Library" : "Added to Saved Library",
          `"${currentTrackItem.name}" has been ${wasPinned ? "removed" : "added"} to your library.`,
          [{ text: "OK" }],
        )
      }
    }, [currentTrackItem, dataStore])

    const handleShare = useCallback(async () => {
      if (currentTrackItem && currentTrackItem.audio_url) {
        try {
          await Share.share({
            message: `Check out "${currentTrackItem.name}": ${currentTrackItem.audio_url}`,
            title: currentTrackItem.name,
          })
        } catch (error) {
          console.error("Error sharing:", error)
        }
      }
    }, [currentTrackItem])

    const getSpeedLabel = () => {
      if (speed === 0.75) return "0.75x"
      if (speed === 1.0) return "Normal"
      if (speed === 1.25) return "1.25x"
      if (speed === 1.5) return "1.5x"
      if (speed === 2.0) return "2.0x"
      return "Normal"
    }

    const handleSpeedPress = () => {
      const speedOptions = [0.75, 1.0, 1.25, 1.5, 2.0]
      const currentIndex = speedOptions.indexOf(speed)
      const nextIndex = (currentIndex + 1) % speedOptions.length
      setSpeed(speedOptions[nextIndex])
    }

    // Format file size (placeholder - would need actual file size from metadata)
    const getFileSize = () => {
      const audioSize = (currentTrackItem?.metadata as { audioSize?: number } | null | undefined)?.audioSize
      if (audioSize) {
        const sizeMB = audioSize / (1024 * 1024)
        return `${sizeMB.toFixed(0)} MB`
      }
      return "12 MB" // Default placeholder
    }

    return (
      <Screen
        statusBarStyle="dark"
        preset="fixed"
        backgroundColor={colors.audioPlayerBackground}
        safeAreaEdges={["top"]}
        contentContainerStyle={$screenContainer(colors)}
      >
        {/* Dark Blue Header Section */}
        <View style={$headerSection(colors)}>
          <View style={$headerTopRow}>
            <View style={$albumArtContainer}>
              <Image source={require("../../../assets/images/album_arts.jpg")} style={$albumArt} />
            </View>
            <View style={albumArtContainerOverlay(colors)}></View>

            <Pressable onPress={() => navigation.goBack()} style={$backButton} hitSlop={8}>
              <Icon icon="arrowLeft" size={24} color={colors.absoluteWhite} />
            </Pressable>
            <View style={$headerRightActions}>
              <Pressable style={$headerActionButton} hitSlop={8}>
                <IconCast size={28} color={colors.absoluteWhite} />
              </Pressable>
            </View>
          </View>

          {/* Large Circular Visualizer with Controls */}
          <View style={$visualizerContainer}>
            <Pressable onPress={handlePrevious} style={$skipButtonLeft}>
              <IconPlayerSkipBackFilled size={28} color={colors.absoluteWhite} />
            </Pressable>

            <Pressable onPress={toggleSound} style={$circularVisualizer}>
              <View style={$visualizerInner}>
                <View style={$playPauseOverlay}>
                  {state !== State.Buffering ? (
                    <Icon
                      icon={state === State.Playing ? "pause" : "play"}
                      size={48}
                      color={colors.absoluteWhite}
                    />
                  ) : state === State.Buffering ? (
                    <ActivityIndicator size={48} color={colors.absoluteWhite} />
                  ) : null}
                </View>
              </View>
            </Pressable>

            <Pressable
              onPress={handleNext}
              style={$skipButtonRight}
              disabled={currentTrackIndex >= tracks.length - 1}
            >
              <IconPlayerSkipForwardFilled size={28} color={colors.absoluteWhite} />
            </Pressable>
          </View>

          {/* Seekbar */}
          <View style={$seekbarContainer}>
            <Slider
              style={$seekbar}
              minimumValue={0}
              maximumValue={duration ?? 1}
              value={position ?? 0}
              minimumTrackTintColor={colors.absoluteWhite}
              maximumTrackTintColor="rgba(255, 255, 255, 0.3)"
              thumbTintColor={colors.tint}
              tapToSeek={true}
              onValueChange={(value: number) => {
                seek(value)
              }}
            />
            {/* Time Display */}
            <View style={$timeDisplayRow}>
              <Text style={$timeText(colors)}>{formatTime(position ?? 0)}</Text>
              <Text style={$timeText(colors)}>{formatTime(duration ?? 0)}</Text>
            </View>
          </View>
        </View>

        {/* Track Information Section (Light Beige) */}
        <View style={[$trackInfoContent(colors), $trackInfoSection(colors)]}>
          <View style={$trackInfoContentContainer}>
            {currentTrackItem?.name ? (
              <View style={$trackInfoContentContainerMain}>
                <Text style={$trackTitle(colors)} weight="bold">
                  {currentTrackItem?.name}
                </Text>
                <Text style={$trackSubtitle(colors)} size="xs">
                  {currentTrackItem?.album}
                </Text>
              </View>
            ) : (
              <Skeleton width="50%" height={30} borderRadius={4} style={$trackTitle(colors)} />
            )}
          </View>

          {/* Action Buttons */}
          <View style={$actionButtonsContainer}>
            {currentTrackItem?.pdf_url && (
              <Pressable style={$actionButton} onPress={handleOpenPDF}>
                <View style={[$actionIconContainer, $actionIconContainerFilled(colors)]}>
                  <IconPdf size={18} color={colors.darkHighlight} />
                </View>
                <Text style={$actionButtonText(colors)} size="xs">
                  PDF
                </Text>
              </Pressable>
            )}

            <Pressable style={$actionButton} onPress={handleSpeedPress}>
              <View style={$actionIconContainer}>
                <IconProgressBolt size={28} color={colors.text} />
              </View>
              <Text style={$actionButtonText(colors)} size="xs">
                {getSpeedLabel()}
              </Text>
            </Pressable>

            <Pressable style={$actionButton} onPress={handleDownload}>
              <View style={$actionIconContainer}>
                <IconCloudDownload size={28} color={colors.text} />
              </View>
              <Text style={$actionButtonText(colors)} size="xs">
                {getFileSize()}
              </Text>
            </Pressable>

            <Pressable style={$actionButton} onPress={handleSave}>
              <View style={$actionIconContainer}>
                {dataStore.isLibraryPinned(currentTrackItem?.id ?? 0) ? (
                  <IconBookmarkFilled size={28} color={colors.text} />
                ) : (
                  <IconBookmark size={28} color={colors.text} />
                )}
              </View>
              <Text style={$actionButtonText(colors)} size="xs">
                {dataStore.isLibraryPinned(currentTrackItem?.id ?? 0) ? "Saved" : "Save"}
              </Text>
            </Pressable>

            <Pressable style={$actionButton} onPress={handleShare}>
              <View style={$actionIconContainer}>
                <IconShare size={28} color={colors.text} />
              </View>
              <Text style={$actionButtonText(colors)} size="xs">
                Share
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Upnext Section */}
        <View style={$upnextSection(colors)}>
          <View style={$upnextHeader(colors)}>
            <Text style={$upnextTitle(colors)} weight="bold">
              Upnext
            </Text>
            <View style={$autoplayContainer}>
              <Text style={$autoplayLabel(colors)}>Autoplay</Text>
              <Switch value={autoplay} onValueChange={setAutoplay} />
            </View>
          </View>

          <FlatList
            bounces={false}
            data={
              currentTrackItem ? [currentTrackItem, ...displayedUpnextItems] : displayedUpnextItems
            }
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item, index }) => {
              const audioLength = item.metadata?.audioLength
                ? formatDuration(item.metadata.audioLength)
                : "00:00"
              const isCurrentTrack = currentTrackItem?.id === item.id

              return (
                <AudioItem
                  item={item}
                  currentSound={currentSound}
                  state={state}
                  onPress={handleTrackPress}
                  index={index}
                  subtitle={`Audio Length: ${audioLength}`}
                  isActive={isCurrentTrack}
                />
              )
            }}
            contentContainerStyle={$upnextListContent(colors)}
            ListEmptyComponent={
              <View style={$emptyContainer}>
                <Text style={$emptyText(colors)}>No audio tracks found</Text>
              </View>
            }
          />
        </View>
      </Screen>
    )
  },
)

const $albumArtContainer: ViewStyle = {
  width: "100%",
  height: 200,
  position: "absolute",
  top: 24,
  left: 0,
  right: 0,
  bottom: 0,
}

const albumArtContainerOverlay = (colors: any): ViewStyle => ({
  width: "100%",
  height: 200,
  position: "absolute",
  top: 24,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: colors.audioPlayerBackground,
  opacity: 0.8,
})

const $albumArt: ImageStyle = {
  width: "100%",
  height: 200,
}

const $screenContainer = (colors: any): ViewStyle => ({
  flex: 1,
  backgroundColor: colors.background,
})

// Dark Blue Header Section
const $headerSection = (colors: any): ViewStyle => ({
  backgroundColor: colors.audioPlayerBackground,
  paddingHorizontal: spacing.sm,
  paddingBottom: spacing.sm,
})

const $headerTopRow: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: spacing.xl,
}

const $backButton: ViewStyle = {
  padding: spacing.xs,
}

const $headerRightActions: ViewStyle = {
  flexDirection: "row",
  gap: spacing.md,
}

const $headerActionButton: ViewStyle = {
  padding: spacing.sm,
}

const $visualizerContainer: ViewStyle = {
  flexDirection: "row",
  justifyContent: "center",
  alignItems: "center",
  marginBottom: spacing.lg,
  gap: spacing.xl,
}

const $skipButtonLeft: ViewStyle = {
  padding: spacing.sm,
}

const $skipButtonRight: ViewStyle = {
  padding: spacing.sm,
}

const $trackInfoContentContainer: ViewStyle = {
  height: 60,
}

const $trackInfoContentContainerMain: ViewStyle = {
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
}

const $circularVisualizer: ViewStyle = {
  width: 100,
  height: 100,
  borderRadius: 100,
  justifyContent: "center",
  alignItems: "center",
  overflow: "hidden",
}

const $visualizerInner: ViewStyle = {
  width: "100%",
  height: "100%",
  justifyContent: "center",
  alignItems: "center",
  position: "relative",
}

const $playPauseOverlay: ViewStyle = {
  position: "absolute",
  zIndex: 10,
}

const $seekbarContainer: ViewStyle = {
  marginTop: spacing.md,
  paddingHorizontal: spacing.xs,
}

const $seekbar: ViewStyle = {
  width: "100%",
  height: 40,
}

const $timeDisplayRow: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-between",
  paddingHorizontal: spacing.xs,
}

const $timeText = (colors: any): TextStyle => ({
  fontSize: 12,
  color: colors.absoluteWhite,
  fontFamily: typography.primary.medium,
})

// Track Information Section (Light Beige)
const $trackInfoSection = (colors: any): ViewStyle => ({
  backgroundColor: colors.background,
})

const $trackInfoContent = (colors: any): ViewStyle => ({
  paddingVertical: spacing.lg,
  backgroundColor: colors.background,
  alignItems: "center",
})

const $trackTitle = (colors: any): TextStyle => ({
  fontSize: 20,
  color: colors.text,
  textAlign: "center",
})

const $trackSubtitle = (colors: any): TextStyle => ({
  fontSize: 12,
  color: colors.palette.neutral600,
  textAlign: "center",
})

const $actionButtonsContainer: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-between",
  marginTop: spacing.md,
}

const $actionButton: ViewStyle = {
  alignItems: "center",
  flex: 1,
}

const $actionIconContainerFilled = (colors: any): ViewStyle => ({
  height: 36,
  width: 36,
  backgroundColor: colors.text,
})

const $actionIconContainer: ViewStyle = {
  width: 36,
  height: 36,
  justifyContent: "center",
  borderRadius: 6,
  alignItems: "center",
  marginBottom: spacing.xs,
}

const $actionButtonText = (colors: any): TextStyle => ({
  color: colors.text,
  fontSize: 12,
  textAlign: "center",
  fontFamily: typography.primary.medium,
})

// Upnext Section
const $upnextSection = (colors: any): ViewStyle => ({
  flex: 1,
  backgroundColor: colors.background,
})

const $upnextHeader = (colors: any): ViewStyle => ({
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  paddingHorizontal: spacing.lg,
  borderTopWidth: 1,
  borderTopColor: colors.palette.neutral300,
})

const $upnextTitle = (colors: any): TextStyle => ({
  fontSize: 18,
  color: colors.text,
})

const $autoplayContainer: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  gap: spacing.sm,
}

const $autoplayLabel = (colors: any): TextStyle => ({
  fontSize: 14,
  color: colors.text,
  fontFamily: typography.primary.medium,
})

const $upnextListContent = (colors: any): ViewStyle => ({
  // paddingBottom: spacing.xl,
  backgroundColor: colors.background,
})

const $emptyContainer: ViewStyle = {
  paddingVertical: spacing.xxl,
  alignItems: "center",
}

const $emptyText = (colors: any): TextStyle => ({
  fontSize: 16,
  color: colors.palette.neutral500,
})

export default AudioPlayerScreen
