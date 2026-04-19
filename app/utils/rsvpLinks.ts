import * as Linking from "expo-linking"

export function rsvpWebUrl(slug: string): string {
  const base = (process.env.EXPO_PUBLIC_RSVP_WEB_BASE ?? "").replace(/\/$/, "")
  if (!base) return ""
  return `${base}/?slug=${encodeURIComponent(slug)}`
}

export function rsvpAppUrl(slug: string): string {
  return Linking.createURL(`rsvp/${slug}`)
}
