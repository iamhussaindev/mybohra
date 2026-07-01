import type { Tables } from "app/services/supabase/types"
import { haversineDistanceKm } from "app/utils/geoDistance"

export type MazaarRow = Tables<"mazaars">

/** Geofence radius per product spec (meters). */
export const MAZAAR_GEOFENCE_RADIUS_M = 500

export type Coordinates = { latitude: number; longitude: number }

export function findMazaarsWithinRadius(
  coords: Coordinates,
  mazaars: MazaarRow[],
  radiusMeters = MAZAAR_GEOFENCE_RADIUS_M,
): MazaarRow[] {
  return mazaars
    .filter((m) => m.lat != null && m.lng != null)
    .map((m) => ({
      mazaar: m,
      distanceKm: haversineDistanceKm(coords.latitude, coords.longitude, m.lat!, m.lng!),
    }))
    .filter((entry) => entry.distanceKm * 1000 <= radiusMeters)
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .map((entry) => entry.mazaar)
}
