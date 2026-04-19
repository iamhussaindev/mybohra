import { apiSupabase } from "app/services/api"
import { types, flow, Instance, SnapshotOut } from "mobx-state-tree"

// Ziyarat Model - based on actual schema
export const ZiyaratModel = types.model("ZiyaratModel", {
  id: types.identifierNumber,
  name: types.string,
  city: types.maybeNull(types.string),
  address: types.maybeNull(types.string),
  history: types.maybeNull(types.string),
  photos: types.maybeNull(types.array(types.string)),
  year: types.maybeNull(types.number),
  created_at: types.maybeNull(types.string),
  updated_at: types.maybeNull(types.string),
  created_by: types.maybeNull(types.number),
  updated_by: types.maybeNull(types.number),
  rank: types.maybeNull(types.number),
  lat: types.maybeNull(types.number),
  lng: types.maybeNull(types.number),
})

// Musafirkhana Model - based on actual schema
export const MusafirkhanaModel = types.model("MusafirkhanaModel", {
  id: types.identifierNumber,
  name: types.string,
  city: types.maybeNull(types.string),
  lat: types.maybeNull(types.number),
  lng: types.maybeNull(types.number),
  photos: types.maybeNull(types.array(types.string)),
  phone: types.maybeNull(types.string),
  contact_person_name: types.maybeNull(types.string),
  map_link: types.maybeNull(types.string),
  total_rooms: types.maybeNull(types.number),
  created_at: types.maybeNull(types.string),
  updated_at: types.maybeNull(types.string),
  created_by: types.maybeNull(types.number),
  updated_by: types.maybeNull(types.number),
  address: types.maybeNull(types.string),
  description: types.maybeNull(types.string),
  email: types.maybeNull(types.string),
  info: types.maybeNull(types.string),
})

// Masjid Model - based on common masjid schema pattern
export const MasjidModel = types.model("MasjidModel", {
  id: types.identifierNumber,
  name: types.string,
  city: types.maybeNull(types.string),
  address: types.maybeNull(types.string),
  lat: types.maybeNull(types.number),
  lng: types.maybeNull(types.number),
  phone: types.maybeNull(types.string),
  email: types.maybeNull(types.string),
  website: types.maybeNull(types.string),
  photos: types.maybeNull(types.array(types.string)),
  capacity: types.maybeNull(types.number),
  facilities: types.maybeNull(types.array(types.string)),
  prayer_times_url: types.maybeNull(types.string),
  description: types.maybeNull(types.string),
  created_at: types.maybeNull(types.string),
  updated_at: types.maybeNull(types.string),
  created_by: types.maybeNull(types.number),
  updated_by: types.maybeNull(types.number),
})

// Nearby Place Model - based on common nearby places schema pattern
export const NearbyPlaceModel = types.model("NearbyPlaceModel", {
  id: types.identifierNumber,
  name: types.string,
  category: types.maybeNull(types.string),
  lat: types.maybeNull(types.number),
  lng: types.maybeNull(types.number),
  address: types.maybeNull(types.string),
  city: types.maybeNull(types.string),
  country: types.maybeNull(types.string),
  state: types.maybeNull(types.string),
  phone: types.maybeNull(types.string),
  email: types.maybeNull(types.string),
  website: types.maybeNull(types.string),
  photos: types.maybeNull(types.array(types.string)),
  description: types.maybeNull(types.string),
  rating: types.maybeNull(types.number),
  distance: types.maybeNull(types.number),
  created_at: types.maybeNull(types.string),
  updated_at: types.maybeNull(types.string),
  created_by: types.maybeNull(types.number),
  updated_by: types.maybeNull(types.number),
})

// Mazaar Model - based on actual schema (id is UUID/string)
export const MazaarModel = types.model("MazaarModel", {
  id: types.identifier,
  name: types.string,
  lat: types.maybeNull(types.number),
  lng: types.maybeNull(types.number),
  contact: types.maybeNull(types.string),
  photos: types.maybeNull(types.array(types.string)),
  created_at: types.maybeNull(types.string),
  updated_at: types.maybeNull(types.string),
  created_by: types.maybeNull(types.number),
  updated_by: types.maybeNull(types.number),
  location_id: types.maybeNull(types.number),
  website: types.maybeNull(types.string),
  social_media: types.maybeNull(types.array(types.string)),
  // Location info from join
  location: types.maybeNull(
    types.model("MazaarLocation", {
      id: types.number,
      city: types.string,
      state: types.maybeNull(types.string),
      country: types.string,
      latitude: types.number,
      longitude: types.number,
    }),
  ),
})

