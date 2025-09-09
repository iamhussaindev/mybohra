import { ILibrary } from "app/models/LibraryStore"
import React, { createContext, ReactNode, useContext, useEffect, useState } from "react"
import TrackPlayer, {
  usePlaybackState,
  State,
  Track,
  useActiveTrack,
  TrackType,
  useProgress,
} from "react-native-track-player"


interface SoundPlayerContextType {
  playSound: (sound: ILibrary, startedFrom?: "PDF" | "LIBRARY") => void
  stopSound: () => void
  currentSound: Track | undefined
  toggleSound: () => void
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
  const [speed, setCurrentSpeed] = useState(1)
  const { state } = usePlaybackState()

  const setupPlayer = async () => {
    await TrackPlayer.setupPlayer()
  }

  const seek = async (position: number) => {
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
      url: item.audio ?? "",
      title: item.name ?? "",
      artist: item.album ?? "",
      type: TrackType.SmoothStreaming,
      contentType: "audio/mpeg",
      startedFrom: startedFrom ?? "LIBRARY",
      item: JSON.stringify(item),
    })
    TrackPlayer.play()
  }

  const stopSound = () => {
    if (state === State.Playing || state === State.Paused) {
      TrackPlayer.stop()
      TrackPlayer.reset()
    }
  }

  return {
    playSound,
    stopSound,
    toggleSound,
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
