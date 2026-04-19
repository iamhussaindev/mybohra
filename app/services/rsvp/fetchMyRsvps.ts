import { getOrCreateDeviceId } from "app/services/deviceTracking"
import { supabase } from "app/services/supabase"

export type MyRsvpEvent = {
  id: string
  slug: string
  title: string | null
  event_type: string
  scheduled_at: string
  closed_at: string | null
  message: string | null
  host_label: string
  created_at: string
  totals: {
    yes: number
    no: number
    maybe: number
    responses: number
  }
}

export async function fetchMyRsvps(): Promise<
  { ok: true; events: MyRsvpEvent[] } | { ok: false; error: string }
> {
  const deviceId = await getOrCreateDeviceId()
  const { data, error } = await supabase.functions.invoke<{ events?: MyRsvpEvent[]; error?: string }>(
    "rsvp-list-mine",
    { body: { device_id: deviceId } },
  )
  if (error) {
    return { ok: false, error: error.message }
  }
  if (data?.error) {
    return { ok: false, error: data.error }
  }
  return { ok: true, events: data?.events ?? [] }
}
