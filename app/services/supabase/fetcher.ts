/**
 * Supabase Fetcher Service
 *
 * This service provides methods to fetch data from Supabase using PostgREST API.
 * It replaces the need for manual SQL queries and provides type-safe data fetching.
 */

import { supabase } from "./supabase"
import type { Database } from "./types"

// Type definitions for better type safety
type DailyDuaRow = Database["public"]["Tables"]["daily_duas"]["Row"]
type LibraryRow = Database["public"]["Tables"]["library"]["Row"]

export interface DailyDuaWithLibrary {
  id: number
  date: number
  month: number
  library_id: number
  note: string | null
  created_at: string
  updated_at: string
  library: LibraryRow
}

export interface GetByDateDto {
  date: number
  month: number
}

/**
 * Supabase Fetcher Service
 */
export class SupabaseFetcherService {
  /**
   * Fetch daily duas by date and month
   *
   * This is equivalent to the TypeORM query:
   * ```typescript
   * return await this.dailyDuaRepository.find({
   *   where: {
   *     date: getByDateDto.date,
   *     month: getByDateDto.month,
   *   },
   *   relations: { library: true },
   *   order: {
   *     createdAt: 'ASC',
   *   },
   * });
   * ```
   *
   * @param getByDateDto - Object containing date and month
   * @returns Promise with daily duas data including library relations
   */
  async fetchDailyDuas(getByDateDto: GetByDateDto): Promise<{
    success: boolean
    data?: DailyDuaWithLibrary[]
    error?: string
  }> {
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
        .eq("date", getByDateDto.date)
        .eq("month", getByDateDto.month)
        .order("created_at", { ascending: true })

      if (error) {
        console.error("Error fetching daily duas:", error)
        return {
          success: false,
          error: error.message,
        }
      }

      return {
        success: true,
        data: data as DailyDuaWithLibrary[],
      }
    } catch (error) {
      console.error("Error in fetchDailyDuas:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }

  /**
   * Fetch daily duas for current date
   *
   * @returns Promise with today's daily duas
   */
  async fetchTodayDailyDuas(): Promise<{
    success: boolean
    data?: DailyDuaWithLibrary[]
    error?: string
  }> {
    const today = new Date()
    const date = today.getDate()
    const month = today.getMonth() + 1

    return this.fetchDailyDuas({ date, month })
  }

  /**
   * Fetch daily duas for a specific date with daily_ category filter
   *
   * @param date - Day of the month (1-31)
   * @param month - Month of the year (1-12)
   * @returns Promise with daily duas for the specified date (filtered by daily_ category)
   */
  async fetchDailyDuasByDate(
    date: number,
    month: number,
  ): Promise<{
    success: boolean
    data?: DailyDuaWithLibrary[]
    error?: string
  }> {
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
        .eq("date", date)
        .eq("month", month)
        .contains("library.categories", ["daily-dua"])
        .order("created_at", { ascending: true })

      if (error) {
        console.error("Error fetching daily duas by date:", error)
        return {
          success: false,
          error: error.message,
        }
      }

      return {
        success: true,
        data: data as DailyDuaWithLibrary[],
      }
    } catch (error) {
      console.error("Error in fetchDailyDuasByDate:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }

  /**
   * Fetch all daily duas (for admin purposes)
   *
   * @returns Promise with all daily duas
   */
  async fetchAllDailyDuas(): Promise<{
    success: boolean
    data?: DailyDuaWithLibrary[]
    error?: string
  }> {
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
        .order("created_at", { ascending: true })

      if (error) {
        console.error("Error fetching all daily duas:", error)
        return {
          success: false,
          error: error.message,
        }
      }

      return {
        success: true,
        data: data as DailyDuaWithLibrary[],
      }
    } catch (error) {
      console.error("Error in fetchAllDailyDuas:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }
}

// Export singleton instance
export const supabaseFetcherService = new SupabaseFetcherService()
export default supabaseFetcherService
