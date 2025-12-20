/**
 * This is the new Supabase-based API service that replaces the REST API
 * It uses Supabase's PostgREST API through the JavaScript client
 */
import { ITasbeeh } from "app/models"
import * as storage from "app/utils/storage"

import { DEFAULT_VERSIONS } from "../../constants/version-keys"
import { supabase } from "../supabase"
import type { Database } from "../supabase/types"

export type GeneralApiProblem =
  | { kind: "timeout"; temporary: true }
  | { kind: "cannot-connect"; temporary: true }
  | { kind: "server" }
  | { kind: "unauthorized" }
  | { kind: "forbidden" }
  | { kind: "not-found" }
  | { kind: "rejected" }
  | { kind: "unknown"; temporary: true }
  | { kind: "bad-data" }

type LocationRow = Database["public"]["Tables"]["location"]["Row"]
type LibraryRow = Database["public"]["Tables"]["library"]["Row"]
type MiqaatRow = Database["public"]["Tables"]["miqaat"]["Row"]
// type TasbeehRow = Database["public"]["Tables"]["tasbeeh"]["Row"]

type DataRow = Database["public"]["Tables"]["data"]["Row"]
type DailyDuaRow = Database["public"]["Tables"]["daily_duas"]["Row"]
/**
 * New Supabase-based API service using PostgREST
 */
export class ApiSupabase {
  /**
   * Fetch a data value by key
   */
  async fetchData(params: { key: string }): Promise<
    | {
        kind: "ok"
        data: DataRow
      }
    | GeneralApiProblem
  > {
    try {
      const { data, error } = await supabase.from("data").select("*").eq("key", params.key)

      if (error) {
        console.error("Error fetching data:", error)
        return { kind: "bad-data" }
      }

      // Handle case where no data exists
      if (!data || data.length === 0) {
        console.log(`No data found for key: ${params.key}`)
        return { kind: "not-found" }
      }

      return { kind: "ok", data: data[0] }
    } catch (error) {
      console.error("Error fetching data:", error)
      return { kind: "bad-data" }
    }
  }

  /**
   * Fetch version number for a key
   */
  async fetchVersion(key: string): Promise<
    | {
        kind: "ok"
        data: { version: number }
      }
    | GeneralApiProblem
  > {
    try {
      const { data, error } = await supabase.from("data").select("value").eq("key", key)

      if (error) {
        console.error("Error fetching version:", error)
        return { kind: "ok", data: { version: 1 } }
      }

      // Handle case where no data exists
      if (!data || data.length === 0) {
        const defaultVersion =
          DEFAULT_VERSIONS[key as unknown as keyof typeof DEFAULT_VERSIONS] || 1
        console.log(
          `No version data found for key: ${key}, using default version ${defaultVersion}`,
        )
        return { kind: "ok", data: { version: defaultVersion } }
      }

      const version = parseInt((data[0] as { value: string })?.value ?? "1", 10)
      return { kind: "ok", data: { version } }
    } catch (error) {
      console.error("Error fetching version:", error)
      return { kind: "ok", data: { version: 1 } }
    }
  }

  /**
   * Fetch location by coordinates
   */
  async fetchNearestLocation(
    lat: number,
    lng: number,
  ): Promise<
    | {
        kind: "ok"
        data: LocationRow
      }
    | GeneralApiProblem
  > {
    try {
      const cachedLocations = await storage.load("LOCATIONS")
      if (Array.isArray(cachedLocations) && cachedLocations.length > 0) {
        const nearestFromCache = this.findNearestLocation(
          lat,
          lng,
          cachedLocations as LocationRow[],
        )
        if (nearestFromCache) {
          return { kind: "ok", data: nearestFromCache }
        }
      }

      const { data, error } = await supabase.from("location").select("*")

      if (error) {
        console.error("Error fetching location:", error)
        return { kind: "bad-data" }
      }

      if (!data || data.length === 0) {
        return { kind: "not-found" }
      }

      await storage.save("LOCATIONS", data)
      const nearest = this.findNearestLocation(lat, lng, data as LocationRow[])
      return nearest ? { kind: "ok", data: nearest } : { kind: "not-found" }
    } catch (error) {
      console.error("Error fetching location:", error)
      return { kind: "bad-data" }
    }
  }

