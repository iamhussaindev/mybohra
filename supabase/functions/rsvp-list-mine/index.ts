import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0"
import { corsHeaders, jsonResponse } from "../_shared/cors.ts"

type Body = {
  device_id?: string
}

function aggregate(rows: { status: string; headcount: number | null }[] | null) {
  const totals = { yes: 0, no: 0, maybe: 0, responses: 0 }
  if (!rows) return totals
  for (const r of rows) {
    const h = typeof r.headcount === "number" ? r.headcount : 1
    totals.responses += 1
    if (r.status === "yes") totals.yes += h
    else if (r.status === "no") totals.no += h
    else if (r.status === "maybe") totals.maybe += h
  }
  return totals
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }
  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405)
  }

  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? ""
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  if (!serviceKey || !supabaseUrl) {
    return jsonResponse({ error: "Server misconfigured" }, 500)
  }

  let body: Body
  try {
    body = (await req.json()) as Body
  } catch {
    return jsonResponse({ error: "Invalid JSON" }, 400)
  }

  const did = typeof body.device_id === "string" ? body.device_id.trim() : ""
  if (did.length < 8) {
    return jsonResponse({ error: "device_id required" }, 400)
  }

  const admin = createClient(supabaseUrl, serviceKey)
  const authHeader = req.headers.get("Authorization")

  let query = admin
    .from("rsvp_events")
    .select("id, slug, title, event_type, scheduled_at, closed_at, message, host_label, created_at")

  if (authHeader?.startsWith("Bearer ")) {
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    })
    const { data: u } = await userClient.auth.getUser()
    if (u.user?.id) {
      query = query.or(`created_by.eq.${u.user.id},creator_device_id.eq.${did}`)
    } else {
      query = query.eq("creator_device_id", did)
    }
  } else {
    query = query.eq("creator_device_id", did)
  }

  const { data: events, error: evErr } = await query.order("created_at", { ascending: false }).limit(40)

  if (evErr) {
    return jsonResponse({ error: evErr.message }, 500)
  }

  const list = []
  for (const ev of events ?? []) {
    const { data: rows } = await admin.from("rsvp_responses").select("status, headcount").eq("event_id", ev.id)
    list.push({
      ...ev,
      totals: aggregate(rows),
    })
  }

  return jsonResponse({ events: list })
})
