import { useQuery } from "@tanstack/react-query"
import { apiSupabase } from "app/services/api"

import { unwrapApiResponse } from "./query-utils"

export const libraryQueryKeys = {
  all: ["library"] as const,
  dailyDuas: () => [...libraryQueryKeys.all, "daily-duas"] as const,
  categories: () => [...libraryQueryKeys.all, "categories"] as const,
  albums: (filterAudioOnly?: boolean) =>
    [...libraryQueryKeys.all, "albums", { filterAudioOnly }] as const,
  search: (query: string, album?: string | null) =>
    [...libraryQueryKeys.all, "search", query, album ?? null] as const,
}

export function useDailyDuas() {
  return useQuery({
    queryKey: libraryQueryKeys.dailyDuas(),
    queryFn: async () => unwrapApiResponse(await apiSupabase.fetchDailyDuas()),
    staleTime: 1000 * 60 * 60,
  })
}

export function useLibraryCategories() {
  return useQuery({
    queryKey: libraryQueryKeys.categories(),
    queryFn: async () => unwrapApiResponse(await apiSupabase.fetchCategories()),
    staleTime: 1000 * 60 * 60,
  })
}

export function useLibraryAlbums(filterAudioOnly?: boolean) {
  return useQuery({
    queryKey: libraryQueryKeys.albums(filterAudioOnly),
    queryFn: async () => unwrapApiResponse(await apiSupabase.fetchAlbums({ filterAudioOnly })),
    staleTime: 1000 * 60 * 60,
  })
}

export function useLibrarySearch(query: string, album?: string | null, enabled = true) {
  return useQuery({
    queryKey: libraryQueryKeys.search(query, album),
    queryFn: async () => unwrapApiResponse(await apiSupabase.searchLibrary(query, album)),
    enabled: enabled && query.trim().length >= 2,
    staleTime: 1000 * 60 * 5,
  })
}
