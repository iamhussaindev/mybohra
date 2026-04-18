import { useLocationCoords } from "app/hooks/useLocationCoords"
import { useStores } from "app/models"
import { trackDevice } from "app/services/deviceTracking"
import { useEffect, useState, useRef, useCallback } from "react"
import { AppState, AppStateStatus } from "react-native"

interface UseDeviceTrackingReturn {
  isTracking: boolean
  lastTracked: Date | null
  error: string | null
  track: () => Promise<void>
}

/**
 * Hook for device tracking
 * Automatically tracks device on mount and when app comes to foreground
 * Includes location tracking when location is available
 * Only tracks location changes when city name changes
 */
export function useDeviceTracking(
  autoTrack = true,
  locationThresholdMeters = 1000,
): UseDeviceTrackingReturn {
  const [isTracking, setIsTracking] = useState(false)
  const [lastTracked, setLastTracked] = useState<Date | null>(null)
  const [error, setError] = useState<string | null>(null)
  const appState = useRef(AppState.currentState)
  const locationCoords = useLocationCoords()
  const { dataStore } = useStores()

  // Track last city to detect city changes
  const lastCityRef = useRef<string | null>(null)
  const isInitializedRef = useRef(false)
  const lastTrackTimeRef = useRef<number>(0)
  const TRACK_COOLDOWN_MS = 5000 // 5 seconds cooldown between tracks

  // Initialize lastCityRef with current city on first load
  useEffect(() => {
    if (
      !isInitializedRef.current &&
      dataStore.currentLocationLoaded &&
      dataStore.currentLocation.city
    ) {
      lastCityRef.current = dataStore.currentLocation.city
      isInitializedRef.current = true
    }
  }, [dataStore.currentLocationLoaded, dataStore.currentLocation.city])

  // Use refs to avoid including reactive values in dependencies
  const locationCoordsRef = useRef(locationCoords)
  const dataStoreRef = useRef(dataStore)

  // Update refs when values change
  useEffect(() => {
    locationCoordsRef.current = locationCoords
  }, [locationCoords])

  useEffect(() => {
    dataStoreRef.current = dataStore
  }, [dataStore])

  const track = useCallback(
    async (logCityChange = false) => {
      if (isTracking) return // Prevent concurrent tracking

      // Cooldown check - prevent rapid-fire requests
      const now = Date.now()
      if (now - lastTrackTimeRef.current < TRACK_COOLDOWN_MS) {
        if (__DEV__) {
          console.log("Device tracking skipped - cooldown active")
        }
        return
      }

      setIsTracking(true)
      setError(null)
      lastTrackTimeRef.current = now

      try {
        // Use refs to get current values without including them in dependencies
        const currentLocationCoords = locationCoordsRef.current
        const currentDataStore = dataStoreRef.current

        // Pass location if available
        const result = await trackDevice(currentLocationCoords, locationThresholdMeters)
        if (result.success) {
          setLastTracked(new Date())
          // Only log when explicitly requested (city change) AND location was updated
          if (
            logCityChange &&
            result.locationUpdated &&
            currentLocationCoords &&
            currentDataStore.currentLocationLoaded
          ) {
            const currentCity = currentDataStore.currentLocation.city
            if (currentCity) {
              console.log("Device location updated - City changed:", {
                city: currentCity,
                country: currentDataStore.currentLocation.country,
                coordinates: currentLocationCoords,
              })
            }
          }
        } else {
          // Only set error if it's not a network error (network errors are expected when offline)
          if (result.error && result.error !== "Network unavailable") {
            setError(result.error)
          }
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Unknown error"
        // Only set error if it's not a network error
        if (!errorMessage.includes("Network request failed") && !errorMessage.includes("fetch")) {
          setError(errorMessage)
          console.error("Device tracking error:", err)
        } else {
          // Network errors are expected when offline - don't log them repeatedly
          // Suppress network errors to prevent infinite loops
        }
      } finally {
        setIsTracking(false)
      }
    },
    [isTracking, locationThresholdMeters],
  )

  // Store track function in ref to avoid dependency issues
  const trackRef = useRef(track)
  useEffect(() => {
    trackRef.current = track
  }, [track])

  // Track on mount and foreground - only run once on mount
  useEffect(() => {
    if (!autoTrack) return

    // Track on mount only once
    let mounted = true
    const initialTimer = setTimeout(() => {
      if (mounted) {
        trackRef.current()
      }
    }, 2000) // Delay initial track to avoid immediate network calls

    // Track when app comes to foreground
    const subscription = AppState.addEventListener("change", (nextAppState: AppStateStatus) => {
      if (appState.current.match(/inactive|background/) && nextAppState === "active") {
        // App has come to the foreground - delay to avoid rapid calls
        setTimeout(() => {
          trackRef.current()
        }, 1000)
      }
      appState.current = nextAppState
    })

    return () => {
      mounted = false
      clearTimeout(initialTimer)
      subscription.remove()
    }
  }, [autoTrack])

  // Track when city changes (not coordinates) - only log when city name changes
  useEffect(() => {
    if (!autoTrack || !dataStore.currentLocationLoaded) return undefined

    const currentCity = dataStore.currentLocation.city

    // Only track if city exists, is not empty, and has actually changed
    if (
      currentCity &&
      currentCity.trim() !== "" &&
      isInitializedRef.current &&
      currentCity !== lastCityRef.current
    ) {
      // Update the ref immediately to prevent duplicate tracking
      lastCityRef.current = currentCity

      // Small delay to ensure location coordinates are also updated
      const timer = setTimeout(() => {
        // Pass true to indicate we should log city change
        trackRef.current(true)
      }, 2000) // Wait 2 seconds after city change to avoid rapid calls

      return () => clearTimeout(timer)
    }

    return undefined
  }, [dataStore.currentLocation.city, dataStore.currentLocationLoaded, autoTrack])

  return {
    isTracking,
    lastTracked,
    error,
    track,
  }
}
