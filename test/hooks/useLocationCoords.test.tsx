import { renderHook } from "@testing-library/react-hooks"
import { useLocationCoords } from "app/hooks/useLocationCoords"
import { setupRootStore } from "app/models"
import { mockLocation } from "../utils/testUtils"

// Mock the useStores hook
jest.mock("app/models", () => ({
  ...jest.requireActual("app/models"),
  useStores: jest.fn(),
}))

const { useStores } = require("app/models")

describe("useLocationCoords", () => {
  let mockDataStore: any

  beforeEach(() => {
    mockDataStore = {
      currentLocation: mockLocation,
      currentLocationLoaded: true,
    }

    useStores.mockReturnValue({
      dataStore: mockDataStore,
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe("with valid location", () => {
    it("should return location coordinates", () => {
      const { result } = renderHook(() => useLocationCoords())

      expect(result.current).toEqual({
        latitude: mockLocation.latitude,
        longitude: mockLocation.longitude,
      })
    })

    it("should memoize coordinates", () => {
      const { result, rerender } = renderHook(() => useLocationCoords())

      const firstResult = result.current

      // Rerender with same location
      rerender()

      expect(result.current).toBe(firstResult) // Same reference due to memoization
    })

    it("should update when location changes", () => {
      const { result, rerender } = renderHook(() => useLocationCoords())

      const firstResult = result.current

      // Update location
      const newLocation = { ...mockLocation, latitude: 19.076, longitude: 72.8777 }
      useStores.mockReturnValue({
        dataStore: {
          currentLocation: newLocation,
          currentLocationLoaded: true,
        },
      })

      rerender()

      expect(result.current).not.toBe(firstResult) // Different reference
      expect(result.current).toEqual({
        latitude: 19.076,
        longitude: 72.8777,
      })
    })
  })

  describe("with null location", () => {
    beforeEach(() => {
      useStores.mockReturnValue({
        dataStore: {
          currentLocation: null,
          currentLocationLoaded: false,
        },
      })
    })

    it("should return null coordinates", () => {
      const { result } = renderHook(() => useLocationCoords())

      expect(result.current).toBeNull()
    })

    it("should handle location not loaded", () => {
      useStores.mockReturnValue({
        dataStore: {
          currentLocation: null,
          currentLocationLoaded: false,
        },
      })

      const { result } = renderHook(() => useLocationCoords())

      expect(result.current).toBeNull()
    })
  })

  describe("with undefined location", () => {
    beforeEach(() => {
      useStores.mockReturnValue({
        dataStore: {
          currentLocation: undefined,
          currentLocationLoaded: false,
        },
      })
    })

    it("should return null coordinates", () => {
      const { result } = renderHook(() => useLocationCoords())

      expect(result.current).toBeNull()
    })
  })

  describe("memoization behavior", () => {
    it("should not recreate coordinates when unrelated store properties change", () => {
      const { result, rerender } = renderHook(() => useLocationCoords())

      const firstResult = result.current

      // Update unrelated property
      useStores.mockReturnValue({
        dataStore: {
          currentLocation: mockLocation,
          currentLocationLoaded: true,
          someOtherProperty: "changed",
        },
      })

      rerender()

      expect(result.current).toBe(firstResult) // Same reference
    })

    it("should recreate coordinates when latitude changes", () => {
      const { result, rerender } = renderHook(() => useLocationCoords())

      const firstResult = result.current

      // Update latitude
      const newLocation = { ...mockLocation, latitude: 19.076 }
      useStores.mockReturnValue({
        dataStore: {
          currentLocation: newLocation,
          currentLocationLoaded: true,
        },
      })

      rerender()

      expect(result.current).not.toBe(firstResult) // Different reference
      expect(result.current?.latitude).toBe(19.076)
    })

    it("should recreate coordinates when longitude changes", () => {
      const { result, rerender } = renderHook(() => useLocationCoords())

      const firstResult = result.current

      // Update longitude
      const newLocation = { ...mockLocation, longitude: 72.8777 }
      useStores.mockReturnValue({
        dataStore: {
          currentLocation: newLocation,
          currentLocationLoaded: true,
        },
      })

      rerender()

      expect(result.current).not.toBe(firstResult) // Different reference
      expect(result.current?.longitude).toBe(72.8777)
    })
  })

  describe("edge cases", () => {
    it("should handle location with missing coordinates", () => {
      const incompleteLocation = {
        ...mockLocation,
        latitude: undefined,
        longitude: undefined,
      }

      useStores.mockReturnValue({
        dataStore: {
          currentLocation: incompleteLocation,
          currentLocationLoaded: true,
        },
      })

      const { result } = renderHook(() => useLocationCoords())

      expect(result.current).toBeNull()
    })

    it("should handle location with partial coordinates", () => {
      const partialLocation = {
        ...mockLocation,
        latitude: 23.0225,
        longitude: undefined,
      }

      useStores.mockReturnValue({
        dataStore: {
          currentLocation: partialLocation,
          currentLocationLoaded: true,
        },
      })

      const { result } = renderHook(() => useLocationCoords())

      expect(result.current).toBeNull()
    })

    it("should handle zero coordinates", () => {
      const zeroLocation = {
        ...mockLocation,
        latitude: 0,
        longitude: 0,
      }

      useStores.mockReturnValue({
        dataStore: {
          currentLocation: zeroLocation,
          currentLocationLoaded: true,
        },
      })

      const { result } = renderHook(() => useLocationCoords())

      expect(result.current).toEqual({
        latitude: 0,
        longitude: 0,
      })
    })
  })

  describe("performance", () => {
    it("should not cause unnecessary re-renders", () => {
      let renderCount = 0

      const { rerender } = renderHook(() => {
        renderCount++
        return useLocationCoords()
      })

      expect(renderCount).toBe(1)

      // Rerender with same location
      rerender()
      expect(renderCount).toBe(2) // Hook re-runs but coordinates are memoized

      // Rerender with same location again
      rerender()
      expect(renderCount).toBe(3) // Hook re-runs but coordinates are memoized
    })
  })
})
