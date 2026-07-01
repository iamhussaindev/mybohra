import { corsHeaders, jsonResponse } from "../_shared/cors.ts"

type Body = {
  latitude?: number
  longitude?: number
  date?: string
  timezone?: string
}

const LEGACY_TIMEZONE_ALIASES: Record<string, string> = {
  "Asia/Calcutta": "Asia/Kolkata",
}

function normalizeTimezone(timezone: string): string {
  return LEGACY_TIMEZONE_ALIASES[timezone] ?? timezone
}

type MumineenSalaatDay = Record<string, string>

function toLocalDateKey(date: Date, timezone: string): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: timezone }).format(date)
}

function toHHmm(value: string): string {
  const timePart = value.includes(" ") ? value.split(" ")[1] : value
  const [h, m] = timePart.split(":")
  return `${h.padStart(2, "0")}:${m.padStart(2, "0")}`
}

function mapDay(raw: MumineenSalaatDay): Record<string, string> {
  const pick = (key: string) => (raw[key] ? toHHmm(raw[key]) : undefined)
  const times: Record<string, string> = {}
  const entries: Array<[string, string | undefined]> = [
    ["sihori", pick("sihori")],
    ["fajr", pick("fajr")],
    ["sunrise_safe", pick("sunrise_safe") ?? pick("sunrise")],
    ["zawaal", pick("zawaal")],
    ["zohr", pick("zohr")],
    ["zohr_end", pick("zohr_end")],
    ["asar", pick("asar")],
    ["asr_end", pick("asr_end")],
    ["maghrib", pick("maghrib")],
    ["maghrib_end", pick("maghrib_end")],
    ["nisful_layl", pick("nisful_layl")],
    ["nisful_layl_end", pick("nisful_layl_end")],
  ]
  for (const [key, value] of entries) {
    if (value) times[key] = value
  }
  return times
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

  const latitude = body.latitude
  const longitude = body.longitude
  if (typeof latitude !== "number" || typeof longitude !== "number") {
    return jsonResponse({ error: "latitude and longitude required" }, 400)
  }

  const timezone = normalizeTimezone(body.timezone ?? "Asia/Kolkata")
  const when = body.date ? new Date(body.date) : new Date()
  const dateKey = toLocalDateKey(when, timezone)

  const params = new URLSearchParams({
    start: dateKey,
    end: dateKey,
    latitude: String(latitude),
    longitude: String(longitude),
    timezone,
    altitude: "0",
  })

  try {
    const upstream = await fetch(`https://mumineen.org/api/v1/salaat?${params}`, {
      headers: { Accept: "application/json" },
    })

    if (!upstream.ok) {
      return jsonResponse({ error: `mumineen.org ${upstream.status}` }, upstream.status)
    }

    const json = await upstream.json()
    const day = json.data?.[dateKey] as MumineenSalaatDay | undefined
    if (!day) {
      return jsonResponse({ error: `no salaat data for ${dateKey}` }, 404)
    }

    return jsonResponse({
      times: mapDay(day),
      source: "mumineen",
      latitude,
      longitude,
      date: when.toISOString(),
      timezone,
    })
  } catch (e) {
    console.error("mumineen.org salaat error:", e)
    return jsonResponse({ error: "Failed to fetch salaat times" }, 502)
  }
})