export const InformationStoreModel = types
  .model("InformationStore", {
    mazaars: types.optional(types.array(MazaarModel), []),
    ziyarats: types.optional(types.array(ZiyaratModel), []),
    musafirkhanas: types.optional(types.array(MusafirkhanaModel), []),
    masjids: types.optional(types.array(MasjidModel), []),
    nearbyPlaces: types.optional(types.array(NearbyPlaceModel), []),
  })
  .actions((self) => ({
    // Fetch all mazaars
    fetchMazaars: flow(function* (options?: {
      limit?: number
      offset?: number
      location_id?: number
    }) {
      try {
        const response = yield apiSupabase.fetchMazaars(options)
        if (response.kind === "ok") {
          // Transform data to match model (handle location join)
          const transformedData = response.data.map((item: any) => {
            // If location is an array (Supabase join result), take first element
            const location = Array.isArray(item.location) ? item.location[0] : item.location
            return {
              ...item,
              location: location || null,
            }
          })
          self.mazaars = transformedData as any
        }
      } catch (error) {
        console.log("Error fetching mazaars:", error)
      }
    }),

    // Fetch all ziyarats
    fetchZiyarats: flow(function* (options?: { limit?: number; offset?: number; city?: string }) {
      try {
        const response = yield apiSupabase.fetchZiyarats(options)
        if (response.kind === "ok") {
          self.ziyarats = response.data as any
        }
      } catch (error) {
        console.log("Error fetching ziyarats:", error)
      }
    }),

    // Fetch all musafirkhanas
    fetchMusafirkhanas: flow(function* (options?: {
      limit?: number
      offset?: number
      city?: string
    }) {
      try {
        const response = yield apiSupabase.fetchMusafirkhanas(options)
        if (response.kind === "ok") {
          self.musafirkhanas = response.data as any
        }
      } catch (error) {
        console.log("Error fetching musafirkhanas:", error)
      }
    }),

    // Fetch all masjids
    fetchMasjids: flow(function* (options?: { limit?: number; offset?: number; city?: string }) {
      try {
        const response = yield apiSupabase.fetchMasjids(options)
        if (response.kind === "ok") {
          self.masjids = response.data as any
        }
      } catch (error) {
        console.log("Error fetching masjids:", error)
      }
    }),

    // Fetch nearby places
    fetchNearbyPlaces: flow(function* (params: {
      latitude: number
      longitude: number
      radius?: number
      category?: string
      categories?: string[]
      limit?: number
    }) {
      try {
        const response = yield apiSupabase.fetchNearbyPlaces(params)
        if (response.kind === "ok") {
          self.nearbyPlaces = response.data as any
        }
      } catch (error) {
        console.log("Error fetching nearby places:", error)
      }
    }),

    // Search across all information types
    searchInformation: flow(function* (query: string, types?: string[]) {
      try {
        const response = yield apiSupabase.searchInformation(query, types)
        if (response.kind === "ok") {
          return response.data as any
        }
        return []
      } catch (error) {
        console.log("Error searching information:", error)
        return []
      }
    }),
  }))
  .views((self) => ({
    get allMazaars() {
      return self.mazaars
    },
    get allZiyarats() {
      return self.ziyarats
    },
    get allMusafirkhanas() {
      return self.musafirkhanas
    },
    get allMasjids() {
      return self.masjids
    },
    get allNearbyPlaces() {
      return self.nearbyPlaces
    },
  }))

export interface InformationStore extends Instance<typeof InformationStoreModel> {}
export interface InformationStoreSnapshot extends SnapshotOut<typeof InformationStoreModel> {}
export interface IMazaar extends Instance<typeof MazaarModel> {}
export interface IZiyarat extends Instance<typeof ZiyaratModel> {}
export interface IMusafirkhana extends Instance<typeof MusafirkhanaModel> {}
export interface IMasjid extends Instance<typeof MasjidModel> {}
export interface INearbyPlace extends Instance<typeof NearbyPlaceModel> {}
