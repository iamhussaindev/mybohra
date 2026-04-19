import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0"
import { corsHeaders, jsonResponse } from "../_shared/cors.ts"

type ActionGet = { action: "get"; slug: string }
type ActionRespond = {
  action: "respond"
  slug: string
  status: "yes" | "no" | "maybe"
  headcount?: number
  guest_name?: string | null
  responder_user_id?: string | null
}

type Body = ActionGet | ActionRespond

function isValidSlug(slug: string): boolean {
  return /^[a-z0-9]{8,32}$/.test(slug)
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

  const admin = createClient(supabaseUrl, serviceKey)

  let body: Body
  try {
    body = (await req.json()) as Body
  } catch {
    return jsonResponse({ error: "Invalid JSON" }, 400)
  }

  const slug = typeof body.slug === "string" ? body.slug.trim().toLowerCase() : ""
  if (!isValidSlug(slug)) {
    return jsonResponse({ error: "Invalid slug" }, 400)
  }

  if (body.action === "get") {
    const { data: event, error: evErr } = await admin
      .from("rsvp_events")
      .select(
        "id, slug, event_type, host_mode, scheduled_at, message, title, host_label, linked_miqaat_id, closed_at",
      )
      .eq("slug", slug)
      .maybeSingle()

    if (evErr) {
      return jsonResponse({ error: evErr.message }, 500)
    }
    if (!event) {
      return jsonResponse({ error: "Not found" }, 404)
    }

    const { data: rows } = await admin.from("rsvp_responses").select("status, headcount").eq(
      "event_id",
      event.id,
    )
    const totals = { yes: 0, no: 0, maybe: 0, responses: 0 }
    if (rows) {
      for (const r of rows) {
        const h = typeof r.headcount === "number" ? r.headcount : 1
        totals.responses += 1
        if (r.status === "yes") totals.yes += h
        else if (r.status === "no") totals.no += h
        else if (r.status === "maybe") totals.maybe += h
      }
    }

    return jsonResponse({ event, totals })
  }

  if (body.action === "respond") {
    const status = body.status
    if (status !== "yes" && status !== "no" && status !== "maybe") {
      return jsonResponse({ error: "Invalid status" }, 400)
    }

    const headcount = Math.min(50, Math.max(1, Number(body.headcount) || 1))
    const guestName =
      typeof body.guest_name === "string" && body.guest_name.trim().length > 0
        ? body.guest_name.trim().slice(0, 120)
        : null

    let responderUserId: string | null = null
    if (typeof body.responder_user_id === "string" && body.responder_user_id.length > 0) {
      responderUserId = body.responder_user_id
    } else {
      const authHeader = req.headers.get("Authorization")
      if (authHeader?.startsWith("Bearer ")) {
        const anon = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY") ?? "", {
          global: { headers: { Authorization: authHeader } },
        })
        const { data: u } = await anon.auth.getUser()
        if (u.user) responderUserId = u.user.id
      }
    }

    const { data: event, error: evErr } = await admin
      .from("rsvp_events")
      .select("id, closed_at")
      .eq("slug", slug)
      .maybeSingle()

    if (evErr) return jsonResponse({ error: evErr.message }, 500)
    if (!event) return jsonResponse({ error: "Not found" }, 404)
    if (event.closed_at) {
      return jsonResponse({ error: "RSVP closed" }, 403)
    }

    const { error: insErr } = await admin.from("rsvp_responses").insert({
      event_id: event.id,
      status,
      headcount,
      guest_name: guestName,
      responder_user_id: responderUserId,
    })

    if (insErr) {
      return jsonResponse({ error: insErr.message }, 500)
    }

    const { data: rows } = await admin.from("rsvp_responses").select("status, headcount").eq(
      "event_id",
      event.id,
    )
    const totals = { yes: 0, no: 0, maybe: 0, responses: 0 }
    if (rows) {
      for (const r of rows) {
        const h = typeof r.headcount === "number" ? r.headcount : 1
        totals.responses += 1
        if (r.status === "yes") totals.yes += h
        else if (r.status === "no") totals.no += h
        else if (r.status === "maybe") totals.maybe += h
      }
    }

    return jsonResponse({ ok: true, totals })
  }

  return jsonResponse({ error: "Unknown action" }, 400)
})
