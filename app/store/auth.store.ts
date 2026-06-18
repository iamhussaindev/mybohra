import type { Session, User } from "@supabase/supabase-js"
import {
  getSession,
  onAuthStateChange,
  signInWithOtp,
  signOut,
  verifyOtp,
} from "app/services/supabase/auth.service"
import { create } from "zustand"

interface AuthState {
  user: User | null
  session: Session | null
  isLoading: boolean
  isInitialized: boolean
  error: string | null

  initialize: () => () => void
  sendOtp: (email: string) => Promise<boolean>
  verifyOtpCode: (email: string, code: string) => Promise<boolean>
  signOut: () => Promise<void>
  clearError: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  isLoading: false,
  isInitialized: false,
  error: null,

  initialize: () => {
    let cancelled = false

    void getSession().then((session) => {
      if (cancelled) return
      set({
        session,
        user: session?.user ?? null,
        isInitialized: true,
      })
    })

    const unsubscribe = onAuthStateChange((_event, session) => {
      set({
        session,
        user: session?.user ?? null,
        isInitialized: true,
        isLoading: false,
      })
    })

    return () => {
      cancelled = true
      unsubscribe()
    }
  },

  sendOtp: async (email) => {
    set({ isLoading: true, error: null })
    const { error } = await signInWithOtp(email)
    if (error) {
      set({ error, isLoading: false })
      return false
    }
    set({ isLoading: false })
    return true
  },

  verifyOtpCode: async (email, code) => {
    set({ isLoading: true, error: null })
    const result = await verifyOtp(email, code)
    if ("error" in result) {
      set({ error: result.error, isLoading: false })
      return false
    }
    set({
      user: result.user,
      session: result.session,
      isLoading: false,
    })
    return true
  },

  signOut: async () => {
    set({ isLoading: true, error: null })
    const { error } = await signOut()
    if (error) {
      set({ error, isLoading: false })
      return
    }
    set({ user: null, session: null, isLoading: false })
  },

  clearError: () => set({ error: null }),
}))
