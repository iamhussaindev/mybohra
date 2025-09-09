import { useStores } from "app/models"
import { useMemo } from "react"

/**
 * Custom hook to get current location coordinates with MobX reactivity
 * Returns null if location is not loaded, otherwise returns { latitude, longitude }
 */
export function useLocationCoords() {
  const { dataStore } = useStores()

  return useMemo(() => {
    if (dataStore.currentLocationLoaded) {
      return {
        latitude: dataStore.currentLocation.latitude,
        longitude: dataStore.currentLocation.longitude,
      }
    }
    return null
  }, [
    dataStore.currentLocation.latitude,
    dataStore.currentLocation.longitude,
    dataStore.currentLocationLoaded,
  ])
}
