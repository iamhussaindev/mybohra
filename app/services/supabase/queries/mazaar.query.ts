import { useQuery } from "@tanstack/react-query"
import { apiSupabase } from "app/services/api"

import { unwrapApiResponse } from "./query-utils"

export const mazaarQueryKeys = {
  all: ["mazaars"] as const,
  list: (options?: { limit?: number; offset?: number; location_id?: number }) =>
    [...mazaarQueryKeys.all, "list", options ?? {}] as const,
  detail: (id: string) => [...mazaarQueryKeys.all, "detail", id] as const,
}

export function useMazaars(options?: { limit?: number; offset?: number; location_id?: number }) {
  return useQuery({
    queryKey: mazaarQueryKeys.list(options),
    queryFn: async () => unwrapApiResponse(await apiSupabase.fetchMazaars(options)),
    staleTime: 1000 * 60 * 30,
    gcTime: 1000 * 60 * 60,
  })
}

export function useMazaar(id: string, enabled = true) {
  return useQuery({
    queryKey: mazaarQueryKeys.detail(id),
    queryFn: async () => {
      const mazaars = unwrapApiResponse(await apiSupabase.fetchMazaars({ limit: 500 }))
      const mazaar = mazaars.find((m) => String(m.id) === id)
      if (!mazaar) throw new Error("Mazaar not found")
      return mazaar
    },
    enabled: enabled && Boolean(id),
    staleTime: 1000 * 60 * 30,
  })
}
