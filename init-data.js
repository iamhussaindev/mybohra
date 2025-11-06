/**
 * Initialize data table with required version keys
 *
 * This script populates the data table with the version keys that the app expects.
 * Run with: node init-data.js
 */

const { createClient } = require("@supabase/supabase-js")

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

// Version keys constants (matching the app constants)
const VERSION_KEYS = {
  DUA_LIST: "DUA_LIST",
  TASBEEH: "TASBEEH",
  LOCATION: "LOCATION",
  MIQAAT: "MIQAAT",
}

async function initializeData() {
  console.log("🔧 Initializing data table with required version keys...")

  const requiredKeys = [
    { key: VERSION_KEYS.DUA_LIST, value: "1" },
    { key: VERSION_KEYS.TASBEEH, value: "1" },
    { key: VERSION_KEYS.LOCATION, value: "1" },
    { key: VERSION_KEYS.MIQAAT, value: "1" },
  ]

  try {
    for (const item of requiredKeys) {
      console.log(`📝 Inserting/updating key: ${item.key}`)

      const { data, error } = await supabase.from("data").upsert({
        key: item.key,
        value: item.value,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

      if (error) {
        console.error(`❌ Error inserting ${item.key}:`, error.message)
      } else {
        console.log(`✅ Successfully inserted/updated ${item.key}`)
      }
    }

    console.log("\n🎉 Data initialization complete!")

    // Verify the data was inserted
    console.log("\n🔍 Verifying inserted data...")
    const { data: verifyData, error: verifyError } = await supabase
      .from("data")
      .select("*")
      .in(
        "key",
        requiredKeys.map((k) => k.key),
      )

    if (verifyError) {
      console.error("❌ Error verifying data:", verifyError.message)
    } else {
      console.log("✅ Verification successful!")
      verifyData.forEach((item) => {
        console.log(`  - ${item.key}: ${item.value}`)
      })
    }
  } catch (error) {
    console.error("❌ Unexpected error:", error.message)
  }
}

// Run initialization if this file is executed directly
if (require.main === module) {
  initializeData().catch(console.error)
}

module.exports = { initializeData }
