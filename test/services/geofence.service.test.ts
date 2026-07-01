import {
  findMazaarsWithinRadius,
  MAZAAR_GEOFENCE_RADIUS_M,
} from "app/services/location/geofence.utils"

describe("geofence.service", () => {
  const mazaars = [
    {
      id: "1",
      name: "Near Mazaar",
      lat: 19.076,
      lng: 72.8777,
      contact: null,
      created_at: null,
      created_by: null,
      location_id: null,
      photos: null,
      social_media: null,
      updated_at: null,
      updated_by: null,
      website: null,
    },
    {
      id: "2",
      name: "Far Mazaar",
      lat: 28.6139,
      lng: 77.209,
      contact: null,
      created_at: null,
      created_by: null,
      location_id: null,
      photos: null,
      social_media: null,
      updated_at: null,
      updated_by: null,
      website: null,
    },
  ]

  it("returns mazaars within geofence radius", () => {
    const nearby = findMazaarsWithinRadius(
      { latitude: 19.0761, longitude: 72.8778 },
      mazaars,
      MAZAAR_GEOFENCE_RADIUS_M,
    )
    expect(nearby).toHaveLength(1)
    expect(nearby[0].name).toBe("Near Mazaar")
  })

  it("returns empty when no mazaars in range", () => {
    const nearby = findMazaarsWithinRadius(
      { latitude: 0, longitude: 0 },
      mazaars,
      MAZAAR_GEOFENCE_RADIUS_M,
    )
    expect(nearby).toHaveLength(0)
  })
})
