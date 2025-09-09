import "@expo/metro-runtime"
import * as SplashScreen from "expo-splash-screen"
import React from "react"
import TrackPlayer from "react-native-track-player"

import App from "./app/app"
import { PlaybackService } from "./audio-service"

SplashScreen.preventAutoHideAsync()
TrackPlayer.registerPlaybackService(() => PlaybackService)

function IgniteApp() {
  return <App hideSplashScreen={SplashScreen.hideAsync} />
}

export default IgniteApp
