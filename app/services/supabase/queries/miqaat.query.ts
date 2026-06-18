import { useQuery } from "@tanstack/react-query"
import { apiSupabase } from "app/services/api"

import { unwrapApiResponse } from "./query-utils"

export const miqaatQueryKeys = {
  all: ["miqaats"] as const,
  list: () => [...miqaatQueryKeys.all, "list"] as const,
}

export function useMiqaats() {
  return useQuery({
    queryKey: miqaatQueryKeys.list(),
    queryFn: async () => {
      const result = unwrapApiResponse(await apiSupabase.fetchMiqaats())
      return result.miqaats
    },
    staleTime: 1000 * 60 * 60 * 24,
    gcTime: 1000 * 60 * 60 * 24,
  })
}