  /**
   * Helper function to calculate distance between two coordinates
   */
  private findNearestLocation(
    lat: number,
    lng: number,
    locations: LocationRow[],
  ): LocationRow | null {
    if (!locations || locations.length === 0) return null

    let nearest: LocationRow | null = null
    let minDistance = Number.POSITIVE_INFINITY

    for (const location of locations) {
      if (
        location?.latitude === undefined ||
        location?.longitude === undefined ||
        location.latitude === null ||
        location.longitude === null
      ) {
        continue
      }

      const distance = this.calculateDistance(lat, lng, location.latitude, location.longitude)
      if (distance < minDistance) {
        minDistance = distance
        nearest = location
      }
    }

    return nearest
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371 // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * (Math.PI / 180)
    const dLon = (lon2 - lon1) * (Math.PI / 180)
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  /**
   * Fetch all locations
   */
  async fetchLocations(): Promise<
    | {
        kind: "ok"
        data: LocationRow[]
      }
    | GeneralApiProblem
  > {
    try {
      const { data, error } = await supabase.from("location").select("*").order("city")

      if (error) {
        console.error("Error fetching locations:", error)
        return { kind: "bad-data" }
      }

      return { kind: "ok", data: data || [] }
    } catch (error) {
      console.error("Error fetching locations:", error)
      return { kind: "bad-data" }
    }
  }

  /**
   * Fetch all miqaats
   */
  async fetchMiqaats(): Promise<
    | {
        kind: "ok"
        data: { miqaats: MiqaatRow[] }
      }
    | GeneralApiProblem
  > {
    try {
      const { data, error } = await supabase
        .from("miqaat")
        .select("*")
        .order("month", { ascending: true })
        .order("date", { ascending: true })

      if (error) {
        console.error("Error fetching miqaats:", error)
        return { kind: "bad-data" }
      }

      return { kind: "ok", data: { miqaats: data || [] } }
    } catch (error) {
      console.error("Error fetching miqaats:", error)
      return { kind: "bad-data" }
    }
  }

  /**
   * Fetch daily duas
   */
  async fetchDailyDuas(): Promise<
    | {
        kind: "ok"
        data: DailyDuaRow[] | null | undefined
      }
    | GeneralApiProblem
  > {
    try {
      const { data, error } = await supabase
        .from("daily_duas")
        .select(
          `
          id,
          date,
          month,
          note,
          library:library_id (
            id,
            name,
            description,
            audio_url,
            pdf_url,
            youtube_url,
            album,
            metadata
          )
        `,
        )

        .order("date", { ascending: true })
        .order("month", { ascending: true })
      if (error) {
        console.error("Error fetching daily duas:", error)
        return { kind: "bad-data" }
      }
      return { kind: "ok", data: data || [] }
    } catch (error) {
      console.error("Error fetching daily duas:", error)
      return { kind: "bad-data" }
    }
  }

  /**
   * Fetch daily duas by specific date and month
   * Equivalent to TypeORM: find({ where: { date, month }, relations: { library: true }, order: { createdAt: 'ASC' } })
   */
  async fetchDailyDuasByDate(params: { date: number; month: number }): Promise<
    | {
        kind: "ok"
        data: any
      }
    | GeneralApiProblem
  > {
    try {
      const { data, error } = await supabase
        .from("daily_duas")
        .select(
          `
          id,
          date,
          month,
          library_id,
          note,
          created_at,
          updated_at,
          library!inner (
            id,
            name,
            description,
            audio_url,
            pdf_url,
            youtube_url,
            album,
            metadata,
            tags,
            categories,
            search_text,
            created_at,
            updated_at
          )
        `,
        )
        .eq("date", params.date)
        .eq("month", params.month)
        .order("created_at", { ascending: true })

      console.log("data", data)

      const { data: librariesFromCategories, error: error2 } = await supabase
        .from("library")
        .select("*")
        .overlaps("categories", ["daily-dua"])
        .order("created_at", { ascending: true })

      const todayDayNames = [
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
        "sunday",
      ]
      const duaJoshanDay = todayDayNames[(new Date().getDay() + 6) % 7]

      const { data: duaJoshanDayWise, error: error3 } = await supabase
        .from("library")
        .select("*")
        .overlaps("categories", ["dua-joshan", duaJoshanDay])
        .order("created_at", { ascending: true })

      if (error || error2 || error3) {
        console.error("Error fetching daily duas by date:", error, error2, error3)
        return { kind: "bad-data" }
      }

      const librariesFromDailyDuaTable = data.map((item: any) => ({ ...item.library }))
      const mergedData = [
        ...librariesFromDailyDuaTable,
        ...librariesFromCategories,
        ...duaJoshanDayWise,
      ]

      const uniqueData = mergedData.filter(
        (item, index, self) => index === self.findIndex((t) => t.id === item.id),
      )

      return { kind: "ok", data: uniqueData as any }
    } catch (error) {
      console.error("Error fetching daily duas by date:", error)
      return { kind: "bad-data" }
    }
  }

  async fetchTasbeeh(): Promise<
    | {
        kind: "ok"
        data: ITasbeeh[]
      }
    | GeneralApiProblem
  > {
    try {
      const { data, error } = await supabase.from("tasbeeh").select("*")

      if (error) {
        console.error("Error fetching tasbeeh:", error)
        return { kind: "bad-data" }
      }

      return { kind: "ok", data: data || [] }
    } catch (error) {
      console.error("Error fetching tasbeeh:", error)
      return { kind: "bad-data" }
    }
  }

  /**
   * Generic fetch method for custom queries
   */
  async fetch(endpoint: string): Promise<
    | {
        kind: "ok"
        data: any
      }
    | GeneralApiProblem
  > {
    try {
      // Map old REST endpoints to Supabase queries
      if (endpoint === "tasbeeh") {
        const { data, error } = await supabase.from("tasbeeh").select("*").order("name")

        if (error) {
          console.error("Error fetching tasbeeh:", error)
          return { kind: "bad-data" }
        }

        return { kind: "ok", data: data || [] }
      }

      if (endpoint === "library/all") {
        const { data, error } = await supabase
          .from("library")
          .select("*")
          .order("name")
          .eq("album", "DUA")
          .order("created_at", { ascending: true })

        if (error) {
          console.error("Error fetching library:", error)
          return { kind: "bad-data" }
        }

        // Transform the data to match the old API format
        const transformedData = (data as LibraryRow[])?.map((item) => ({
          id: item.id,
          name: item.name,
          description: item.description,
          audio: item.audio_url,
          pdf_url: item.pdf_url,
          youtube_url: item.youtube_url,
          metadata: item.metadata,
          album: item.album,
          tags: item.tags,
          categories: item.categories,
          created_at: item.created_at,
          updated_at: item.updated_at,
        }))

        return { kind: "ok", data: transformedData || [] }
      }

      if (endpoint === "library/daily-items") {
        // Get current date
        const now = new Date()
        const date = now.getDate()
        const month = now.getMonth() + 1

        const { data, error } = await supabase
          .from("daily_duas")
          .select(
            `
            id,
            date,
            month,
            note,
            library:library_id (
              id,
              name,
              description,
              audio_url,
              pdf_url,
              youtube_url,
              album,
              metadata
            )
          `,
          )
          .eq("date", date)
          .eq("month", month)

        if (error) {
          console.error("Error fetching daily library items:", error)
          return { kind: "bad-data" }
        }

        // Transform the data to match the old API format
        const transformedData =
          data?.map((item: any) => ({
            id: item.library.id,
            name: item.library.name,
            description: item.library.description,
            audio: item.library.audio_url,
            pdf_url: item.library.pdf_url,
            youtube_url: item.library.youtube_url,
            metadata: item.library.metadata,
            tags: item.library.tags,
            categories: item.library.categories,
            created_at: item.library.created_at,
            updated_at: item.library.updated_at,
            album: item.library.album,
          })) || []

        return { kind: "ok", data: transformedData }
      }

      return { kind: "not-found" }
    } catch (error) {
      console.error("Error in fetch:", error)
      return { kind: "bad-data" }
    }
  }

  /**
   * Fetch distinct albums from library
   */
  async fetchAlbums(): Promise<
    | {
        kind: "ok"
        data: Array<{ album: string; count: number }>
      }
    | GeneralApiProblem
  > {
    try {
      const { data, error } = await supabase
        .from("library")
        .select("album")
        .not("album", "is", null)
        .eq("album", "DUA")

      if (error) {
        console.error("Error fetching albums:", error)
        return { kind: "bad-data" }
      }

      // Count albums
      const albumCounts = new Map<string, number>()
      data?.forEach((item: { album: string | null }) => {
        if (item.album) {
          const album = item.album
          albumCounts.set(album, (albumCounts.get(album) || 0) + 1)
        }
      })

      const albums = Array.from(albumCounts.entries()).map(([album, count]) => ({
        album,
        count,
      }))

      return { kind: "ok", data: albums }
    } catch (error) {
      console.error("Error fetching albums:", error)
      return { kind: "bad-data" }
    }
  }

  /**
   * Fetch distinct categories from library
   */
  async fetchCategories(): Promise<
    | {
        kind: "ok"
        data: Array<{ id: string; title: string; description: string; count: number }>
      }
    | GeneralApiProblem
  > {
    try {
      const { data, error } = await supabase
        .from("library")
        .select("categories")
        .not("categories", "is", null)
      if (error) {
        console.error("Error fetching categories:", error)
        return { kind: "bad-data" }
      }

      // Count categories
      const categoryCounts = new Map<string, number>()
      data?.forEach((item: { categories: string[] | null }) => {
        if (item.categories && Array.isArray(item.categories)) {
          item.categories.forEach((category: string) => {
            categoryCounts.set(category, (categoryCounts.get(category) || 0) + 1)
          })
        }
      })

      const categories = Array.from(categoryCounts.entries()).map(([id, count]) => {
        let title = id
        if (id === "daily-dua") {
          title = "Daily Ibadat"
        } else {
          title = id.replace(/_/g, " ").replace(/-/g, " ")
        }

        return {
          id,
          title: title.replace("daily dua", "daily ibadat"),
          description: id,
          count,
        }
      })

      return { kind: "ok", data: categories }
    } catch (error) {
      console.error("Error fetching categories:", error)
      return { kind: "bad-data" }
    }
  }

  /**
   * Fetch distinct tags from library
   */
  async fetchTags(): Promise<
    | {
        kind: "ok"
        data: Array<{ tag: string; count: number }>
      }
    | GeneralApiProblem
  > {
    try {
      const { data, error } = await supabase
        .from("library")
        .select("tags")
        .eq("album", "DUA")
        .not("tags", "is", null)
        .order("created_at", { ascending: true })

      if (error) {
        console.error("Error fetching tags:", error)
        return { kind: "bad-data" }
      }

      // Count tags
      const tagCounts = new Map<string, number>()
      data?.forEach((item: { tags: string[] | null }) => {
        if (item.tags && Array.isArray(item.tags)) {
          item.tags.forEach((tag: string) => {
            tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1)
          })
        }
      })

      const tags = Array.from(tagCounts.entries()).map(([tag, count]) => ({
        tag,
        count,
      }))

      return { kind: "ok", data: tags }
    } catch (error) {
      console.error("Error fetching tags:", error)
      return { kind: "bad-data" }
    }
  }

