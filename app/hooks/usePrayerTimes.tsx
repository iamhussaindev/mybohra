import { NamazTimes } from "app/helpers/namaz.helper"
import { useCallback, useState } from "react"
import { NativeModules } from "react-native"

/**
 * Custom hook for managing prayer times
 * Handles fetching prayer times from native module and state management
 */
export function usePrayerTimes() {
  const [times, setTimes] = useState<NamazTimes>({} as NamazTimes)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getPrayerTimes = useCallback(async (lat: number, lon: number, date: string) => {
    try {
      setIsLoading(true)
      setError(null)

      NativeModules.SalaatTimes.getPrayerTimes(lat, lon, date, (times: any) => {
        setTimes(times)
        setIsLoading(false)
      })
      console.log("times", times)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch prayer times")
      setIsLoading(false)
    }
  }, [])

  const timesLoaded = Object.keys(times).length > 0

  return {
    times,
    setTimes,
    getPrayerTimes,
    timesLoaded,
    isLoading,
    error,
  }
}
