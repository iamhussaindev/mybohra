import {
  CurrentGhari,
  NamazTimes,
  getCurrentGhari,
  getNextNamazKey,
} from "app/helpers/namaz.helper"
import { useCallback, useEffect, useState } from "react"

/**
 * Custom hook for managing next namaz information
 * Handles calculating next namaz key and current ghari with automatic updates
 */
export function useNextNamaz(times: NamazTimes, updateInterval = 1000) {
  const [nextNamazKey, setNextNamazKey] = useState<string>("")
  const [currentGhari, setCurrentGhari] = useState<CurrentGhari>()

  const updateNextNamaz = useCallback(() => {
    if (Object.keys(times).length > 0) {
      const nextKey = getNextNamazKey(times)
      setNextNamazKey(nextKey)
      const ghari = getCurrentGhari(times, nextKey)
      setCurrentGhari(ghari)
    }
  }, [times])

  // Update when times change
  useEffect(() => {
    updateNextNamaz()
  }, [updateNextNamaz])

  // Update every second
  useEffect(() => {
    if (Object.keys(times).length === 0) return

    const timer = setInterval(updateNextNamaz, updateInterval)
    return () => clearInterval(timer)
  }, [times, updateInterval, updateNextNamaz])

  return {
    nextNamazKey,
    currentGhari,
    updateNextNamaz,
  }
}
