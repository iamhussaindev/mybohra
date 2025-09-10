import { momentTime, currentTime } from "app/utils/currentTime"

// Mock moment
jest.mock("moment", () => {
  const actualMoment = jest.requireActual("moment")
  return {
    __esModule: true,
    default: jest.fn((date?: any) => {
      if (date) {
        return actualMoment(date)
      }
      // Return a fixed date for testing
      return actualMoment("2024-01-15T10:00:00.000Z")
    }),
  }
})

describe("currentTime utils", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe("momentTime", () => {
    it("should return moment instance for current time when no date provided", () => {
      const result = momentTime()

      expect(result).toBeDefined()
      expect(typeof result.format).toBe("function")
      expect(typeof result.add).toBe("function")
      expect(typeof result.subtract).toBe("function")
    })

    it("should return moment instance for provided date", () => {
      const testDate = "2024-01-15T12:00:00.000Z"
      const result = momentTime(testDate)

      expect(result).toBeDefined()
      expect(typeof result.format).toBe("function")
    })

    it("should handle Date object", () => {
      const testDate = new Date("2024-01-15T12:00:00.000Z")
      const result = momentTime(testDate)

      expect(result).toBeDefined()
      expect(typeof result.format).toBe("function")
    })

    it("should handle timestamp", () => {
      const timestamp = 1705320000000 // 2024-01-15T12:00:00.000Z
      const result = momentTime(timestamp)

      expect(result).toBeDefined()
      expect(typeof result.format).toBe("function")
    })
  })

  describe("currentTime", () => {
    it("should return current moment instance", () => {
      const result = currentTime()

      expect(result).toBeDefined()
      expect(typeof result.format).toBe("function")
      expect(typeof result.add).toBe("function")
      expect(typeof result.subtract).toBe("function")
    })

    it("should return same type as momentTime()", () => {
      const current = currentTime()
      const moment = momentTime()

      expect(typeof current.format).toBe(typeof moment.format)
      expect(typeof current.add).toBe(typeof moment.add)
      expect(typeof current.subtract).toBe(typeof moment.subtract)
    })
  })

  describe("moment operations", () => {
    it("should support format operations", () => {
      const moment = momentTime("2024-01-15T12:00:00.000Z")
      const formatted = moment.format("YYYY-MM-DD HH:mm:ss")

      expect(formatted).toBe("2024-01-15 12:00:00")
    })

    it("should support add operations", () => {
      const moment = momentTime("2024-01-15T12:00:00.000Z")
      const added = moment.add(1, "hour")

      expect(added.format("HH:mm")).toBe("13:00")
    })

    it("should support subtract operations", () => {
      const moment = momentTime("2024-01-15T12:00:00.000Z")
      const subtracted = moment.subtract(30, "minutes")

      expect(subtracted.format("HH:mm")).toBe("11:30")
    })

    it("should support comparison operations", () => {
      const moment1 = momentTime("2024-01-15T12:00:00.000Z")
      const moment2 = momentTime("2024-01-15T13:00:00.000Z")

      expect(moment1.isBefore(moment2)).toBe(true)
      expect(moment2.isAfter(moment1)).toBe(true)
      expect(moment1.isSame(moment1)).toBe(true)
    })

    it("should support valueOf for timestamp", () => {
      const moment = momentTime("2024-01-15T12:00:00.000Z")
      const timestamp = moment.valueOf()

      expect(typeof timestamp).toBe("number")
      expect(timestamp).toBeGreaterThan(0)
    })
  })

  describe("timezone handling", () => {
    it("should handle timezone operations", () => {
      const moment = momentTime("2024-01-15T12:00:00.000Z")

      // Test timezone conversion
      const utc = moment.utc()
      const local = moment.local()

      expect(utc).toBeDefined()
      expect(local).toBeDefined()
    })
  })

  describe("edge cases", () => {
    it("should handle null input", () => {
      const result = momentTime(null as any)

      expect(result).toBeDefined()
      expect(typeof result.format).toBe("function")
    })

    it("should handle undefined input", () => {
      const result = momentTime(undefined as any)

      expect(result).toBeDefined()
      expect(typeof result.format).toBe("function")
    })

    it("should handle invalid date string", () => {
      const result = momentTime("invalid-date")

      expect(result).toBeDefined()
      expect(typeof result.format).toBe("function")
      // Invalid dates should still return a moment object
      expect(result.isValid()).toBe(false)
    })
  })
})
