/**
 * Supabase Fetcher Service Usage Examples
 *
 * This file demonstrates how to use the Supabase fetcher service
 * to replace TypeORM queries with Supabase PostgREST API calls.
 */

import { supabaseFetcherService } from "./fetcher"

/**
 * Example 1: Fetch daily duas for a specific date
 *
 * This replaces the TypeORM query:
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
 */
export async function fetchDailyDuasExample() {
  // Example: Fetch daily duas for January 15th
  const result = await supabaseFetcherService.fetchDailyDuas({
    date: 15,
    month: 1,
  })

  if (result.success) {
    console.log("Daily duas found:", result.data)
    // result.data contains array of DailyDuaWithLibrary objects
    // Each object has the daily_duas fields plus the related library data
  } else {
    console.error("Error fetching daily duas:", result.error)
  }
}

/**
 * Example 2: Fetch today's daily duas
 */
export async function fetchTodayDailyDuasExample() {
  const result = await supabaseFetcherService.fetchTodayDailyDuas()

  if (result.success) {
    console.log("Today's daily duas:", result.data)
  } else {
    console.error("Error fetching today's daily duas:", result.error)
  }
}

/**
 * Example 3: Fetch daily duas by date and month (with daily_ category filter)
 */
export async function fetchDailyDuasByDateExample() {
  // Fetch for March 20th - only returns duas with "daily_" in library categories
  const result = await supabaseFetcherService.fetchDailyDuasByDate(20, 3)

  if (result.success) {
    console.log("March 20th daily duas (filtered by daily_ category):", result.data)
  } else {
    console.error("Error fetching daily duas:", result.error)
  }
}

/**
 * Example 4: Fetch all daily duas (for admin purposes)
 */
export async function fetchAllDailyDuasExample() {
  const result = await supabaseFetcherService.fetchAllDailyDuas()

  if (result.success) {
    console.log("All daily duas:", result.data)
  } else {
    console.error("Error fetching all daily duas:", result.error)
  }
}

/**
 * Example 5: Using in a React component or service
 */
export class DailyDuaService {
  async getDailyDuasForDate(date: number, month: number) {
    // Uses fetchDailyDuasByDate which includes the daily_ category filter
    const result = await supabaseFetcherService.fetchDailyDuasByDate(date, month)

    if (result.success) {
      return result.data
    } else {
      throw new Error(result.error)
    }
  }

  async getTodayDailyDuas() {
    const result = await supabaseFetcherService.fetchTodayDailyDuas()

    if (result.success) {
      return result.data
    } else {
      throw new Error(result.error)
    }
  }
}

/**
 * Example 6: Error handling patterns
 */
export async function errorHandlingExample() {
  try {
    const result = await supabaseFetcherService.fetchDailyDuas({ date: 15, month: 1 })

    if (!result.success) {
      // Handle specific error cases
      if (result.error?.includes("permission")) {
        console.error("Permission denied")
      } else if (result.error?.includes("network")) {
        console.error("Network error")
      } else {
        console.error("Unknown error:", result.error)
      }
      return
    }

    // Process successful result
    const dailyDuas = result.data
    console.log(`Found ${dailyDuas?.length || 0} daily duas for January 15th`)
  } catch (error) {
    console.error("Unexpected error:", error)
  }
}

/**
 * Example 7: TypeScript type safety
 */
export async function typeSafetyExample() {
  const result = await supabaseFetcherService.fetchDailyDuas({ date: 15, month: 1 })

  if (result.success && result.data) {
    // TypeScript knows the exact structure of result.data
    result.data.forEach((dailyDua) => {
      console.log(`Daily Dua ID: ${dailyDua.id}`)
      console.log(`Date: ${dailyDua.date}/${dailyDua.month}`)
      console.log(`Library Name: ${dailyDua.library.name}`)
      console.log(`Library Description: ${dailyDua.library.description}`)
      console.log(`Audio URL: ${dailyDua.library.audio_url}`)
      console.log(`PDF URL: ${dailyDua.library.pdf_url}`)

      // All properties are type-safe and autocompleted
    })
  }
}
