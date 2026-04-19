import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0"
import { corsHeaders, jsonResponse } from "../_shared/cors.ts"

const ALPHABET = "23456789abcdefghjkmnpqrstuvwxyz"

function randomSlug(len = 12): string {
  let s = ""
  for (let i = 0; i < len; i++) s += ALPHABET[Math.floor(Math.random() * ALPHABET.length)]
  return s
}

type CreateBody = {
  device_id?: string
  event_type: "miqaat" | "darees" | "majlis" | "shadi" | "birthday"
  host_mode: "jamaat" | "individual"
  scheduled_at: string
  message?: string | null
  title?: string | null
  host_label?: string
  linked_miqaat_id?: number | null
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
  if (!serviceKey || !supabaseUrl) {
    return jsonResponse({ error: "Server misconfigured" }, 500)
  }

  let body: CreateBody
  try {
    body = (await req.json()) as CreateBody
  } catch {
    return jsonResponse({ error: "Invalid JSON" }, 400)
  }

  const deviceId = typeof body.device_id === "string" ? body.device_id.trim() : ""
  if (deviceId.length < 8) {
    return jsonResponse({ error: "device_id required (min 8 chars)" }, 400)
  }

  const admin = createClient(supabaseUrl, serviceKey)
  const hostLabel = typeof body.host_label === "string" ? body.host_label.trim() : ""
  if (!hostLabel) {
    return jsonResponse({ error: "host_label required" }, 400)
  }

  const MAX = 8
  for (let attempt = 0; attempt < MAX; attempt++) {
    const slug = randomSlug(12)
    const { data, error } = await admin
      .from("rsvp_events")
      .insert({
        slug,
        event_type: body.event_type,
        host_mode: body.host_mode,
        scheduled_at: body.scheduled_at,
        message: body.message ?? null,
        title: body.title ?? null,
        host_label: hostLabel,
        linked_miqaat_id: body.linked_miqaat_id ?? null,
        created_by: null,
        creator_device_id: deviceId,
      })
      .select("id, slug")
      .single()

    if (!error && data) {
      return jsonResponse({ id: data.id, slug: data.slug })
    }
    if (error?.code === "23505") continue
    return jsonResponse({ error: error?.message ?? "Insert failed" }, 500)
  }

  return jsonResponse({ error: "Could not allocate slug" }, 500)
})
