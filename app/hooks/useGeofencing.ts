import { useEffect } from "react"

import { findMazaarsWithinRadius, watchLocation } from "app/services/location/geofence.service"
import type { Tables } from "app/services/supabase/types"
import { useMazaarStore } from "app/store"

type MazaarRow = Tables<"mazaars">

/**
 * Watches device location and updates mazaar geofence state.
 * Uses balanced accuracy: 10s interval / 50m distance filter.
 */
export function useGeofencing(mazaars: MazaarRow[], enabled = true) {
  const setCurrentMazaar = useMazaarStore((s) => s.setCurrentMazaar)
  const setIsInsideMazaar = useMazaarStore((s) => s.setIsInsideMazaar)

  useEffect(() => {
    if (!enabled || mazaars.length === 0) return

    const stop = watchLocation((coords) => {
      const nearby = findMazaarsWithinRadius(coords, mazaars)
      if (nearby.length > 0) {
        setCurrentMazaar(nearby[0])
        setIsInsideMazaar(true)
      } else {
        setCurrentMazaar(null)
        setIsInsideMazaar(false)
      }
    })

    return stop
  }, [enabled, mazaars, setCurrentMazaar, setIsInsideMazaar])
}
