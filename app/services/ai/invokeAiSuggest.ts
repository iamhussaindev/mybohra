import { supabase } from "app/services/supabase"

export async function invokeAiSuggest(params: {
  purpose: string
  context?: Record<string, unknown>
  /** When user is not signed in, pass the same stable device id used for RSVP create. */
  deviceId?: string
}): Promise<{ ok: true; suggestions: string[] } | { ok: false; error: string }> {
  const context = { ...(params.context ?? {}) }
  if (params.deviceId && params.deviceId.trim().length >= 8) {
    context.device_id = params.deviceId.trim()
  }

  const { data, error } = await supabase.functions.invoke<{
    suggestions?: string[]
    error?: string
  }>("ai-suggest", {
    body: { purpose: params.purpose, context },
  })

  if (error) {
    return { ok: false, error: error.message }
  }
  if (data?.error) {
    return { ok: false, error: data.error }
  }
  const suggestions = Array.isArray(data?.suggestions) ? data.suggestions.filter(Boolean) : []
  if (suggestions.length === 0) {
    return { ok: false, error: "No suggestion returned" }
  }
  return { ok: true, suggestions }
}
