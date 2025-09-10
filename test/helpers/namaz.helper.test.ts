import { namazLabels, getNextNamaz, getCurrentGhari } from "app/helpers/namaz.helper"
import { NamazTimes } from "app/helpers/namaz.helper"

describe("namaz.helper", () => {
  describe("namazLabels", () => {
    it("should contain all prayer time labels", () => {
      expect(namazLabels).toHaveProperty("fajr")
      expect(namazLabels).toHaveProperty("zawaal")
      expect(namazLabels).toHaveProperty("zohar")
      expect(namazLabels).toHaveProperty("asar")
      expect(namazLabels).toHaveProperty("sihori")
      expect(namazLabels).toHaveProperty("maghrib_safe")
      expect(namazLabels).toHaveProperty("nisful_layl")
    })

    it("should have non-empty labels", () => {
      Object.values(namazLabels).forEach((label) => {
        expect(label).toBeTruthy()
        expect(typeof label).toBe("string")
        expect(label.length).toBeGreaterThan(0)
      })
    })
  })

  describe("getNextNamaz", () => {
    const mockPrayerTimes: NamazTimes = {
      fajr: "05:30",
      zawaal: "12:15",
      zohar: "12:45",
      asar: "16:20",
      sihori: "18:45",
      maghrib_safe: "19:15",
      nisful_layl: "23:30",
    }

    it("should return next prayer time when current time is before first prayer", () => {
      const currentTime = "04:00"
      const result = getNextNamaz(mockPrayerTimes, currentTime)

      expect(result).toBe("fajr")
    })

    it("should return next prayer time when current time is between prayers", () => {
      const currentTime = "14:00"
      const result = getNextNamaz(mockPrayerTimes, currentTime)

      expect(result).toBe("asar")
    })

    it("should return first prayer of next day when current time is after last prayer", () => {
      const currentTime = "23:45"
      const result = getNextNamaz(mockPrayerTimes, currentTime)

      expect(result).toBe("fajr")
    })

    it("should handle exact prayer time", () => {
      const currentTime = "12:45"
      const result = getNextNamaz(mockPrayerTimes, currentTime)

      expect(result).toBe("asar")
    })

    it("should handle edge case at midnight", () => {
      const currentTime = "00:00"
      const result = getNextNamaz(mockPrayerTimes, currentTime)

      expect(result).toBe("fajr")
    })
  })

  describe("getCurrentGhari", () => {
    const mockPrayerTimes: NamazTimes = {
      fajr: "05:30",
      zawaal: "12:15",
      zohar: "12:45",
      asar: "16:20",
      sihori: "18:45",
      maghrib_safe: "19:15",
      nisful_layl: "23:30",
    }

    it("should return current ghari based on time", () => {
      const currentTime = "14:00"
      const result = getCurrentGhari(mockPrayerTimes, currentTime)

      expect(result).toBeDefined()
      expect(typeof result).toBe("string")
    })

    it("should return fajr ghari before sunrise", () => {
      const currentTime = "04:00"
      const result = getCurrentGhari(mockPrayerTimes, currentTime)

      expect(result).toBe("fajr")
    })

    it("should return zohar ghari during midday", () => {
      const currentTime = "14:00"
      const result = getCurrentGhari(mockPrayerTimes, currentTime)

      expect(result).toBe("zohar")
    })

    it("should return maghrib ghari after sunset", () => {
      const currentTime = "20:00"
      const result = getCurrentGhari(mockPrayerTimes, currentTime)

      expect(result).toBe("maghrib_safe")
    })

    it("should return nisful_layl ghari late at night", () => {
      const currentTime = "23:45"
      const result = getCurrentGhari(mockPrayerTimes, currentTime)

      expect(result).toBe("nisful_layl")
    })
  })

  describe("time parsing", () => {
    it("should handle 24-hour format correctly", () => {
      const mockPrayerTimes: NamazTimes = {
        fajr: "05:30",
        zawaal: "12:15",
        zohar: "12:45",
        asar: "16:20",
        sihori: "18:45",
        maghrib_safe: "19:15",
        nisful_layl: "23:30",
      }

      const currentTime = "13:30"
      const nextNamaz = getNextNamaz(mockPrayerTimes, currentTime)
      const currentGhari = getCurrentGhari(mockPrayerTimes, currentTime)

      expect(nextNamaz).toBe("asar")
      expect(currentGhari).toBe("zohar")
    })

    it("should handle single digit hours", () => {
      const mockPrayerTimes: NamazTimes = {
        fajr: "5:30",
        zawaal: "12:15",
        zohar: "12:45",
        asar: "16:20",
        sihori: "18:45",
        maghrib_safe: "19:15",
        nisful_layl: "23:30",
      }

      const currentTime = "6:00"
      const nextNamaz = getNextNamaz(mockPrayerTimes, currentTime)

      expect(nextNamaz).toBe("zawaal")
    })
  })

  describe("edge cases", () => {
    it("should handle empty prayer times", () => {
      const emptyPrayerTimes: NamazTimes = {
        fajr: "",
        zawaal: "",
        zohar: "",
        asar: "",
        sihori: "",
        maghrib_safe: "",
        nisful_layl: "",
      }

      const currentTime = "12:00"
      const nextNamaz = getNextNamaz(emptyPrayerTimes, currentTime)
      const currentGhari = getCurrentGhari(emptyPrayerTimes, currentTime)

      // Should handle gracefully without throwing
      expect(nextNamaz).toBeDefined()
      expect(currentGhari).toBeDefined()
    })

    it("should handle invalid time format", () => {
      const mockPrayerTimes: NamazTimes = {
        fajr: "05:30",
        zawaal: "12:15",
        zohar: "12:45",
        asar: "16:20",
        sihori: "18:45",
        maghrib_safe: "19:15",
        nisful_layl: "23:30",
      }

      const currentTime = "invalid-time"
      const nextNamaz = getNextNamaz(mockPrayerTimes, currentTime)
      const currentGhari = getCurrentGhari(mockPrayerTimes, currentTime)

      // Should handle gracefully
      expect(nextNamaz).toBeDefined()
      expect(currentGhari).toBeDefined()
    })
  })
})
