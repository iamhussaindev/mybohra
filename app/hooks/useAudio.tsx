import { useStores } from "app/models"
import { ILibrary } from "app/models/LibraryStore"
import React, { createContext, ReactNode, useContext, useEffect, useState, useRef } from "react"
import TrackPlayer, {
  usePlaybackState,
  State,
  Track,
  useActiveTrack,
  TrackType,
  useProgress,
  Capability,
  AppKilledPlaybackBehavior,
} from "react-native-track-player"

interface SoundPlayerContextType {
  playSound: (sound: ILibrary, startedFrom?: "PDF" | "LIBRARY") => void
  playQueue: (sounds: ILibrary[], startIndex?: number) => void
  stopSound: () => void
  currentSound: Track | undefined
  toggleSound: () => void
  skipToNext: () => void
  skipToPrevious: () => void
  state: State | undefined
  duration: number | undefined
  position: number | undefined
  speed: number
  setSpeed: (speed: number) => void
  seek: (position: number) => void
}

const SoundPlayerContext = createContext<SoundPlayerContextType | null>(null)

export const useSoundPlayer = (): SoundPlayerContextType => {
  return useContext(SoundPlayerContext) as SoundPlayerContextType
}

const useProvideSoundPlayer = (): SoundPlayerContextType => {
  const { dataStore } = useStores()
  const [speed, setCurrentSpeed] = useState(1)
  const { state } = usePlaybackState()
  const previousStateRef = useRef<State | undefined>(undefined)
  const previousPositionRef = useRef<number>(0)

  const setupPlayer = async () => {
    await TrackPlayer.setupPlayer()
    // Configure capabilities for notification controls and background playback
    await TrackPlayer.updateOptions({
      capabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.SkipToNext,
        Capability.SkipToPrevious,
        Capability.Stop,
      ],
      compactCapabilities: [Capability.Play, Capability.Pause, Capability.SkipToNext],
      android: {
        appKilledPlaybackBehavior: AppKilledPlaybackBehavior.ContinuePlayback,
      },
    })
  }

  const seek = async (position: number) => {
    if (currentSound?.id) {
      const itemId =
        typeof currentSound.id === "string" ? parseInt(currentSound.id, 10) : currentSound.id
      dataStore.recordAudioSeek(itemId, position, duration ?? null)
    }
    await TrackPlayer.seekTo(position)
  }

  const setSpeed = (speed: number) => {
    TrackPlayer.setRate(speed)
    setCurrentSpeed(speed)
  }

  const currentSound = useActiveTrack()
  const { position, duration } = useProgress()

  useEffect(() => {
    setupPlayer()
    return () => {
      TrackPlayer.reset()
    }
  }, [])

  // Track state changes (play, pause, complete)
  useEffect(() => {
    if (!currentSound?.id) return

    const itemId =
      typeof currentSound.id === "string" ? parseInt(currentSound.id, 10) : currentSound.id
    const item = currentSound.item ? (JSON.parse(currentSound.item) as ILibrary) : null
    const startedFrom = (currentSound as any).startedFrom as "PDF" | "LIBRARY" | null | undefined

    // Track play
    if (state === State.Playing && previousStateRef.current !== State.Playing) {
      if (item) {
        dataStore.recordAudioPlay(itemId, {
          album: item.album ?? null,
          startedFrom: startedFrom ?? null,
        })
      }
    }

    // Track pause
    if (state === State.Paused && previousStateRef.current === State.Playing) {
      dataStore.recordAudioPause(itemId, position ?? 0, duration ?? null)
    }

    // Track completion
    if (state === State.Ended && previousStateRef.current !== State.Ended) {
      dataStore.recordAudioComplete(itemId, duration ?? null)
    }

    previousStateRef.current = state
  }, [state, currentSound?.id, dataStore, position, duration])

  useEffect(() => {
    if (state === State.Ended) {
      TrackPlayer.getQueue().then((queue) => {
        if (queue.length > 0) {
          TrackPlayer.skipToNext()
        }

        if (queue.length === 1 && queue[0].id === currentSound?.id) {
          const index = queue.findIndex((item) => item.id === currentSound?.id)
          TrackPlayer.reset()
          TrackPlayer.remove(index)
        }
      })
    }
  }, [state])

  const toggleSound = () => {
    if (state === State.Playing) {
      TrackPlayer.pause()
    } else {
      TrackPlayer.play()
    }
  }

  const playSound = (item: ILibrary, startedFrom?: "PDF" | "LIBRARY") => {
    TrackPlayer.reset()
    TrackPlayer.add({
      id: item.id,
      url: item.audio_url ?? "",
      title: item.name ?? "",
      artist: item.album ?? "",
      type: TrackType.SmoothStreaming,
      contentType: "audio/mpeg",
      startedFrom: startedFrom ?? "LIBRARY",
      item: JSON.stringify(item),
    })
    TrackPlayer.play()
    // Note: recordAudioPlay will be called automatically when state changes to Playing
  }

  const playQueue = async (sounds: ILibrary[], startIndex = 0) => {
    if (sounds.length === 0) return

    await TrackPlayer.reset()
    const tracks = sounds.map((item) => ({
      id: item.id.toString(),
      url: item.audio_url ?? "",
      title: item.name ?? "",
      artist: item.album ?? "",
      type: TrackType.SmoothStreaming,
      contentType: "audio/mpeg",
      startedFrom: "LIBRARY" as const,
      item: JSON.stringify(item),
    }))

    await TrackPlayer.add(tracks)
    if (startIndex > 0) {
      await TrackPlayer.skip(startIndex)
    }
    await TrackPlayer.play()
  }

  const skipToNext = async () => {
    await TrackPlayer.skipToNext()
  }

  const skipToPrevious = async () => {
    await TrackPlayer.skipToPrevious()
  }

  const stopSound = () => {
    if (state === State.Playing || state === State.Paused) {
      TrackPlayer.stop()
      TrackPlayer.reset()
    }
  }

  return {
    playSound,
    playQueue,
    stopSound,
    toggleSound,
    skipToNext,
    skipToPrevious,
    currentSound,
    state,
    duration,
    position,
    speed,
    setSpeed,
    seek,
  }
}

export const SoundProvider: React.FC<{ children: ReactNode }> = ({
  children,
}: {
  children: ReactNode
}) => {
  const player = useProvideSoundPlayer()
  return <SoundPlayerContext.Provider value={player}>{children}</SoundPlayerContext.Provider>
}