  /**
   * Fetch library items by album
   */
  async fetchByAlbum(album: string): Promise<
    | {
        kind: "ok"
        data: LibraryRow[]
      }
    | GeneralApiProblem
  > {
    try {
      const { data, error } = await supabase
        .from("library")
        .select("id, name, pdf_url, audio_url, youtube_url")
        .eq("album", album)
        .order("name")

      if (error) {
        console.error("Error fetching by album:", error)
        return { kind: "bad-data" }
      }

      return { kind: "ok", data: (data || []) as LibraryRow[] }
    } catch (error) {
      console.error("Error fetching by album:", error)
      return { kind: "bad-data" }
    }
  }

  /**
   * Fetch library items by categories with pagination
   */
  async fetchByCategories(
    categories: string[],
    options?: { limit?: number; offset?: number },
  ): Promise<
    | {
        kind: "ok"
        data: LibraryRow[]
      }
    | GeneralApiProblem
  > {
    try {
      if (!categories || categories.length === 0) {
        return { kind: "ok", data: [] }
      }

      const limit = options?.limit ?? 50
      const offset = options?.offset ?? 0

      const query = supabase
        .from("library")
        .select("id, name, pdf_url, audio_url, youtube_url")
        .overlaps("categories", categories)
        .order("name")
        .range(offset, offset + limit - 1)

      const { data, error } = await query

      if (error) {
        console.error("Error fetching by categories:", error)
        return { kind: "bad-data" }
      }

      return { kind: "ok", data: (data || []) as LibraryRow[] }
    } catch (error) {
      console.error("Error fetching by categories:", error)
      return { kind: "bad-data" }
    }
  }

