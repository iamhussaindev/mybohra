import { useEffect } from "react"

import { useAuthStore } from "app/store"

/**
 * Subscribes to Supabase auth state and hydrates the Zustand auth store.
 * Mount once near the app root (alongside MST rehydration).
 */
export function useAuthInit() {
  const initialize = useAuthStore((s) => s.initialize)

  useEffect(() => {
    return initialize()
  }, [initialize])
}
