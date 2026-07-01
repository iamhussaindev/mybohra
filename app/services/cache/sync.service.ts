import { apiSupabase } from "app/services/api"

import { cacheData, getCachedData, initializeOfflineDB, type CacheTable } from "./sqlite.service"

async function fetchAndCache<T extends { id: string | number }>(
  table: CacheTable,
  fetcher: () => Promise<{ kind: string; data?: unknown }>,
  transform?: (data: unknown) => T[],
): Promise<T[]> {
  try {
    const response = await fetcher()
    if (response.kind !== "ok") {
      throw new Error(`Fetch failed: ${response.kind}`)
    }
    const items = transform ? transform(response.data) : (response.data as T[])
    if (items.length > 0) {
      await cacheData(table, items)
    }
    return items
  } catch {
    return getCachedData<T>(table)
  }
}

export async function syncOfflineData(): Promise<void> {
  await initializeOfflineDB()

  await Promise.all([
    fetchAndCache("mazaars", () => apiSupabase.fetchMazaars({ limit: 500 })),
    fetchAndCache("miqaat", () => apiSupabase.fetchMiqaats(), (data) => {
      const payload = data as { miqaats: Array<{ id: number }> }
      return payload.miqaats.map((m) => ({ ...m, id: String(m.id) })) as never
    }),
    fetchAndCache("library", () => apiSupabase.fetchDailyDuas(), (data) => {
      const rows = (data as Array<{ id: number; library?: { name?: string } }>) ?? []
      return rows.map((row) => ({
        ...row,
        id: String(row.id),
        title: row.library?.name,
      })) as never
    }),
  ])
}

export async function getOfflineMazaars<T>(): Promise<T[]> {
  await initializeOfflineDB()
  return getCachedData<T>("mazaars")
}

export async function getOfflineMiqaats<T>(): Promise<T[]> {
  await initializeOfflineDB()
  return getCachedData<T>("miqaat")
}

export async function getOfflineLibrary<T>(): Promise<T[]> {
  await initializeOfflineDB()
  return getCachedData<T>("library")
}
