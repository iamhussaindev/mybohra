import "@expo/metro-runtime"
import * as SplashScreen from "expo-splash-screen"
import React, { useEffect } from "react"
import TrackPlayer from "react-native-track-player"

import App from "./app/app"
import ErrorBoundary from "./app/components/ErrorBoundary"
import { analyticsService } from "./app/services/analytics"
import { realtimeMonitorService } from "./app/services/monitoring"
import { PlaybackService } from "./audio-service"

SplashScreen.preventAutoHideAsync()
TrackPlayer.registerPlaybackService(() => PlaybackService)

function IgniteApp() {
  useEffect(() => {
    // Initialize analytics and monitoring
    const initializeServices = async () => {
      try {
        await analyticsService.initialize()
        await realtimeMonitorService.initialize()
        console.log("Analytics and monitoring services initialized")
      } catch (error) {
        console.error("Failed to initialize services:", error)
      }
    }

    initializeServices()
  }, [])

  return (
    <ErrorBoundary>
      <App hideSplashScreen={SplashScreen.hideAsync} />
    </ErrorBoundary>
  )
}

export default IgniteApp
