import "@expo/metro-runtime"
import React from "react"
import * as SplashScreen from "expo-splash-screen"
import App from "./app/app"
import TrackPlayer from "react-native-track-player"
import { PlaybackService } from "./audio-service"

SplashScreen.preventAutoHideAsync()
TrackPlayer.registerPlaybackService(() => PlaybackService)

function IgniteApp() {
  return <App hideSplashScreen={SplashScreen.hideAsync} />
}

export default IgniteApp
