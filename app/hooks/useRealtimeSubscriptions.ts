import { useQueryClient } from "@tanstack/react-query"
import { useEffect } from "react"

import {
  subscribeToBusinessListings,
  subscribeToMiqaatChanges,
  subscribeToPosts,
} from "app/services/supabase/subscriptions"
import { businessQueryKeys } from "app/services/supabase/queries/business.query"
import { miqaatQueryKeys } from "app/services/supabase/queries/miqaat.query"

/**
 * Subscribes to Supabase Realtime for business, post, and miqaat tables.
 * Invalidates TanStack Query caches on changes.
 */
export function useRealtimeSubscriptions(enabled = true) {
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!enabled) return

    const unsubBusiness = subscribeToBusinessListings(
      () => void queryClient.invalidateQueries({ queryKey: businessQueryKeys.all }),
      () => void queryClient.invalidateQueries({ queryKey: businessQueryKeys.all }),
      () => void queryClient.invalidateQueries({ queryKey: businessQueryKeys.all }),
    )

    const unsubMiqaat = subscribeToMiqaatChanges(
      () => void queryClient.invalidateQueries({ queryKey: miqaatQueryKeys.all }),
      () => void queryClient.invalidateQueries({ queryKey: miqaatQueryKeys.all }),
      () => void queryClient.invalidateQueries({ queryKey: miqaatQueryKeys.all }),
    )

    const unsubPosts = subscribeToPosts(
      () => void queryClient.invalidateQueries({ queryKey: businessQueryKeys.all }),
      () => void queryClient.invalidateQueries({ queryKey: businessQueryKeys.all }),
      () => void queryClient.invalidateQueries({ queryKey: businessQueryKeys.all }),
    )

    return () => {
      unsubBusiness()
      unsubMiqaat()
      unsubPosts()
    }
  }, [enabled, queryClient])
}
