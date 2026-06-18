import type { Tables } from "app/services/supabase/types"
import { create } from "zustand"

type MazaarRow = Tables<"mazaars">

interface MazaarState {
  currentMazaar: MazaarRow | null
  isInsideMazaar: boolean
  favoriteIds: string[]

  setCurrentMazaar: (mazaar: MazaarRow | null) => void
  setIsInsideMazaar: (inside: boolean) => void
  toggleFavorite: (id: string) => void
  isFavorite: (id: string) => boolean
}

export const useMazaarStore = create<MazaarState>((set, get) => ({
  currentMazaar: null,
  isInsideMazaar: false,
  favoriteIds: [],

  setCurrentMazaar: (mazaar) => set({ currentMazaar: mazaar }),
  setIsInsideMazaar: (inside) => set({ isInsideMazaar: inside }),

  toggleFavorite: (id) => {
    const { favoriteIds } = get()
    const next = favoriteIds.includes(id)
      ? favoriteIds.filter((f) => f !== id)
      : [...favoriteIds, id]
    set({ favoriteIds: next })
  },

  isFavorite: (id) => get().favoriteIds.includes(id),
}))
