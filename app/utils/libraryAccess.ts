/**
 * Library access tags — how audio playback is routed in the MyBohra app.
 *
 * ATS         — Sautuliman-owned, not on YouTube → open official app deeplink
 * ATS_PUBLIC  — Sautuliman-owned, on YouTube     → in-app YouTube player
 * PUBLIC      — community / non-ATS content       → native TrackPlayer
 */

export type LibraryAccessTag = "ATS" | "ATS_PUBLIC" | "PUBLIC"

export type LibraryAccessFields = {
  access_tag?: LibraryAccessTag | string | null
  deeplink_url?: string | null
  youtube_url?: string | null
  youtube_video_id?: string | null
  audio_url?: string | null
  pdf_url?: string | null
}

export function getLibraryAccessTag(item: LibraryAccessFields): LibraryAccessTag {
  if (item.access_tag === "ATS" || item.access_tag === "ATS_PUBLIC" || item.access_tag === "PUBLIC") {
    return item.access_tag
  }
  if (item.deeplink_url?.trim()) {
    if (item.youtube_url?.trim() || item.youtube_video_id?.trim()) return "ATS_PUBLIC"
    return "ATS"
  }
  if (item.youtube_url?.trim() || item.youtube_video_id?.trim()) return "ATS_PUBLIC"
  return "PUBLIC"
}

/** ATS — opens Sautuliman app deeplink (no native streaming). */
export function isAtsDeeplinkItem(item: LibraryAccessFields): boolean {
  const tag = getLibraryAccessTag(item)
  return tag === "ATS" && Boolean(item.deeplink_url?.trim())
}

/** ATS_PUBLIC — plays via YouTube in-app. */
export function isAtsPublicYouTubeItem(item: LibraryAccessFields): boolean {
  const tag = getLibraryAccessTag(item)
  return tag === "ATS_PUBLIC" && Boolean(item.youtube_url?.trim() || item.youtube_video_id?.trim())
}

/** PUBLIC — streams audio_url in native player. */
export function isPublicNativeAudioItem(item: LibraryAccessFields): boolean {
  return getLibraryAccessTag(item) === "PUBLIC" && Boolean(item.audio_url?.trim())
}

/** PDFs always open in-app regardless of access tag. */
export function hasPdfDocument(item: LibraryAccessFields): boolean {
  return Boolean(item.pdf_url?.trim())
}

/** Whether the PDF screen should show the native audio bar. */
export function shouldShowNativePdfAudioPlayer(item: LibraryAccessFields): boolean {
  return isPublicNativeAudioItem(item)
}

/** Whether PDF screen should offer YouTube playback for attached media. */
export function shouldOfferYouTubeFromPdf(item: LibraryAccessFields): boolean {
  return isAtsPublicYouTubeItem(item)
}

/** Whether PDF screen should offer Sautuliman deeplink for attached media. */
export function shouldOfferDeeplinkFromPdf(item: LibraryAccessFields): boolean {
  return isAtsDeeplinkItem(item)
}

export function extractYouTubeVideoId(item: LibraryAccessFields): string | null {
  if (item.youtube_video_id?.trim()) return item.youtube_video_id.trim()

  const url = item.youtube_url?.trim()
  if (!url) return null

  const patterns = [
    /v=([a-zA-Z0-9_-]{11})/,
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,
    /shorts\/([a-zA-Z0-9_-]{11})/,
  ]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match?.[1]) return match[1]
  }
  return null
}
