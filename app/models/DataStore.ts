import { types, flow, Instance, SnapshotOut } from "mobx-state-tree"
import { api } from "app/services/api"

export const LocationModel = types.model("LocationModel", {
  latitude: types.optional(types.number, 19.076),
  longitude: types.optional(types.number, 72.8777),
  city: types.optional(types.string, "Mumbai"),
  country: types.optional(types.string, "India"),
  state: types.optional(types.string, "Maharashtra"),
  timezone: types.optional(types.string, "Asia/Kolkata"),
})

export const DataStoreModel = types
  .model("DataStore", {
    qiyam: types.optional(types.string, ""), // Default value for qiyam
    qiyamLoaded: types.optional(types.boolean, false), // Error message
    currentLocation: LocationModel,
    currentLocationLoaded: types.optional(types.boolean, false),
  })
  .actions((self) => ({
    fetchNearestLocation: flow(function* (lat: number, lng: number) {
      try {
        const response = yield api.fetchLocation(lat, lng)

        if (response.kind === "ok") {
          self.currentLocation = response.data
          self.currentLocationLoaded = true
        }
      } catch (error) {
        self.currentLocationLoaded = false
      }
    }),

    fetchQiyam: flow(function* () {
      self.qiyamLoaded = true
      try {
        const response = yield api.fetchData({ key: "QIYAM" })
        if (response.kind === "ok") {
          self.qiyam = response.data.value
        }
        // self.qiyam = response.e // Assuming the API response has a qiyam property
      } catch (error) {
        console.log(error)
      } finally {
        self.qiyamLoaded = true
      }
    }),
  }))
  .views((self) => ({
    // Computed view to check if data is loaded
    get isDataLoaded() {
      return self.qiyamLoaded && self.qiyam !== ""
    },
  }))

// Create an instance of DataStore

export interface DataStore extends Instance<typeof DataStoreModel> {}
export interface DataStoreSnapshot extends SnapshotOut<typeof DataStoreModel> {}
export interface ILocation extends Instance<typeof LocationModel> {}
