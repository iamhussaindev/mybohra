import { useQuery } from "@tanstack/react-query"

import { supabase } from "../client"
import type { Tables } from "../types"

export type BusinessRow = Tables<"business">

export const businessQueryKeys = {
  all: ["business"] as const,
  list: (options?: { limit?: number; offset?: number }) =>
    [...businessQueryKeys.all, "list", options ?? {}] as const,
  detail: (id: string) => [...businessQueryKeys.all, "detail", id] as const,
}

export function useBusinesses(options?: { limit?: number; offset?: number }) {
  const limit = options?.limit ?? 50
  const offset = options?.offset ?? 0

  return useQuery({
    queryKey: businessQueryKeys.list(options),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("business")
        .select("*")
        .order("business_name", { ascending: true })
        .range(offset, offset + limit - 1)

      if (error) throw error
      return (data ?? []) as BusinessRow[]
    },
    staleTime: 1000 * 60 * 15,
    gcTime: 1000 * 60 * 60,
  })
}

export function useBusiness(id: string, enabled = true) {
  return useQuery({
    queryKey: businessQueryKeys.detail(id),
    queryFn: async () => {
      const { data, error } = await supabase.from("business").select("*").eq("id", id).single()

      if (error) throw error
      return data as BusinessRow
    },
    enabled: enabled && Boolean(id),
    staleTime: 1000 * 60 * 15,
  })
}
