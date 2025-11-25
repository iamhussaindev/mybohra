import { VERSION_KEYS } from "app/constants/version-keys"
import { apiSupabase } from "app/services/api"
import { PlainLocation } from "app/types/location"
import * as storage from "app/utils/storage"
import { types, flow, Instance, SnapshotOut } from "mobx-state-tree"

export const QIYAM_KEY = "current_qiyam"
export const PDF_HISTORY_KEY = "pdf_history"

const PdfHistoryModel = types.model("PdfHistoryModel", {
  pdfId: types.number,
  openedCount: types.number,
  lastOpened: types.string,
})

export const LocationModel = types.model("LocationModel", {
  latitude: types.optional(types.number, 19.076), // mumbai latitude
  longitude: types.optional(types.number, 72.8777), // mumbai longitude
  city: types.optional(types.string, "Mumbai"), // mumbai
  country: types.optional(types.string, "India"), // india
  state: types.maybeNull(types.string), // could be null or empty
  timezone: types.optional(types.string, "Asia/Kolkata"),
  type: types.optional(types.string, "city"), // city or spot
})

export const ReminderSettingsModel = types.model("ReminderSettingsModel", {
  notificationType: types.optional(
    types.enumeration("NotificationType", ["short", "long"]),
    "short",
  ),
  triggerBeforeMinutes: types.optional(types.number, 5), // 5 minutes before by default
  customOffsets: types.optional(types.map(types.number), {}), // prayerTime -> offsetMinutes
})

