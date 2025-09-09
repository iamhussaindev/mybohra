import { api } from "app/services/api"
import { PlainLocation } from "app/types/location"
import * as storage from "app/utils/storage"
import { types, flow, Instance, SnapshotOut } from "mobx-state-tree"
import { Alert } from "react-native"

// Helper function to calculate distance between two coordinates in kilometers
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371 // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * (Math.PI / 180)
  const dLon = (lon2 - lon1) * (Math.PI / 180)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export const LocationModel = types.model("LocationModel", {
  latitude: types.optional(types.number, 19.076), // mumbai latitude
  longitude: types.optional(types.number, 72.8777), // mumbai longitude
  city: types.optional(types.string, "Mumbai"), // mumbai
  country: types.optional(types.string, "India"), // india
  state: types.maybeNull(types.string), // could be null or empty
  timezone: types.optional(types.string, "Asia/Kolkata"),
  type: types.optional(types.string, "city"), // city or spot
})

export const DataStoreModel = types
  .model("DataStore", {
    qiyam: types.optional(types.string, ""), // Default value for qiyam
    qiyamLoaded: types.optional(types.boolean, false), // Error message
    currentLocation: LocationModel,
    currentLocationLoaded: types.optional(types.boolean, false),
    locations: types.optional(types.array(LocationModel), []),
    locationsLoaded: types.optional(types.boolean, false),
    // Location mode management
    isLocationModePersistent: types.optional(types.boolean, false), // true = manual/persistent, false = auto/temporary
    deviceLocation: types.optional(LocationModel, {
      latitude: 19.076,
      longitude: 72.8777,
      city: "Mumbai",
      country: "India",
      state: null,
      timezone: "Asia/Kolkata",
      type: "city",
    }), // Store the device's auto-detected location
    deviceLocationLoaded: types.optional(types.boolean, false),
    lastKnownDeviceLocation: types.maybeNull(LocationModel),
    locationChangeThreshold: types.optional(types.number, 5), // 5km threshold
  })
  .actions((self) => ({
    fetchNearestLocation: flow(function* (lat: number, lng: number) {
      try {
        const response = yield api.fetchLocation(lat, lng)
        if (response.kind === "ok") {
          // Create a new location object to avoid MST duplicate node error
          const newLocation = {
            latitude: response.data.latitude,
            longitude: response.data.longitude,
            city: response.data.city,
            country: response.data.country,
            state: response.data.state,
            timezone: response.data.timezone,
            type: response.data.type,
          }

          // Check if this is a significant location change
          const hasSignificantChange =
            self.lastKnownDeviceLocation &&
            calculateDistance(
              self.lastKnownDeviceLocation.latitude,
              self.lastKnownDeviceLocation.longitude,
              newLocation.latitude,
              newLocation.longitude,
            ) > self.locationChangeThreshold

          // Store as device location
          self.deviceLocation = newLocation
          self.deviceLocationLoaded = true

          // If there's a significant change and we're in persistent mode, show alert
          if (hasSignificantChange && self.isLocationModePersistent) {
            // Show alert for location change
            const currentLocationText = `${self.currentLocation.city}, ${self.currentLocation.country}`
            const newLocationText = `${newLocation.city}, ${newLocation.country}`

            Alert.alert(
              "Location Changed",
              `You've moved to ${newLocationText}. Would you like to update your location from ${currentLocationText}?`,
              [
                {
                  text: "Keep Current",
                  style: "cancel",
                  onPress: () => {
                    // User chose to keep current location - do nothing
                  },
                },
                {
                  text: "Update Location",
                  onPress: () => {
                    // User chose to update - set as persistent location
                    self.currentLocation = newLocation
                    self.currentLocationLoaded = true
                    self.isLocationModePersistent = true
                    storage.save("LOCATION_MODE_PERSISTENT", true)
                  },
                },
              ],
              { cancelable: true },
            )
          } else if (!self.isLocationModePersistent) {
            // Auto-update if not in persistent mode
            self.currentLocation = newLocation
            self.currentLocationLoaded = true
          }

          // Update last known device location
          self.lastKnownDeviceLocation = newLocation
        }
      } catch (error) {
        self.currentLocationLoaded = false
        self.deviceLocationLoaded = false
      }
    }),
    fetchLocations: flow(function* () {
      try {
        const response = yield api.fetchLocations()

        if (response.kind === "ok") {
          const list = yield storage.load("LOCATIONS")
          const storedVersion = yield storage.load("LOCATIONS_VERSION")

          const version = yield api.fetchVersion("LOCATION")

          if (list && list.length > 0 && storedVersion === version.data?.version) {
            self.locations = list
          } else {
            try {
              const response = yield api.fetchLocations()

              if (response.kind === "ok") {
                self.locations = response.data
                yield storage.save("LOCATIONS", response.data)
                yield storage.save("LOCATIONS_VERSION", version.data?.version)
              }
            } catch (error) {
              console.log(error)
            }
          }
        }
      } catch (error) {
        console.log(error)
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

    setCurrentLocation: flow(function* (location: PlainLocation, isPersistent = false) {
      // Create a new location object to avoid MST duplicate node error
      const newLocation = {
        latitude: location.latitude,
        longitude: location.longitude,
        city: location.city,
        country: location.country,
        state: location.state,
        timezone: location.timezone,
        type: location.type,
      }

      self.currentLocation = newLocation
      self.currentLocationLoaded = true
      self.isLocationModePersistent = isPersistent

      const version = yield api.fetchVersion("LOCATION")

      // Save location and mode to storage
      yield storage.save("CURRENT_LOCATION", newLocation)
      yield storage.save("CURRENT_LOCATION_VERSION", version.data?.version)
      yield storage.save("LOCATION_MODE_PERSISTENT", isPersistent)
    }),

    // Method to set temporary location (for quick checking)
    setTemporaryLocation(location: PlainLocation) {
      // Create a new location object to avoid MST duplicate node error
      const newLocation = {
        latitude: location.latitude,
        longitude: location.longitude,
        city: location.city,
        country: location.country,
        state: location.state,
        timezone: location.timezone,
        type: location.type,
      }

      self.currentLocation = newLocation
      self.currentLocationLoaded = true
      // Don't change the persistent mode - keep it as is
    },

    // Method to revert to device location
    revertToDeviceLocation: flow(function* () {
      if (self.deviceLocationLoaded) {
        self.currentLocation = self.deviceLocation
        self.currentLocationLoaded = true
        self.isLocationModePersistent = false

        // Save the mode change to storage
        yield storage.save("LOCATION_MODE_PERSISTENT", false)
      }
    }),

    // Method to toggle persistent mode
    toggleLocationMode: flow(function* () {
      self.isLocationModePersistent = !self.isLocationModePersistent
      yield storage.save("LOCATION_MODE_PERSISTENT", self.isLocationModePersistent)
    }),

    // Method to load saved location mode from storage
    loadLocationMode: flow(function* () {
      try {
        const savedMode = yield storage.load("LOCATION_MODE_PERSISTENT")
        if (savedMode !== null) {
          self.isLocationModePersistent = savedMode
        }
      } catch (error) {
        console.log("Error loading location mode:", error)
      }
    }),

    // Method to set persistent mode when user manually selects a location
    setPersistentMode(isPersistent = true) {
      self.isLocationModePersistent = isPersistent
      storage.save("LOCATION_MODE_PERSISTENT", isPersistent)
    },

    // Method specifically for auto-detect that always updates current location
    autoDetectLocation: flow(function* (lat: number, lng: number) {
      try {
        const response = yield api.fetchLocation(lat, lng)
        if (response.kind === "ok") {
          // Create a new location object to avoid MST duplicate node error
          const newLocation = {
            latitude: response.data.latitude,
            longitude: response.data.longitude,
            city: response.data.city,
            country: response.data.country,
            state: response.data.state,
            timezone: response.data.timezone,
            type: response.data.type,
          }

          // Always update current location for auto-detect (regardless of persistent mode)
          self.currentLocation = newLocation
          self.currentLocationLoaded = true

          // Also update device location
          self.deviceLocation = newLocation
          self.deviceLocationLoaded = true

          // Update last known device location
          self.lastKnownDeviceLocation = newLocation
        }
      } catch (error) {
        self.currentLocationLoaded = false
        self.deviceLocationLoaded = false
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
