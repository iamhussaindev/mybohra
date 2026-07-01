import { useStores } from "app/models"
import { useMazaars } from "app/services/supabase/queries/mazaar.query"
import { useGeofencing } from "app/hooks/useGeofencing"
import { observer } from "mobx-react-lite"
import React, { useEffect } from "react"

/**
 * Loads mazaars and starts geofence watching when data is available.
 */
export const GeofenceManager = observer(function GeofenceManager() {
  const { informationStore } = useStores()
  const { data: queryMazaars } = useMazaars({ limit: 500 })

  useEffect(() => {
    if (informationStore.mazaars.length === 0) {
      void informationStore.fetchMazaars({ limit: 500 })
    }
  }, [informationStore])

  const mazaars =
    queryMazaars ??
    informationStore.allMazaars.map((m) => ({
      id: m.id,
      name: m.name,
      lat: m.lat,
      lng: m.lng,
      contact: m.contact,
      photos: m.photos ? [...m.photos] : null,
      website: m.website,
      social_media: m.social_media ? [...m.social_media] : null,
      location_id: m.location_id,
      created_at: m.created_at,
      created_by: m.created_by,
      updated_at: m.updated_at,
      updated_by: m.updated_by,
    }))

  useGeofencing(mazaars, mazaars.length > 0)

  return null
})
