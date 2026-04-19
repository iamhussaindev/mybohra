import { getOrCreateDeviceId } from "app/services/deviceTracking"
import { supabase } from "app/services/supabase"
import type { Database } from "app/services/supabase/types"

import { generateRsvpSlug } from "./slug"

export type RsvpEventType = "miqaat" | "darees" | "majlis" | "shadi" | "birthday"
export type RsvpHostMode = "jamaat" | "individual"

type EventType = RsvpEventType
type HostMode = RsvpHostMode

export type CreateRsvpPayload = {
  event_type: EventType
  host_mode: HostMode
  scheduled_at: string
  message: string | null
  title: string | null
  host_label: string
  linked_miqaat_id: number | null
}

const MAX_SLUG_RETRIES = 8

export async function createRsvpEvent(
  payload: CreateRsvpPayload,
): Promise<{ ok: true; slug: string; id: string } | { ok: false; error: string }> {
  const { data: userData } = await supabase.auth.getUser()
  const user = userData.user

  const deviceId = await getOrCreateDeviceId()

  if (user) {
    for (let attempt = 0; attempt < MAX_SLUG_RETRIES; attempt++) {
      const slug = generateRsvpSlug()
      const row: Database["public"]["Tables"]["rsvp_events"]["Insert"] = {
        slug,
        event_type: payload.event_type,
        host_mode: payload.host_mode,
        scheduled_at: payload.scheduled_at,
        message: payload.message,
        title: payload.title,
        host_label: payload.host_label,
        linked_miqaat_id: payload.linked_miqaat_id,
        created_by: user.id,
        creator_device_id: deviceId,
      }

      /* eslint-disable @typescript-eslint/no-explicit-any */
      const { data, error } = await (supabase as any)
        .from("rsvp_events")
        .insert(row)
        .select("id, slug")
        .single()
      /* eslint-enable @typescript-eslint/no-explicit-any */

      if (!error && data) {
        const d = data as { id: string; slug: string }
        return { ok: true, slug: d.slug, id: d.id }
      }
      if (error?.code === "23505") {
        continue
      }
      return { ok: false, error: error?.message ?? "Failed to create RSVP" }
    }
    return { ok: false, error: "Could not allocate a unique link. Try again." }
  }

  const { data, error } = await supabase.functions.invoke<{ id?: string; slug?: string; error?: string }>(
    "rsvp-create",
    {
      body: {
        device_id: deviceId,
        event_type: payload.event_type,
        host_mode: payload.host_mode,
        scheduled_at: payload.scheduled_at,
        message: payload.message,
        title: payload.title,
        host_label: payload.host_label,
        linked_miqaat_id: payload.linked_miqaat_id,
      },
    },
  )

  if (error) {
    return { ok: false, error: error.message }
  }
  if (data?.error || !data?.slug || !data?.id) {
    return { ok: false, error: data?.error ?? "Failed to create RSVP" }
  }
  return { ok: true, slug: data.slug, id: data.id }
}