export const DataStoreModel = types
  .model("DataStore", {
    qiyam: types.optional(types.string, ""), // Default value for qiyam
    qiyamLoaded: types.optional(types.boolean, false), // Error message
    currentLocation: LocationModel,
    currentLocationLoaded: types.optional(types.boolean, false),
    currentLocationVersion: types.optional(types.number, 0),
    locations: types.optional(types.array(LocationModel), []),
    locationsLoaded: types.optional(types.boolean, false),
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
    // Past selected locations for quick access
    pastSelectedLocations: types.optional(types.array(LocationModel), []),
    // Reminder settings
    reminderSettings: types.optional(ReminderSettingsModel, {}),
    // Pinned PDFs
    pinnedPdfIds: types.optional(types.array(types.number), []),
    // PDF history
    pdfHistory: types.optional(types.array(PdfHistoryModel), []),
  })
  .actions((self) => {
    // Helper: Normalize location object to avoid MST duplicate node errors
    const normalizeLocation = (location: any) => ({
      latitude: location.latitude,
      longitude: location.longitude,
      city: location.city,
      country: location.country,
      state: location.state ?? null,
      timezone: location.timezone ?? "Asia/Kolkata",
      type: location.type ?? "city",
    })

    const locationsMatch = (locationA: any, locationB: any) => {
      if (!locationA || !locationB) return false

      const normalizedA = normalizeLocation(locationA)
      const normalizedB = normalizeLocation(locationB)

      return (
        normalizedA.latitude === normalizedB.latitude &&
        normalizedA.longitude === normalizedB.longitude &&
        normalizedA.city === normalizedB.city &&
        normalizedA.country === normalizedB.country &&
        normalizedA.state === normalizedB.state &&
        normalizedA.timezone === normalizedB.timezone &&
        normalizedA.type === normalizedB.type
      )
    }

    // Helper: Load location from storage as fallback
    const loadLocationFromStorage = flow(function* () {
      try {
        const savedLocation = yield storage.load("CURRENT_LOCATION")
        if (savedLocation) {
          const hydratedLocation = normalizeLocation(savedLocation)
          if (!locationsMatch(self.currentLocation, hydratedLocation)) {
            self.currentLocation = hydratedLocation
            self.currentLocationVersion += 1
          }
          self.currentLocationLoaded = true
          return true
        }
      } catch (error) {
        console.log("Error loading location from storage:", error)
      }
      return false
    })

    // Helper: Ensure we have a valid location (load from storage if needed)
    const ensureLocationLoaded = flow(function* () {
      if (self.currentLocationLoaded) return true
      return yield loadLocationFromStorage()
    })

    const persistPdfHistory = flow(function* () {
      try {
        const snapshot = self.pdfHistory.map((entry) => ({
          pdfId: entry.pdfId,
          openedCount: entry.openedCount,
          lastOpened: entry.lastOpened,
        }))
        yield storage.save(PDF_HISTORY_KEY, snapshot)
      } catch (error) {
        console.log("Failed to persist PDF history", error)
      }
    })

    const sortHistory = () => {
      const sorted = self.pdfHistory
        .slice()
        .sort((a, b) => new Date(b.lastOpened).getTime() - new Date(a.lastOpened).getTime())
      self.pdfHistory.replace(sorted)
    }

    return {
      // Method to add a location to past selected locations
      addToPastSelectedLocations(location: ILocation) {
        if (!location) return

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

        // Check if location already exists in past selected locations
        const existingIndex = self.pastSelectedLocations.findIndex(
          (pastLocation) =>
            pastLocation.latitude === newLocation.latitude &&
            pastLocation.longitude === newLocation.longitude &&
            pastLocation.city === newLocation.city &&
            pastLocation.country === newLocation.country,
        )

        if (existingIndex !== -1) {
          // Remove existing location and add it to the beginning (most recent first)
          self.pastSelectedLocations.splice(existingIndex, 1)
        }

        // Add to the beginning of the array (most recent first)
        self.pastSelectedLocations.unshift(newLocation)

        // Limit to 10 most recent locations to prevent array from growing too large
        if (self.pastSelectedLocations.length > 10) {
          self.pastSelectedLocations.splice(10)
        }

        // Save to storage
        storage.save("PAST_SELECTED_LOCATIONS", self.pastSelectedLocations)
      },

      fetchNearestLocation: flow(function* (lat: number, lng: number) {
        try {
          // check if self.locations is loaded and has data

          const response = yield apiSupabase.fetchNearestLocation(lat, lng)

          if (response.kind === "ok") {
            // Normalize location object
            const newLocation = normalizeLocation(response.data)
            const locationChanged = !locationsMatch(self.currentLocation, newLocation)

            // Store as device location
            self.deviceLocation = normalizeLocation(response.data)
            self.deviceLocationLoaded = true

            // Always auto-update current location with device location if different
            if (locationChanged) {
              self.currentLocation = newLocation
              self.currentLocationLoaded = true
              self.currentLocationVersion += 1

              // Save to storage so it persists
              yield storage.save("CURRENT_LOCATION", newLocation)
            } else {
              self.currentLocationLoaded = true
            }
          } else {
            // Response not ok - ensure we have a location from storage
            console.log("fetchNearestLocation: API response failed, checking storage")
            yield ensureLocationLoaded()
          }
        } catch (error) {
          console.log("fetchNearestLocation error:", error)
          self.deviceLocationLoaded = false
          // Ensure we have a location as fallback
          yield ensureLocationLoaded()
        }
      }),
      fetchLocations: flow(function* () {
        try {
          const list = yield storage.load("LOCATIONS")
          const storedVersion = yield storage.load("LOCATIONS_VERSION")

          const version = yield apiSupabase.fetchVersion(VERSION_KEYS.LOCATION_VERSION)

          if (list && list.length > 0 && storedVersion === version.data?.version) {
            self.locations = list
          } else {
            try {
              const response = yield apiSupabase.fetchLocations()

              if (response.kind === "ok") {
                self.locations = response.data
                yield storage.save("LOCATIONS", response.data)
                yield storage.save("LOCATIONS_VERSION", version.data?.version)
              }
            } catch (error) {
              console.log(error)
            }
          }
        } catch (error) {
          console.log(error)
        }
      }),

      fetchQiyam: flow(function* () {
        self.qiyamLoaded = false
        try {
          const response = yield apiSupabase.fetchData({ key: QIYAM_KEY })
          if (response.kind === "ok" && response.data?.value) {
            self.qiyam = response.data.value
            self.qiyamLoaded = true
          } else {
            self.qiyamLoaded = false
          }
        } catch (error) {
          console.log("Error fetching qiyam:", error)
          self.qiyamLoaded = false
        }
      }),

      setCurrentLocation: flow(function* (location: PlainLocation) {
        // Normalize location object
        const newLocation = normalizeLocation(location)

        if (locationsMatch(self.currentLocation, newLocation)) {
          self.currentLocationLoaded = true
          return false
        }

        // Add current location to past selected locations before updating
        if (self.currentLocation) {
          const currentLocationToAdd = {
            latitude: self.currentLocation.latitude,
            longitude: self.currentLocation.longitude,
            city: self.currentLocation.city,
            country: self.currentLocation.country,
            state: self.currentLocation.state,
            timezone: self.currentLocation.timezone,
            type: self.currentLocation.type,
          }

          // Check if location already exists in past selected locations
          const existingIndex = self.pastSelectedLocations.findIndex(
            (pastLocation) =>
              pastLocation.latitude === currentLocationToAdd.latitude &&
              pastLocation.longitude === currentLocationToAdd.longitude &&
              pastLocation.city === currentLocationToAdd.city &&
              pastLocation.country === currentLocationToAdd.country,
          )

          if (existingIndex !== -1) {
            // Remove existing location and add it to the beginning (most recent first)
            self.pastSelectedLocations.splice(existingIndex, 1)
          }

          // Add to the beginning of the array (most recent first)
          self.pastSelectedLocations.unshift(currentLocationToAdd)

          // Limit to 10 most recent locations to prevent array from growing too large
          if (self.pastSelectedLocations.length > 10) {
            self.pastSelectedLocations.splice(10)
          }

          // Save to storage
          storage.save("PAST_SELECTED_LOCATIONS", self.pastSelectedLocations)
        }

        self.currentLocation = newLocation
        self.currentLocationLoaded = true
        self.currentLocationVersion += 1

        const version = yield apiSupabase.fetchVersion(VERSION_KEYS.LOCATION_VERSION)

        // Save location to storage
        yield storage.save("CURRENT_LOCATION", newLocation)
        yield storage.save("CURRENT_LOCATION_VERSION", version.data?.version)

        return true
      }),

      // Method specifically for auto-detect that always updates current location
      autoDetectLocation: flow(function* (lat: number, lng: number) {
        try {
          const response = yield apiSupabase.fetchNearestLocation(lat, lng)
          if (response.kind === "ok") {
            // Normalize location object
            const newLocation = normalizeLocation(response.data)
            const locationChanged = !locationsMatch(self.currentLocation, newLocation)

            // Add current location to past selected locations before updating
            if (self.currentLocation) {
              const currentLocationToAdd = {
                latitude: self.currentLocation.latitude,
                longitude: self.currentLocation.longitude,
                city: self.currentLocation.city,
                country: self.currentLocation.country,
                state: self.currentLocation.state,
                timezone: self.currentLocation.timezone,
                type: self.currentLocation.type,
              }

              // Check if location already exists in past selected locations
              const existingIndex = self.pastSelectedLocations.findIndex(
                (pastLocation) =>
                  pastLocation.latitude === currentLocationToAdd.latitude &&
                  pastLocation.longitude === currentLocationToAdd.longitude &&
                  pastLocation.city === currentLocationToAdd.city &&
                  pastLocation.country === currentLocationToAdd.country,
              )

              if (existingIndex !== -1) {
                // Remove existing location and add it to the beginning (most recent first)
                self.pastSelectedLocations.splice(existingIndex, 1)
              }

              // Add to the beginning of the array (most recent first)
              self.pastSelectedLocations.unshift(currentLocationToAdd)

              // Limit to 10 most recent locations to prevent array from growing too large
              if (self.pastSelectedLocations.length > 10) {
                self.pastSelectedLocations.splice(10)
              }

              // Save to storage
              storage.save("PAST_SELECTED_LOCATIONS", self.pastSelectedLocations)
            }

            // Always update current location for auto-detect
            if (locationChanged) {
              self.currentLocation = newLocation
              self.currentLocationLoaded = true
              self.currentLocationVersion += 1
            } else {
              self.currentLocationLoaded = true
            }

            // Also update device location
            self.deviceLocation = newLocation
            self.deviceLocationLoaded = true

            // Save to storage
            if (locationChanged) {
              yield storage.save("CURRENT_LOCATION", newLocation)
            }
          } else {
            // Response not ok - ensure we have a location from storage
            console.log("autoDetectLocation: API response failed, checking storage")
            yield ensureLocationLoaded()
          }
        } catch (error) {
          console.log("autoDetectLocation error:", error)
          self.deviceLocationLoaded = false
          // Ensure we have a location as fallback
          yield ensureLocationLoaded()
        }
      }),

      // Method to load current location from storage
      loadCurrentLocation: flow(function* () {
        const loaded = yield loadLocationFromStorage()

        return loaded
      }),

      // Method to load past selected locations from storage
      loadPastSelectedLocations: flow(function* () {
        try {
          const savedLocations = yield storage.load("PAST_SELECTED_LOCATIONS")
          if (savedLocations && Array.isArray(savedLocations)) {
            self.pastSelectedLocations.replace(savedLocations)
          }
        } catch (error) {
          console.log("Error loading past selected locations:", error)
        }
      }),

      // Method to clear past selected locations
      clearPastSelectedLocations() {
        self.pastSelectedLocations.clear()
        storage.save("PAST_SELECTED_LOCATIONS", [])
      },

      // Reminder settings actions
      setNotificationType(type: "short" | "long") {
        self.reminderSettings.notificationType = type
        storage.save("REMINDER_SETTINGS", {
          notificationType: type,
          triggerBeforeMinutes: self.reminderSettings.triggerBeforeMinutes,
          customOffsets: Array.from(self.reminderSettings.customOffsets.entries()),
        })
      },

      setTriggerBeforeMinutes(minutes: number) {
        self.reminderSettings.triggerBeforeMinutes = minutes
        storage.save("REMINDER_SETTINGS", {
          notificationType: self.reminderSettings.notificationType,
          triggerBeforeMinutes: minutes,
          customOffsets: Array.from(self.reminderSettings.customOffsets.entries()),
        })
      },

      setCustomOffset(prayerTime: string, offsetMinutes: number) {
        self.reminderSettings.customOffsets.set(prayerTime, offsetMinutes)
        storage.save("REMINDER_SETTINGS", {
          notificationType: self.reminderSettings.notificationType,
          triggerBeforeMinutes: self.reminderSettings.triggerBeforeMinutes,
          customOffsets: Array.from(self.reminderSettings.customOffsets.entries()),
        })
      },

      clearCustomOffset(prayerTime: string) {
        self.reminderSettings.customOffsets.delete(prayerTime)
        storage.save("REMINDER_SETTINGS", {
          notificationType: self.reminderSettings.notificationType,
          triggerBeforeMinutes: self.reminderSettings.triggerBeforeMinutes,
          customOffsets: Array.from(self.reminderSettings.customOffsets.entries()),
        })
      },

      loadReminderSettings: flow(function* () {
        try {
          const savedSettings = yield storage.load("REMINDER_SETTINGS")
          if (savedSettings) {
            self.reminderSettings.notificationType = savedSettings.notificationType || "short"
            self.reminderSettings.triggerBeforeMinutes = savedSettings.triggerBeforeMinutes || 5

            // Convert array back to map
            if (savedSettings.customOffsets && Array.isArray(savedSettings.customOffsets)) {
              self.reminderSettings.customOffsets.clear()
              savedSettings.customOffsets.forEach(([key, value]: [string, number]) => {
                self.reminderSettings.customOffsets.set(key, value)
              })
            }
          }
        } catch (error) {
          console.error("Error loading reminder settings:", error)
        }
      }),

      // Pinned PDFs actions
      pinPdf(pdfId: number) {
        if (!self.pinnedPdfIds.includes(pdfId)) {
          self.pinnedPdfIds.push(pdfId)
          storage.save("PINNED_PDF_IDS", Array.from(self.pinnedPdfIds))
        }
      },

      unpinPdf(pdfId: number) {
        const index = self.pinnedPdfIds.indexOf(pdfId)
        if (index > -1) {
          self.pinnedPdfIds.splice(index, 1)
          storage.save("PINNED_PDF_IDS", Array.from(self.pinnedPdfIds))
        }
      },

      togglePinPdf(pdfId: number) {
        if (self.pinnedPdfIds.includes(pdfId)) {
          const index = self.pinnedPdfIds.indexOf(pdfId)
          if (index > -1) {
            self.pinnedPdfIds.splice(index, 1)
            storage.save("PINNED_PDF_IDS", Array.from(self.pinnedPdfIds))
          }
        } else {
          if (!self.pinnedPdfIds.includes(pdfId)) {
            self.pinnedPdfIds.push(pdfId)
            storage.save("PINNED_PDF_IDS", Array.from(self.pinnedPdfIds))
          }
        }
      },

      isPdfPinned(pdfId: number): boolean {
        return self.pinnedPdfIds.includes(pdfId)
      },

      loadPinnedPdfs: flow(function* () {
        try {
          const savedPinnedIds = yield storage.load("PINNED_PDF_IDS")
          if (savedPinnedIds && Array.isArray(savedPinnedIds)) {
            self.pinnedPdfIds.replace(savedPinnedIds)
          }
        } catch (error) {
          console.error("Error loading pinned PDFs:", error)
        }
      }),

      clearAllPinnedPdfs() {
        self.pinnedPdfIds.clear()
        storage.save("PINNED_PDF_IDS", [])
      },

      loadPdfHistory: flow(function* () {
        try {
          const savedHistory = yield storage.load(PDF_HISTORY_KEY)
          if (savedHistory && Array.isArray(savedHistory)) {
            self.pdfHistory.replace(savedHistory)
            sortHistory()
          }
        } catch (error) {
          console.log("Error loading PDF history:", error)
        }
      }),

      clearPdfHistory() {
        self.pdfHistory.clear()
        storage.save(PDF_HISTORY_KEY, [])
      },

      recordPdfOpen: flow(function* (pdfId: number) {
        try {
          const now = new Date().toISOString()
          const existingEntry = self.pdfHistory.find((entry) => entry.pdfId === pdfId)
          if (existingEntry) {
            existingEntry.openedCount += 1
            existingEntry.lastOpened = now
          } else {
            self.pdfHistory.unshift({
              pdfId,
              openedCount: 1,
              lastOpened: now,
            })
          }
          sortHistory()
          yield persistPdfHistory()
        } catch (error) {
          console.log("Failed to record PDF open", error)
        }
      }),
    }
  })
  .views((self) => ({
    // Computed view to check if data is loaded
    get isDataLoaded() {
      return self.qiyamLoaded && self.qiyam !== ""
    },

    getRecentPdfHistory(limit = 6) {
      return self.pdfHistory.slice(0, limit)
    },
  }))

// Create an instance of DataStore

export interface DataStore extends Instance<typeof DataStoreModel> {}
export interface DataStoreSnapshot extends SnapshotOut<typeof DataStoreModel> {}
export interface ILocation extends Instance<typeof LocationModel> {}
