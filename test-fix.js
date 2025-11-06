/**
 * Quick test to verify the Supabase relationship fix
 */

const { createClient } = require("@supabase/supabase-js")

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || "https://your-project.supabase.co"
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "your-anon-key"

const supabase = createClient(supabaseUrl, supabaseKey)

async function testRelationshipFix() {
  console.log("🔧 Testing Supabase relationship fix...")

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
      .limit(1)

    if (error) {
      console.error("❌ Error:", error.message)
      console.error("❌ Details:", error)
      return
    }

    console.log("✅ Success!")
    console.log(`📊 Found ${data?.length || 0} daily duas`)

    if (data && data.length > 0) {
      const item = data[0]
      console.log("\n📋 Sample data:")
      console.log(`Daily Dua ID: ${item.id}`)
      console.log(`Date: ${item.date}/${item.month}`)
      console.log(`Library ID: ${item.library_id}`)
      console.log(`Library Name: ${item.library?.name || "N/A"}`)
      console.log(`Library Description: ${item.library?.description || "N/A"}`)
      console.log(`Library Categories: ${JSON.stringify(item.library?.categories || [])}`)
      console.log(`Audio: ${item.library?.audio_url ? "✅" : "❌"}`)
      console.log(`PDF: ${item.library?.pdf_url ? "✅" : "❌"}`)
    } else {
      console.log("ℹ️  No daily duas found for January 15th with daily_dua category")
    }
  } catch (error) {
    console.error("❌ Unexpected error:", error.message)
  }
}

// Run test if this file is executed directly
if (require.main === module) {
  testRelationshipFix().catch(console.error)
}

module.exports = { testRelationshipFix }
