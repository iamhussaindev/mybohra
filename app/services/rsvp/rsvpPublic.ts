import { supabase } from "app/services/supabase"

export type RsvpPublicEvent = {
  id: string
  slug: string
  event_type: string
  host_mode: string
  scheduled_at: string
  message: string | null
  title: string | null
  host_label: string
  linked_miqaat_id: number | null
  closed_at: string | null
}

export type RsvpTotals = {
  yes: number
  no: number
  maybe: number
  responses: number
}

export async function fetchRsvpBySlug(slug: string): Promise<
  { ok: true; event: RsvpPublicEvent; totals: RsvpTotals } | { ok: false; error: string }
> {
  const { data, error } = await supabase.functions.invoke<{ event: RsvpPublicEvent; totals: RsvpTotals }>(
    "rsvp-public",
    { body: { action: "get", slug: slug.trim().toLowerCase() } },
  )
  if (error) {
    return { ok: false, error: error.message }
  }
  if (data && "error" in data && typeof (data as { error?: string }).error === "string") {
    return { ok: false, error: (data as { error: string }).error }
  }
  if (!data?.event) {
    return { ok: false, error: "Not found" }
  }
  return { ok: true, event: data.event, totals: data.totals ?? { yes: 0, no: 0, maybe: 0, responses: 0 } }
}

export async function submitRsvpResponse(params: {
  slug: string
  status: "yes" | "no" | "maybe"
  headcount: number
  guestName?: string | null
}): Promise<{ ok: true; totals: RsvpTotals } | { ok: false; error: string }> {
  const { data, error } = await supabase.functions.invoke<{ ok?: boolean; totals?: RsvpTotals; error?: string }>(
    "rsvp-public",
    {
      body: {
        action: "respond",
        slug: params.slug.trim().toLowerCase(),
        status: params.status,
        headcount: params.headcount,
        guest_name: params.guestName ?? null,
      },
    },
  )
  if (error) {
    return { ok: false, error: error.message }
  }
  if (data && typeof data.error === "string") {
    return { ok: false, error: data.error }
  }
  if (!data?.totals) {
    return { ok: false, error: "Unexpected response" }
  }
  return { ok: true, totals: data.totals }
}