  /**
   * Fetch library items by tags
   */
  async fetchByTags(tags: string[]): Promise<
    | {
        kind: "ok"
        data: LibraryRow[]
      }
    | GeneralApiProblem
  > {
    try {
      if (!tags || tags.length === 0) {
        return { kind: "ok", data: [] }
      }

      const { data, error } = await supabase
        .from("library")
        .select("id, name, pdf_url, audio_url, youtube_url, created_at, updated_at")
        .overlaps(
          "tags",
          tags.map((tag) => tag.toLowerCase()),
        )
        .order("album", { ascending: true })
        .order("name")

      if (error) {
        console.error("Error fetching by tags:", error)
        return { kind: "bad-data" }
      }

      return { kind: "ok", data: (data || []) as LibraryRow[] }
    } catch (error) {
      console.error("Error fetching by tags:", error)
      return { kind: "bad-data" }
    }
  }

  /**
   * Fetch library items by IDs
   */
  async fetchLibraryItemsByIds(ids: number[]): Promise<
    | {
        kind: "ok"
        data: LibraryRow[]
      }
    | GeneralApiProblem
  > {
    try {
      if (!ids || ids.length === 0) {
        return { kind: "ok", data: [] }
      }

      const { data, error } = await supabase
        .from("library")
        .select("*")
        .in("id", ids)
        .eq("album", "DUA")
        .order("name")

      if (error) {
        console.error("Error fetching library items by IDs:", error)
        return { kind: "bad-data" }
      }

      return { kind: "ok", data: (data || []) as LibraryRow[] }
    } catch (error) {
      console.error("Error fetching library items by IDs:", error)
      return { kind: "bad-data" }
    }
  }

  /**
   * Search library using RPC function
   */
  async searchLibrary(searchQuery: string): Promise<
    | {
        kind: "ok"
        data: LibraryRow[]
      }
    | GeneralApiProblem
  > {
    try {
      if (!searchQuery || searchQuery.trim().length === 0) {
        return { kind: "ok", data: [] }
      }

      // @ts-ignore
      const { data, error } = await supabase.rpc("search_library", {
        p_query: searchQuery.trim(),
        p_limit: 20,
      })

      console.log("searchLibrary", data)

      if (error) {
        console.error("Error searching library:", error)
        return { kind: "bad-data" }
      }

      return { kind: "ok", data: (data || []) as LibraryRow[] }
    } catch (error) {
      console.error("Error searching library:", error)
      return { kind: "bad-data" }
    }
  }
}

// Singleton instance
export const apiSupabase = new ApiSupabase()
// Alias for backward compatibility
