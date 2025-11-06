/**
 * Test script for Supabase Fetcher Service
 *
 * This script tests the fetchDailyDuas function to ensure it works correctly.
 * Run with: node test-supabase-fetcher.js
 */

const { createClient } = require("@supabase/supabase-js")

// You'll need to set these environment variables
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || "https://your-project.supabase.co"
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "your-anon-key"

const supabase = createClient(supabaseUrl, supabaseKey)

/**
 * Test the fetchDailyDuas function
 */
async function testFetchDailyDuas() {
  console.log("🧪 Testing Supabase Fetcher Service...")
  console.log("📅 Fetching daily duas for January 15th...")

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
      .eq("date", 15)
      .eq("month", 1)
      .contains("library.categories", ["daily-dua"])
      .order("created_at", { ascending: true })

    if (error) {
      console.error("❌ Error:", error.message)
      return
    }

    console.log("✅ Success!")
    console.log(`📊 Found ${data?.length || 0} daily duas for January 15th`)

    if (data && data.length > 0) {
      console.log("\n📋 Sample data:")
      data.slice(0, 2).forEach((item, index) => {
        console.log(`\n${index + 1}. Daily Dua ID: ${item.id}`)
        console.log(`   Date: ${item.date}/${item.month}`)
        console.log(`   Library: ${item.library?.name || "N/A"}`)
        console.log(`   Description: ${item.library?.description || "N/A"}`)
        console.log(`   Audio: ${item.library?.audio_url ? "✅" : "❌"}`)
        console.log(`   PDF: ${item.library?.pdf_url ? "✅" : "❌"}`)
      })
    } else {
      console.log("ℹ️  No daily duas found for January 15th")
    }
  } catch (error) {
    console.error("❌ Unexpected error:", error.message)
  }
}

/**
 * Test fetching today's daily duas
 */
async function testTodayDailyDuas() {
  console.log("\n🧪 Testing today's daily duas...")

  const today = new Date()
  const date = today.getDate()
  const month = today.getMonth() + 1

  console.log(`📅 Fetching daily duas for today (${date}/${month})...`)

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
      .eq("library.categories", "daily-dua")
      .order("created_at", { ascending: true })

    if (error) {
      console.error("❌ Error:", error.message)
      return
    }

    console.log("✅ Success!")
    console.log(`📊 Found ${data?.length || 0} daily duas for today`)

    if (data && data.length > 0) {
      console.log("\n📋 Today's daily duas:")
      data.forEach((item, index) => {
        console.log(`${index + 1}. ${item.library?.name || "Unnamed"}`)
      })
    } else {
      console.log("ℹ️  No daily duas found for today")
    }
  } catch (error) {
    console.error("❌ Unexpected error:", error.message)
  }
}

/**
 * Test connection to Supabase
 */
async function testConnection() {
  console.log("🔌 Testing Supabase connection...")

  try {
    const { data, error } = await supabase.from("daily_duas").select("count").limit(1)

    if (error) {
      console.error("❌ Connection failed:", error.message)
      return false
    }

    console.log("✅ Connection successful!")
    return true
  } catch (error) {
    console.error("❌ Connection error:", error.message)
    return false
  }
}

/**
 * Main test function
 */
async function runTests() {
  console.log("🚀 Starting Supabase Fetcher Tests\n")

  // Test connection first
  const connected = await testConnection()
  if (!connected) {
    console.log("\n❌ Cannot proceed without connection")
    return
  }

  // Run tests
  await testFetchDailyDuas()
  await testTodayDailyDuas()

  console.log("\n✅ All tests completed!")
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests().catch(console.error)
}

module.exports = {
  testFetchDailyDuas,
  testTodayDailyDuas,
  testConnection,
  runTests,
}
