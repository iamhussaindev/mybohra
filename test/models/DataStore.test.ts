import { getSnapshot, applySnapshot } from "mobx-state-tree"
import { DataStoreModel } from "app/models/DataStore"
import { PlainLocation } from "app/types/location"
import { mockLocation, createMockLocation } from "../utils/testUtils"

describe("DataStore", () => {
  let store: any

  beforeEach(() => {
    store = DataStoreModel.create({
      locations: [],
      currentLocation: null,
      deviceLocation: null,
      currentLocationLoaded: false,
      deviceLocationLoaded: false,
    })
  })

  describe("Initial State", () => {
    it("should have empty locations array initially", () => {
      expect(store.locations.length).toBe(0)
    })

    it("should have null current and device locations", () => {
      expect(store.currentLocation).toBeNull()
      expect(store.deviceLocation).toBeNull()
    })

    it("should not be loaded initially", () => {
      expect(store.currentLocationLoaded).toBe(false)
      expect(store.deviceLocationLoaded).toBe(false)
    })
  })

  describe("addLocation", () => {
    it("should add a new location", () => {
      const locationData: PlainLocation = {
        latitude: 23.0225,
        longitude: 72.5714,
        city: "Ahmedabad",
        state: "Gujarat",
        country: "India",
        timezone: "Asia/Kolkata",
        type: "saved",
      }

      store.addLocation(locationData)

      expect(store.locations.length).toBe(1)
      expect(store.locations[0].city).toBe("Ahmedabad")
      expect(store.locations[0].type).toBe("saved")
    })

    it("should generate unique ID for each location", () => {
      const location1 = createMockLocation({ city: "Ahmedabad" })
      const location2 = createMockLocation({ city: "Mumbai" })

      store.addLocation(location1)
      store.addLocation(location2)

      expect(store.locations[0].id).not.toBe(store.locations[1].id)
    })

    it("should not add duplicate locations", () => {
      const locationData: PlainLocation = {
        latitude: 23.0225,
        longitude: 72.5714,
        city: "Ahmedabad",
        state: "Gujarat",
        country: "India",
        timezone: "Asia/Kolkata",
        type: "saved",
      }

      store.addLocation(locationData)
      store.addLocation(locationData)

      expect(store.locations.length).toBe(1)
    })
  })

  describe("removeLocation", () => {
    beforeEach(() => {
      const locationData: PlainLocation = {
        latitude: 23.0225,
        longitude: 72.5714,
        city: "Ahmedabad",
        state: "Gujarat",
        country: "India",
        timezone: "Asia/Kolkata",
        type: "saved",
      }
      store.addLocation(locationData)
    })

    it("should remove location by ID", () => {
      const locationId = store.locations[0].id

      store.removeLocation(locationId)

      expect(store.locations.length).toBe(0)
    })

    it("should throw error for non-existent location", () => {
      expect(() => store.removeLocation("non-existent-id")).toThrow()
    })
  })

  describe("setCurrentLocation", () => {
    it("should set current location", () => {
      const locationData: PlainLocation = {
        latitude: 23.0225,
        longitude: 72.5714,
        city: "Ahmedabad",
        state: "Gujarat",
        country: "India",
        timezone: "Asia/Kolkata",
        type: "current",
      }

      store.setCurrentLocation(locationData)

      expect(store.currentLocation).toBeDefined()
      expect(store.currentLocation?.city).toBe("Ahmedabad")
      expect(store.currentLocationLoaded).toBe(true)
    })

    it("should add current location to locations array", () => {
      const locationData: PlainLocation = {
        latitude: 23.0225,
        longitude: 72.5714,
        city: "Ahmedabad",
        state: "Gujarat",
        country: "India",
        timezone: "Asia/Kolkata",
        type: "current",
      }

      store.setCurrentLocation(locationData)

      expect(store.locations.length).toBe(1)
      expect(store.locations[0].type).toBe("current")
    })
  })

  describe("setDeviceLocation", () => {
    it("should set device location", () => {
      const locationData: PlainLocation = {
        latitude: 23.0225,
        longitude: 72.5714,
        city: "Ahmedabad",
        state: "Gujarat",
        country: "India",
        timezone: "Asia/Kolkata",
        type: "device",
      }

      store.setDeviceLocation(locationData)

      expect(store.deviceLocation).toBeDefined()
      expect(store.deviceLocation?.city).toBe("Ahmedabad")
      expect(store.deviceLocationLoaded).toBe(true)
    })

    it("should add device location to locations array", () => {
      const locationData: PlainLocation = {
        latitude: 23.0225,
        longitude: 72.5714,
        city: "Ahmedabad",
        state: "Gujarat",
        country: "India",
        timezone: "Asia/Kolkata",
        type: "device",
      }

      store.setDeviceLocation(locationData)

      expect(store.locations.length).toBe(1)
      expect(store.locations[0].type).toBe("device")
    })
  })

  describe("setTemporaryLocation", () => {
    it("should set temporary location", () => {
      const locationData: PlainLocation = {
        latitude: 23.0225,
        longitude: 72.5714,
        city: "Ahmedabad",
        state: "Gujarat",
        country: "India",
        timezone: "Asia/Kolkata",
        type: "temporary",
      }

      store.setTemporaryLocation(locationData)

      expect(store.locations.length).toBe(1)
      expect(store.locations[0].type).toBe("temporary")
    })

    it("should replace existing temporary location", () => {
      const location1: PlainLocation = {
        latitude: 23.0225,
        longitude: 72.5714,
        city: "Ahmedabad",
        state: "Gujarat",
        country: "India",
        timezone: "Asia/Kolkata",
        type: "temporary",
      }

      const location2: PlainLocation = {
        latitude: 19.076,
        longitude: 72.8777,
        city: "Mumbai",
        state: "Maharashtra",
        country: "India",
        timezone: "Asia/Kolkata",
        type: "temporary",
      }

      store.setTemporaryLocation(location1)
      store.setTemporaryLocation(location2)

      expect(store.locations.length).toBe(1)
      expect(store.locations[0].city).toBe("Mumbai")
    })
  })

  describe("autoDetectLocation", () => {
    it("should set both current and device location", async () => {
      const locationData: PlainLocation = {
        latitude: 23.0225,
        longitude: 72.5714,
        city: "Ahmedabad",
        state: "Gujarat",
        country: "India",
        timezone: "Asia/Kolkata",
        type: "current",
      }

      await store.autoDetectLocation(locationData)

      expect(store.currentLocation).toBeDefined()
      expect(store.deviceLocation).toBeDefined()
      expect(store.currentLocationLoaded).toBe(true)
      expect(store.deviceLocationLoaded).toBe(true)
    })

    it("should add both locations to locations array", async () => {
      const locationData: PlainLocation = {
        latitude: 23.0225,
        longitude: 72.5714,
        city: "Ahmedabad",
        state: "Gujarat",
        country: "India",
        timezone: "Asia/Kolkata",
        type: "current",
      }

      await store.autoDetectLocation(locationData)

      expect(store.locations.length).toBe(2)
      expect(store.locations.some((l: any) => l.type === "current")).toBe(true)
      expect(store.locations.some((l: any) => l.type === "device")).toBe(true)
    })
  })

  describe("Views", () => {
    beforeEach(() => {
      const locations = [
        createMockLocation({ city: "Ahmedabad", type: "current" }),
        createMockLocation({ city: "Mumbai", type: "saved" }),
        createMockLocation({ city: "Delhi", type: "saved" }),
      ]

      locations.forEach((location) => store.addLocation(location))
    })

    it("should return saved locations only", () => {
      const savedLocations = store.savedLocations
      expect(savedLocations.length).toBe(2)
      expect(savedLocations.every((l: any) => l.type === "saved")).toBe(true)
    })

    it("should return locations by type", () => {
      const currentLocations = store.getLocationsByType("current")
      expect(currentLocations.length).toBe(1)
      expect(currentLocations[0].city).toBe("Ahmedabad")

      const savedLocations = store.getLocationsByType("saved")
      expect(savedLocations.length).toBe(2)
    })

    it("should find location by ID", () => {
      const locationId = store.locations[0].id
      const foundLocation = store.getLocationById(locationId)

      expect(foundLocation).toBeDefined()
      expect(foundLocation?.id).toBe(locationId)
    })

    it("should return null for non-existent location ID", () => {
      const foundLocation = store.getLocationById("non-existent-id")
      expect(foundLocation).toBeNull()
    })
  })

  describe("Persistence", () => {
    it("should load locations from storage", async () => {
      const mockLocations = [
        createMockLocation({ city: "Ahmedabad" }),
        createMockLocation({ city: "Mumbai" }),
      ]

      const mockStorage = require("app/utils/storage")
      mockStorage.load.mockResolvedValueOnce(mockLocations)

      await store.loadLocations()

      expect(store.locations.length).toBe(2)
    })

    it("should save locations to storage", () => {
      const locationData: PlainLocation = {
        latitude: 23.0225,
        longitude: 72.5714,
        city: "Ahmedabad",
        state: "Gujarat",
        country: "India",
        timezone: "Asia/Kolkata",
        type: "saved",
      }

      const mockStorage = require("app/utils/storage")
      mockStorage.save.mockResolvedValueOnce(undefined)

      store.addLocation(locationData)

      expect(mockStorage.save).toHaveBeenCalledWith(
        "locations",
        expect.arrayContaining([expect.objectContaining({ city: "Ahmedabad" })]),
      )
    })
  })
})
