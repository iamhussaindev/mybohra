import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0"
import { corsHeaders, jsonResponse } from "../_shared/cors.ts"

const LIMIT = 20

type SearchBody = { query?: string }

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405)
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? ""
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  if (!supabaseUrl || !anonKey) {
    return jsonResponse({ error: "Server misconfigured" }, 500)
  }

  let body: SearchBody
  try {
    body = (await req.json()) as SearchBody
  } catch {
    return jsonResponse({ error: "Invalid JSON" }, 400)
  }

  const query = (body.query ?? "").trim()
  if (query.length < 2) {
    return jsonResponse({ miqaats: [], mazaars: [], pdfs: [], products: [], businesses: [] })
  }

  const authHeader = req.headers.get("Authorization") ?? ""
  const supabase = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  })

  const pattern = `%${query}%`

  const [miqaatRes, mazaarRes, pdfRes, businessRes, productRes] = await Promise.all([
    supabase
      .from("miqaat")
      .select("id, name, description, month, date, location, type, image")
      .or(`name.ilike.${pattern},description.ilike.${pattern}`)
      .order("name")
      .limit(LIMIT),
    supabase.from("mazaars").select("id, name, lat, lng, photos, location_id").ilike("name", pattern).order("name").limit(LIMIT),
    supabase.rpc("search_library_v1", {
      search_query: query,
      limit_results: LIMIT,
      search_album: undefined,
    }),
    supabase
      .from("business")
      .select("id, business_name, description, logo, city, slug, rating_average")
      .ilike("business_name", pattern)
      .eq("is_active", true)
      .order("business_name")
      .limit(LIMIT),
    supabase
      .from("post")
      .select("id, title, description, images, business_id, slug, is_product")
      .eq("is_product", true)
      .eq("is_active", true)
      .or(`title.ilike.${pattern},description.ilike.${pattern}`)
      .order("title")
      .limit(LIMIT),
  ])

  if (miqaatRes.error) console.error("miqaat search:", miqaatRes.error.message)
  if (mazaarRes.error) console.error("mazaar search:", mazaarRes.error.message)
  if (pdfRes.error) console.error("pdf search:", pdfRes.error.message)
  if (businessRes.error) console.error("business search:", businessRes.error.message)
  if (productRes.error) console.error("product search:", productRes.error.message)

  return jsonResponse({
    miqaats: miqaatRes.data ?? [],
    mazaars: mazaarRes.data ?? [],
    pdfs: pdfRes.data ?? [],
    products: productRes.data ?? [],
    businesses: businessRes.data ?? [],
  })
})
