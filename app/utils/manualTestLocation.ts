/**
 * Optional fixed coordinates for local/testing builds.
 * Set both in `.env` (Expo: `EXPO_PUBLIC_*` is inlined at bundle time):
 *
 *   EXPO_PUBLIC_MANUAL_LOCATION_LAT=21.422
 *   EXPO_PUBLIC_MANUAL_LOCATION_LNG=39.826
 *   EXPO_PUBLIC_MANUAL_LOCATION_CITY=Makkah   # optional; label until geocode fills the store
 *
 * When both parse as finite numbers, app startup and “auto-detect” skip GPS
 * and use these values instead.
 */
export function getManualTestCityName(): string | null {
  const raw = process.env.EXPO_PUBLIC_MANUAL_LOCATION_CITY
  if (raw == null) return null
  const trimmed = String(raw).trim()
  return trimmed === "" ? null : trimmed
}

export function getManualTestCoordinates(): { latitude: number; longitude: number } | null {
  const latRaw = process.env.EXPO_PUBLIC_MANUAL_LOCATION_LAT
  const lngRaw = process.env.EXPO_PUBLIC_MANUAL_LOCATION_LNG
  if (latRaw == null || lngRaw == null) return null
  if (String(latRaw).trim() === "" || String(lngRaw).trim() === "") return null

  const latitude = Number(latRaw)
  const longitude = Number(lngRaw)
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null

  return { latitude, longitude }
}

export function isUsingManualTestLocation(): boolean {
  return getManualTestCoordinates() !== null
}
