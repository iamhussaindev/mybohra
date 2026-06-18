import { create } from "zustand"

export type BusinessCategoryFilter =
  | "all"
  | "rida"
  | "halal"
  | "photography"
  | "wedding"
  | "interior"
  | "travel"

interface BusinessState {
  favoriteIds: string[]
  categoryFilter: BusinessCategoryFilter
  searchQuery: string

  setCategoryFilter: (filter: BusinessCategoryFilter) => void
  setSearchQuery: (query: string) => void
  toggleFavorite: (id: string) => void
  isFavorite: (id: string) => boolean
}

export const useBusinessStore = create<BusinessState>((set, get) => ({
  favoriteIds: [],
  categoryFilter: "all",
  searchQuery: "",

  setCategoryFilter: (filter) => set({ categoryFilter: filter }),
  setSearchQuery: (query) => set({ searchQuery: query }),

  toggleFavorite: (id) => {
    const { favoriteIds } = get()
    const next = favoriteIds.includes(id)
      ? favoriteIds.filter((f) => f !== id)
      : [...favoriteIds, id]
    set({ favoriteIds: next })
  },

  isFavorite: (id) => get().favoriteIds.includes(id),
}))
