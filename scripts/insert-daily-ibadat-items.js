/**
 * Insert Daily Ibadat Dua items into library table
 *
 * This script inserts the 5 Daily Ibadat items with:
 * - category: "daily-ibadat"
 * - album: "DUA"
 *
 * Run with: node scripts/insert-daily-ibadat-items.js
 */

const { createClient } = require("@supabase/supabase-js")

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Error: EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY must be set in environment")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

const dailyIbadatItems = [
  "Al-Hirz-e-Saify",
  "Dua Hayat-e-Qaaf",
  "Dua-e-Yamani",
  "Dua Faazil",
  "Dua Mufarrej-ul-Korobaat",
]

async function insertDailyIbadatItems() {
  console.log("🔧 Inserting Daily Ibadat Dua items into library...\n")

  try {
    // Check if items already exist
    const { data: existingItems, error: checkError } = await supabase
      .from("library")
      .select("name")
      .eq("album", "DUA")
      .contains("categories", ["daily-ibadat"])

    if (checkError) {
      console.error("❌ Error checking existing items:", checkError.message)
      return
    }

    const existingNames = existingItems.map((item) => item.name)
    const itemsToInsert = dailyIbadatItems.filter((name) => !existingNames.includes(name))

    if (itemsToInsert.length === 0) {
      console.log("✅ All Daily Ibadat items already exist in the database!")
      return
    }

    console.log(`📝 Inserting ${itemsToInsert.length} new items...`)

    // Prepare items for insertion
    const items = itemsToInsert.map((name) => ({
      name,
      album: "DUA",
      categories: ["daily-ibadat"],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }))

    // Insert items
    const { data, error } = await supabase.from("library").insert(items).select()

    if (error) {
      console.error("❌ Error inserting items:", error.message)
      console.error("Error details:", error)
    } else {
      console.log(`\n✅ Successfully inserted ${data.length} items:`)
      data.forEach((item) => {
        console.log(`  - ${item.name} (ID: ${item.id})`)
      })
    }

    // Verify the insertions
    console.log("\n🔍 Verifying inserted items...")
    const { data: verifyData, error: verifyError } = await supabase
      .from("library")
      .select("id, name, album, categories")
      .eq("album", "DUA")
      .contains("categories", ["daily-ibadat"])
      .order("id", { ascending: false })
      .limit(10)

    if (verifyError) {
      console.error("❌ Error verifying items:", verifyError.message)
    } else {
      console.log(`✅ Found ${verifyData.length} Daily Ibadat items in database:`)
      verifyData.forEach((item) => {
        console.log(`  - ${item.name} (Album: ${item.album}, Categories: ${item.categories?.join(", ")})`)
      })
    }

    console.log("\n🎉 Script execution complete!")
  } catch (error) {
    console.error("❌ Unexpected error:", error.message)
    console.error(error)
  }
}

// Run insertion if this file is executed directly
if (require.main === module) {
  insertDailyIbadatItems().catch(console.error)
}

module.exports = { insertDailyIbadatItems }

