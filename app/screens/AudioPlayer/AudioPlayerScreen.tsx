import Slider from "@react-native-community/slider"
import {
  IconBookmark,
  IconCast,
  IconCloudDownload,
  IconHeart,
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
import { AppStackScreenProps } from "app/navigators"
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
import { State } from "react-native-track-player"

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
      skipToNext,
      skipToPrevious,
    } = useSoundPlayer()

    const album = route.params?.album as string | undefined
    const [tracks, setTracks] = useState<ILibrary[]>([])
    const [currentTrackIndex, setCurrentTrackIndex] = useState(0)
    const [autoplay, setAutoplay] = useState(true)
    const loadedAlbumRef = useRef<string | null>(null)
    const playQueueRef = useRef(playQueue)

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
          return
        }

        // Skip if we've already loaded this album
        if (loadedAlbumRef.current === album) {
          return
        }
        try {
          // Fetch tracks for the album, filtering for items with audio
          console.log("fetching tracks for album", album)
          const items = await libraryStore.fetchByAlbum(album, { filterAudioOnly: true })
          setTracks(items)
          loadedAlbumRef.current = album

          // Check if current track is from the same album
          const isCurrentTrackFromSameAlbum =
            currentSound && currentTrackAlbum && currentTrackAlbum === album

          if (items.length > 0) {
            if (isCurrentTrackFromSameAlbum) {
              // Continue playing current track - don't reset the queue
              // Just sync the current track index
              const currentTrackId = currentSound.id?.toString()
              if (currentTrackId) {
                const index = items.findIndex((t) => t.id.toString() === currentTrackId)
                if (index !== -1) {
                  setCurrentTrackIndex(index)
                }
              }
            } else {
              // Different album or no current track - start new queue
              await playQueueRef.current(items, 0)
              setCurrentTrackIndex(0)
            }
          }
        } catch (error) {
          console.error("Error loading tracks:", error)
        }
      }

      loadTracks()
    }, [album, libraryStore, currentSound?.id, currentTrackAlbum])

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

    const handleTrackPress = async (item: ILibrary, index?: number) => {
      if (tracks.length > 0 && index !== undefined) {
        // Check if this is the currently playing track
        const isCurrentTrack = currentSound?.id?.toString() === item.id.toString()

        if (isCurrentTrack) {
          // If clicking on the currently playing track, toggle play/pause
          toggleSound()
        } else {
          // Otherwise, switch to the selected track
          await playQueue(tracks, index)
          setCurrentTrackIndex(index)
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
        const wasPinned = dataStore.isPdfPinned(currentTrackItem.id)
        await dataStore.togglePinPdf(currentTrackItem)
        Alert.alert(
          wasPinned ? "Unpinned" : "Saved",
          `"${currentTrackItem.name}" has been ${
            wasPinned ? "unpinned" : "saved"
          } to your home screen.`,
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
      if (currentTrackItem?.metadata?.audioSize) {
        const sizeMB = currentTrackItem.metadata.audioSize / (1024 * 1024)
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
              <Icon icon="arrowLeft" size={24} color={colors.white} />
            </Pressable>
            <View style={$headerRightActions}>
              <Pressable style={$headerActionButton} hitSlop={8}>
                <IconHeart size={24} color={colors.white} />
              </Pressable>
              <Pressable style={$headerActionButton} hitSlop={8}>
                <IconCast size={24} color={colors.white} />
              </Pressable>
            </View>
          </View>

          {/* Large Circular Visualizer with Controls */}
          <View style={$visualizerContainer}>
            <Pressable onPress={handlePrevious} style={$skipButtonLeft}>
              <IconPlayerSkipBackFilled size={28} color={colors.white} />
            </Pressable>

            <Pressable onPress={toggleSound} style={$circularVisualizer}>
              <View style={$visualizerInner}>
                <View style={$playPauseOverlay}>
                  {currentSound ? (
                    <Icon
                      icon={state === State.Playing ? "pause" : "play"}
                      size={48}
                      color={colors.white}
                    />
                  ) : (
                    <ActivityIndicator size="small" color={colors.white} />
                  )}
                </View>
              </View>
            </Pressable>

            <Pressable
              onPress={handleNext}
              style={$skipButtonRight}
              disabled={currentTrackIndex >= tracks.length - 1}
            >
              <IconPlayerSkipForwardFilled size={28} color={colors.white} />
            </Pressable>
          </View>

          {/* Seekbar */}
          <View style={$seekbarContainer}>
            <Slider
              style={$seekbar}
              minimumValue={0}
              maximumValue={duration ?? 1}
              value={position ?? 0}
              minimumTrackTintColor={colors.white}
              maximumTrackTintColor="rgba(255, 255, 255, 0.3)"
              thumbTintColor={colors.white}
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
        <View style={[$trackInfoContent, $trackInfoSection(colors)]}>
          <View style={$trackInfoContentContainer}>
            {currentTrackItem?.name ? (
              <Text style={$trackTitle(colors)} weight="bold">
                {currentTrackItem?.name}
              </Text>
            ) : (
              <Skeleton width="50%" height={30} borderRadius={4} style={$trackTitle(colors)} />
            )}
          </View>

          {/* Action Buttons */}
          <View style={$actionButtonsContainer}>
            {currentTrackItem?.pdf_url && (
              <Pressable style={$actionButton} onPress={handleOpenPDF}>
                <View style={[$actionIconContainer, $actionIconContainerFilled(colors)]}>
                  <IconPdf size={18} color={colors.white} />
                </View>
                <Text style={$actionButtonText(colors)} size="xs">
                  PDF
                </Text>
              </Pressable>
            )}

            <Pressable style={$actionButton} onPress={handleSpeedPress}>
              <View style={$actionIconContainer}>
                <IconProgressBolt size={28} color={colors.darkHighlight} />
              </View>
              <Text style={$actionButtonText(colors)} size="xs">
                {getSpeedLabel()}
              </Text>
            </Pressable>

            <Pressable style={$actionButton} onPress={handleDownload}>
              <View style={$actionIconContainer}>
                <IconCloudDownload size={28} color={colors.darkHighlight} />
              </View>
              <Text style={$actionButtonText(colors)} size="xs">
                {getFileSize()}
              </Text>
            </Pressable>

            <Pressable style={$actionButton} onPress={handleSave}>
              <View style={$actionIconContainer}>
                <IconBookmark size={28} color={colors.darkHighlight} />
              </View>
              <Text style={$actionButtonText(colors)} size="xs">
                Save
              </Text>
            </Pressable>

            <Pressable style={$actionButton} onPress={handleShare}>
              <View style={$actionIconContainer}>
                <IconShare size={28} color={colors.darkHighlight} />
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
            scrollEnabled={false}
            data={tracks}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item, index }) => {
              const audioLength = item.metadata?.audioLength
                ? formatDuration(item.metadata.audioLength)
                : "00:00"

              return (
                <AudioItem
                  item={item}
                  currentSound={currentSound}
                  state={state}
                  onPress={handleTrackPress}
                  index={index}
                  subtitle={`Audio Length: ${audioLength}`}
                />
              )
            }}
            contentContainerStyle={$upnextListContent}
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
  padding: spacing.xs,
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
  height: 40,
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
  color: colors.white,
  fontFamily: typography.primary.medium,
})

// Track Information Section (Light Beige)
const $trackInfoSection = (colors: any): ViewStyle => ({
  backgroundColor: colors.palette.neutral100,
})

const $trackInfoContent: ViewStyle = {
  paddingVertical: spacing.lg,
  alignItems: "center",
}

const $trackTitle = (colors: any): TextStyle => ({
  fontSize: 20,
  color: colors.text,
  marginBottom: spacing.xs,
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
  backgroundColor: colors.darkHighlight,
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
  backgroundColor: colors.palette.neutral100,
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

const $upnextListContent: ViewStyle = {
  // paddingBottom: spacing.xl,
}

const $emptyContainer: ViewStyle = {
  paddingVertical: spacing.xxl,
  alignItems: "center",
}

const $emptyText = (colors: any): TextStyle => ({
  fontSize: 16,
  color: colors.palette.neutral500,
})

export default AudioPlayerScreen
