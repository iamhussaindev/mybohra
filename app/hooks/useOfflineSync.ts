import { useQueryClient } from "@tanstack/react-query"
import { useEffect } from "react"

import { analytics } from "app/services/analytics.service"
import { syncOfflineData } from "app/services/cache"
import { miqaatQueryKeys } from "app/services/supabase/queries/miqaat.query"
import { mazaarQueryKeys } from "app/services/supabase/queries/mazaar.query"

/**
 * Syncs mazaars, miqaats, and library to SQLite on app launch.
 * Falls back to cache when offline.
 */
export function useOfflineSync(enabled = true) {
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!enabled) return

    void (async () => {
      try {
        await syncOfflineData()
        analytics.trackOfflineSync(true)
        await queryClient.invalidateQueries({ queryKey: mazaarQueryKeys.all })
        await queryClient.invalidateQueries({ queryKey: miqaatQueryKeys.all })
      } catch {
        analytics.trackOfflineSync(false)
      }
    })()
  }, [enabled, queryClient])
}
