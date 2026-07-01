import Geolocation from "react-native-geolocation-service"

import type { Coordinates } from "./geofence.utils"

export { findMazaarsWithinRadius, MAZAAR_GEOFENCE_RADIUS_M } from "./geofence.utils"
export type { Coordinates, MazaarRow } from "./geofence.utils"

export function watchLocation(
  onPosition: (coords: Coordinates) => void,
  onError?: (error: unknown) => void,
): () => void {
  const watchId = Geolocation.watchPosition(
    (position) => {
      onPosition({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      })
    },
    (error) => onError?.(error),
    {
      enableHighAccuracy: false,
      distanceFilter: 50,
      interval: 10000,
      fastestInterval: 5000,
      showsBackgroundLocationIndicator: false,
    },
  )

  return () => Geolocation.clearWatch(watchId)
}
