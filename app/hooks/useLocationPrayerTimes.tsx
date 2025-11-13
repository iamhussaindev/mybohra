import { useLocationCoords } from "app/hooks/useLocationCoords"
import { usePrayerTimes } from "app/hooks/usePrayerTimes"
import { currentTime } from "app/utils/currentTime"
import { useCallback, useEffect, useMemo } from "react"

/**
 * Custom hook that combines location coordinates with prayer times
 * Automatically fetches prayer times when location changes
 */
export function useLocationPrayerTimes() {
  const currentLocationCoords = useLocationCoords()
  const { times, getPrayerTimes, timesLoaded, isLoading, error } = usePrayerTimes()

  // Memoize the date to prevent infinite re-renders
  const date = useMemo(() => currentTime().toISOString(), [])

  // Fetch prayer times when location or date changes
  useEffect(() => {
    if (currentLocationCoords) {
      getPrayerTimes(currentLocationCoords.latitude, currentLocationCoords.longitude, date)
    }
  }, [currentLocationCoords, date, getPrayerTimes])

  // Manual refresh function
  const refreshPrayerTimes = useCallback(() => {
    if (currentLocationCoords) {
      getPrayerTimes(currentLocationCoords.latitude, currentLocationCoords.longitude, date)
    }
  }, [currentLocationCoords, date, getPrayerTimes])

  return {
    times,
    timesLoaded,
    isLoading,
    error,
    currentLocationCoords,
    refreshPrayerTimes,
  }
}
