import TrackPlayer, { Event } from "react-native-track-player"

export const PlaybackService = async function () {
  TrackPlayer.addEventListener(Event.RemotePlay, async () => {
    await TrackPlayer.play()
  })

  TrackPlayer.addEventListener(Event.RemotePause, async () => {
    await TrackPlayer.pause()
  })

  TrackPlayer.addEventListener(Event.RemoteNext, async () => {
    await TrackPlayer.skipToNext()
  })

  TrackPlayer.addEventListener(Event.RemotePrevious, async () => {
    await TrackPlayer.skipToPrevious()
  })

  TrackPlayer.addEventListener(Event.RemoteStop, async () => {
    await TrackPlayer.stop()
  })
}
