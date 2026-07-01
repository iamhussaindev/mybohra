import { useQuery } from "@tanstack/react-query"
import { apiSupabase } from "app/services/api"
import { getOfflineLibrary, getOfflineMazaars, getOfflineMiqaats } from "app/services/cache"
import { FUSE_DEFAULTS, createFuseIndex, fuzzySearch } from "app/services/search/fuse.service"

import type { BusinessRow } from "./business.query"
import { supabase } from "../client"
import { unwrapApiResponse } from "./query-utils"

export type UniversalSearchProduct = {
  id: string
  title: string
  description: string | null
  images: string[] | null
  business_id: string
  slug: string
  is_product: boolean | null
}

export type UniversalSearchResults = {
  miqaats: Awaited<ReturnType<typeof searchMiqaats>>
  mazaars: Awaited<ReturnType<typeof searchMazaars>>
  pdfs: Awaited<ReturnType<typeof fetchPdfsForSearch>>
  products: UniversalSearchProduct[]
  businesses: BusinessRow[]
}

export const searchQueryKeys = {
  all: ["search"] as const,
  universal: (query: string) => [...searchQueryKeys.all, "universal", query] as const,
}

async function searchViaEdgeFunction(query: string): Promise<UniversalSearchResults | null> {
  const { data, error } = await supabase.functions.invoke("search", {
    body: { query },
  })

  if (error || !data || typeof data !== "object") return null

  const payload = data as UniversalSearchResults & { error?: string }
  if ("error" in payload && payload.error) return null

  return {
    miqaats: payload.miqaats ?? [],
    mazaars: payload.mazaars ?? [],
    pdfs: payload.pdfs ?? [],
    products: payload.products ?? [],
    businesses: payload.businesses ?? [],
  }
}

async function searchMiqaats(query: string) {
  try {
    const result = unwrapApiResponse(await apiSupabase.fetchMiqaats())
    const fuse = createFuseIndex(result.miqaats, FUSE_DEFAULTS.miqaat)
    return fuzzySearch(fuse, query, 20)
  } catch {
    const cached = await getOfflineMiqaats<{ name: string; description?: string | null }>()
    const fuse = createFuseIndex(cached, FUSE_DEFAULTS.miqaat)
    return fuzzySearch(fuse, query, 20)
  }
}

async function searchMazaars(query: string) {
  try {
    const mazaars = unwrapApiResponse(await apiSupabase.fetchMazaars({ limit: 500 }))
    const fuse = createFuseIndex(mazaars, FUSE_DEFAULTS.mazaar)
    return fuzzySearch(fuse, query, 20)
  } catch {
    const cached = await getOfflineMazaars<{ name: string }>()
    const fuse = createFuseIndex(cached, FUSE_DEFAULTS.mazaar)
    return fuzzySearch(fuse, query, 20)
  }
}

async function fetchPdfsForSearch(query: string) {
  try {
    return unwrapApiResponse(await apiSupabase.searchLibrary(query))
  } catch {
    const cached = await getOfflineLibrary<{ library?: { name?: string } }>()
    const fuse = createFuseIndex(
      cached.map((c) => ({ name: c.library?.name ?? "" })),
      { keys: ["name"], threshold: 0.35, ignoreLocation: true },
    )
    return fuzzySearch(fuse, query, 20) as never
  }
}

async function searchBusinesses(query: string) {
  try {
    const { data, error } = await supabase
      .from("business")
      .select("*")
      .ilike("business_name", `%${query}%`)
      .limit(20)

    if (error) throw error
    const rows = (data ?? []) as BusinessRow[]
    const fuse = createFuseIndex(rows, FUSE_DEFAULTS.business)
    return fuzzySearch(fuse, query, 20)
  } catch {
    return []
  }
}

async function searchClientSide(query: string): Promise<UniversalSearchResults> {
  const [miqaats, mazaars, pdfs, businesses] = await Promise.all([
    searchMiqaats(query),
    searchMazaars(query),
    fetchPdfsForSearch(query),
    searchBusinesses(query),
  ])

  return {
    miqaats,
    mazaars,
    pdfs,
    products: [],
    businesses,
  }
}

export function useUniversalSearch(query: string, enabled = true) {
  const trimmed = query.trim()

  return useQuery({
    queryKey: searchQueryKeys.universal(trimmed),
    queryFn: async (): Promise<UniversalSearchResults> => {
      const edge = await searchViaEdgeFunction(trimmed)
      if (edge) return edge
      return searchClientSide(trimmed)
    },
    enabled: enabled && trimmed.length >= 2,
    staleTime: 1000 * 60 * 5,
  })
}
