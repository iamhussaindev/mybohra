import { apiSupabase } from "app/services/api"
import { types, flow, Instance, SnapshotOut } from "mobx-state-tree"

import {
  MazaarDbModel,
  MasjidDbModel,
  MusafirkhanaDbModel,
  NearbyPlaceDbModel,
  ZiyaratDbModel,
} from "./generated"

export { ZiyaratDbModel as ZiyaratModel }
export { MusafirkhanaDbModel as MusafirkhanaModel }
export { MasjidDbModel as MasjidModel }

/** DB model + optional UI fields (distance is computed client-side). */
export const NearbyPlaceModel = NearbyPlaceDbModel.props({
  distance: types.maybeNull(types.number),
})

/** DB model + optional joined location from API. */
export const MazaarModel = MazaarDbModel.props({
  location: types.maybeNull(types.frozen()),
})

export const InformationStoreModel = types
  .model("InformationStore", {
    mazaars: types.optional(types.array(MazaarModel), []),
    ziyarats: types.optional(types.array(ZiyaratDbModel), []),
    musafirkhanas: types.optional(types.array(MusafirkhanaDbModel), []),
    masjids: types.optional(types.array(MasjidDbModel), []),
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
export interface IZiyarat extends Instance<typeof ZiyaratDbModel> {}
export interface IMusafirkhana extends Instance<typeof MusafirkhanaDbModel> {}
export interface IMasjid extends Instance<typeof MasjidDbModel> {}
export interface INearbyPlace extends Instance<typeof NearbyPlaceModel> {}
