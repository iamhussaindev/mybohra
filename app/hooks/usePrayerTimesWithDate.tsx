import { usePrayerTimes } from "app/hooks/usePrayerTimes"
import { Moment } from "moment"
import { useCallback, useEffect } from "react"

/**
 * Custom hook for managing prayer times with a specific date
 * Used in screens where user can select different dates
 */
export function usePrayerTimesWithDate(latitude: number, longitude: number, date: Moment) {
  const { times, getPrayerTimes, timesLoaded, isLoading, error } = usePrayerTimes()

  // Fetch prayer times when date changes
  useEffect(() => {
    getPrayerTimes(latitude, longitude, date.toISOString())
  }, [latitude, longitude, date, getPrayerTimes])

  // Manual refresh function
  const refreshPrayerTimes = useCallback(() => {
    getPrayerTimes(latitude, longitude, date.toISOString())
  }, [latitude, longitude, date, getPrayerTimes])

  return {
    times,
    timesLoaded,
    isLoading,
    error,
    refreshPrayerTimes,
  }
}
