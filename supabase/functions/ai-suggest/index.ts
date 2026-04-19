import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0"
import { openaiChatCompletion } from "../_shared/openai.ts"
import { corsHeaders, jsonResponse } from "../_shared/cors.ts"

type Body = {
  purpose?: string
  context?: Record<string, unknown>
}

function deviceIdOk(ctx: Record<string, unknown>): boolean {
  const id = ctx.device_id
  return typeof id === "string" && id.trim().length >= 8
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405)
  }

  let body: Body
  try {
    body = (await req.json()) as Body
  } catch {
    return jsonResponse({ error: "Invalid JSON" }, 400)
  }

  const ctx = body.context ?? {}
  const authHeader = req.headers.get("Authorization")
  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? ""
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? ""

  let allowed = false
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    })
    const { data: userData, error: userError } = await supabase.auth.getUser()
    if (!userError && userData.user) {
      allowed = true
    }
  }

  if (!allowed && !deviceIdOk(ctx as Record<string, unknown>)) {
    return jsonResponse(
      { error: "Sign in or pass context.device_id from the app (min 8 characters)." },
      401,
    )
  }

  const purpose = body.purpose ?? "generic"

  try {
    if (purpose === "rsvp_message") {
      const system =
        "You help write short, respectful invitation messages for community religious and social gatherings (jaman). " +
        "Use clear English. One or two paragraphs max. No emojis unless asked. Do not invent venue addresses."
      const user =
        `Write an invitation / RSVP message for this event:\n${JSON.stringify(ctx, null, 2)}\n` +
        `If details are missing, use neutral wording.`

      const suggestion = await openaiChatCompletion([
        { role: "system", content: system },
        { role: "user", content: user },
      ])
      return jsonResponse({ suggestions: [suggestion] })
    }

    const userPrompt =
      typeof ctx.prompt === "string" && ctx.prompt.length > 0
        ? ctx.prompt
        : JSON.stringify(ctx)

    const suggestion = await openaiChatCompletion([
      {
        role: "system",
        content: "You are a concise writing assistant for a community app.",
      },
      { role: "user", content: userPrompt.slice(0, 8000) },
    ])
    return jsonResponse({ suggestions: [suggestion] })
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error"
    return jsonResponse({ error: msg, suggestions: [] }, 500)
  }
})
