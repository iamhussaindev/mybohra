import { useQuery } from "@tanstack/react-query"
import { apiSupabase } from "app/services/api"

import type { BusinessRow } from "./business.query"
import { supabase } from "../client"
import { unwrapApiResponse } from "./query-utils"

export type UniversalSearchResults = {
  miqaats: Awaited<ReturnType<typeof fetchMiqaatsForSearch>>
  mazaars: Awaited<ReturnType<typeof fetchMazaarsForSearch>>
  pdfs: Awaited<ReturnType<typeof fetchPdfsForSearch>>
  products: BusinessRow[]
  businesses: BusinessRow[]
}

export const searchQueryKeys = {
  all: ["search"] as const,
  universal: (query: string) => [...searchQueryKeys.all, "universal", query] as const,
}

async function fetchMiqaatsForSearch(query: string) {
  const result = unwrapApiResponse(await apiSupabase.fetchMiqaats())
  const q = query.toLowerCase()
  return result.miqaats.filter(
    (m) =>
      (m.name ?? "").toLowerCase().includes(q) ||
      (m.description ?? "").toLowerCase().includes(q),
  )
}

async function fetchMazaarsForSearch(query: string) {
  const mazaars = unwrapApiResponse(await apiSupabase.fetchMazaars({ limit: 500 }))
  const q = query.toLowerCase()
  return mazaars.filter((m) => (m.name ?? "").toLowerCase().includes(q))
}

async function fetchPdfsForSearch(query: string) {
  return unwrapApiResponse(await apiSupabase.searchLibrary(query))
}

async function fetchBusinessesForSearch(query: string) {
  const { data, error } = await supabase
    .from("business")
    .select("*")
    .ilike("business_name", `%${query}%`)
    .limit(20)

  if (error) throw error
  return (data ?? []) as BusinessRow[]
}

/**
 * Universal search across entity types. Uses existing RPC/indexed search for PDFs
 * and client-side filtering for miqaats/mazaars until a unified edge function ships.
 */
export function useUniversalSearch(query: string, enabled = true) {
  const trimmed = query.trim()

  return useQuery({
    queryKey: searchQueryKeys.universal(trimmed),
    queryFn: async (): Promise<UniversalSearchResults> => {
      const [miqaats, mazaars, pdfs, businesses] = await Promise.all([
        fetchMiqaatsForSearch(trimmed),
        fetchMazaarsForSearch(trimmed),
        fetchPdfsForSearch(trimmed),
        fetchBusinessesForSearch(trimmed),
      ])

      return {
        miqaats,
        mazaars,
        pdfs,
        products: businesses,
        businesses,
      }
    },
    enabled: enabled && trimmed.length >= 2,
    staleTime: 1000 * 60 * 5,
  })
}
