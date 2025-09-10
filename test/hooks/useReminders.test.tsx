import { renderHook, act } from "@testing-library/react-hooks"
import { useReminders } from "app/hooks/useReminders"
import { setupRootStore } from "app/models"
import { mockLocation, createMockReminder } from "../utils/testUtils"

// Mock the useStores hook
jest.mock("app/models", () => ({
  ...jest.requireActual("app/models"),
  useStores: jest.fn(),
}))

const { useStores } = require("app/models")

describe("useReminders", () => {
  let mockReminderStore: any
  let mockDataStore: any

  beforeEach(() => {
    // Create mock stores
    mockReminderStore = {
      reminders: [],
      isLoaded: false,
      addReminder: jest.fn(),
      updateReminder: jest.fn(),
      deleteReminder: jest.fn(),
      toggleReminder: jest.fn(),
      rescheduleAllReminders: jest.fn(),
      remindersByPrayerTime: {},
      enabledReminders: [],
      getRemindersForPrayerTime: jest.fn(),
    }

    mockDataStore = {
      currentLocation: mockLocation,
      currentLocationLoaded: true,
    }

    useStores.mockReturnValue({
      reminderStore: mockReminderStore,
      dataStore: mockDataStore,
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe("initial state", () => {
    it("should return initial state from store", () => {
      const { result } = renderHook(() => useReminders())

      expect(result.current.reminders).toEqual([])
      expect(result.current.isLoaded).toBe(false)
      expect(result.current.enabledReminders).toEqual([])
      expect(result.current.remindersByPrayerTime).toEqual({})
    })
  })

  describe("createReminder", () => {
    it("should create a new reminder", async () => {
      const reminderData = {
        name: "Test Reminder",
        prayerTime: "fajr" as const,
        offsetMinutes: 0,
        repeatType: "daily" as const,
        customDays: [],
      }

      mockReminderStore.addReminder.mockResolvedValueOnce(undefined)

      const { result } = renderHook(() => useReminders())

      await act(async () => {
        await result.current.createReminder(reminderData)
      })

      expect(mockReminderStore.addReminder).toHaveBeenCalledWith({
        ...reminderData,
        location: mockLocation,
      })
    })

    it("should handle creation errors", async () => {
      const reminderData = {
        name: "Test Reminder",
        prayerTime: "fajr" as const,
        offsetMinutes: 0,
        repeatType: "daily" as const,
        customDays: [],
      }

      const error = new Error("Creation failed")
      mockReminderStore.addReminder.mockRejectedValueOnce(error)

      const { result } = renderHook(() => useReminders())

      await act(async () => {
        await expect(result.current.createReminder(reminderData)).rejects.toThrow("Creation failed")
      })
    })
  })

  describe("updateReminder", () => {
    it("should update an existing reminder", async () => {
      const reminderId = "reminder-1"
      const updates = { name: "Updated Reminder" }

      mockReminderStore.updateReminder.mockResolvedValueOnce(undefined)

      const { result } = renderHook(() => useReminders())

      await act(async () => {
        await result.current.updateReminder(reminderId, updates)
      })

      expect(mockReminderStore.updateReminder).toHaveBeenCalledWith(reminderId, updates)
    })

    it("should handle update errors", async () => {
      const reminderId = "reminder-1"
      const updates = { name: "Updated Reminder" }

      const error = new Error("Update failed")
      mockReminderStore.updateReminder.mockRejectedValueOnce(error)

      const { result } = renderHook(() => useReminders())

      await act(async () => {
        await expect(result.current.updateReminder(reminderId, updates)).rejects.toThrow(
          "Update failed",
        )
      })
    })
  })

  describe("deleteReminder", () => {
    it("should delete a reminder", async () => {
      const reminderId = "reminder-1"

      mockReminderStore.deleteReminder.mockResolvedValueOnce(undefined)

      const { result } = renderHook(() => useReminders())

      await act(async () => {
        await result.current.deleteReminder(reminderId)
      })

      expect(mockReminderStore.deleteReminder).toHaveBeenCalledWith(reminderId)
    })

    it("should handle deletion errors", async () => {
      const reminderId = "reminder-1"

      const error = new Error("Deletion failed")
      mockReminderStore.deleteReminder.mockRejectedValueOnce(error)

      const { result } = renderHook(() => useReminders())

      await act(async () => {
        await expect(result.current.deleteReminder(reminderId)).rejects.toThrow("Deletion failed")
      })
    })
  })

  describe("toggleReminder", () => {
    it("should toggle reminder enabled state", async () => {
      const reminderId = "reminder-1"

      mockReminderStore.toggleReminder.mockResolvedValueOnce(undefined)

      const { result } = renderHook(() => useReminders())

      await act(async () => {
        await result.current.toggleReminder(reminderId)
      })

      expect(mockReminderStore.toggleReminder).toHaveBeenCalledWith(reminderId)
    })

    it("should handle toggle errors", async () => {
      const reminderId = "reminder-1"

      const error = new Error("Toggle failed")
      mockReminderStore.toggleReminder.mockRejectedValueOnce(error)

      const { result } = renderHook(() => useReminders())

      await act(async () => {
        await expect(result.current.toggleReminder(reminderId)).rejects.toThrow("Toggle failed")
      })
    })
  })

  describe("location change rescheduling", () => {
    it("should reschedule reminders when location changes", () => {
      const newLocation = { ...mockLocation, city: "Mumbai" }

      // Update mock data store
      useStores.mockReturnValue({
        reminderStore: mockReminderStore,
        dataStore: {
          currentLocation: newLocation,
          currentLocationLoaded: true,
        },
      })

      renderHook(() => useReminders())

      expect(mockReminderStore.rescheduleAllReminders).toHaveBeenCalledWith(newLocation)
    })

    it("should not reschedule when location is not loaded", () => {
      useStores.mockReturnValue({
        reminderStore: mockReminderStore,
        dataStore: {
          currentLocation: mockLocation,
          currentLocationLoaded: false,
        },
      })

      renderHook(() => useReminders())

      expect(mockReminderStore.rescheduleAllReminders).not.toHaveBeenCalled()
    })

    it("should not reschedule when reminders are not loaded", () => {
      const reminderStoreNotLoaded = {
        ...mockReminderStore,
        isLoaded: false,
      }

      useStores.mockReturnValue({
        reminderStore: reminderStoreNotLoaded,
        dataStore: {
          currentLocation: mockLocation,
          currentLocationLoaded: true,
        },
      })

      renderHook(() => useReminders())

      expect(mockReminderStore.rescheduleAllReminders).not.toHaveBeenCalled()
    })
  })

  describe("store methods delegation", () => {
    it("should delegate getRemindersForPrayerTime to store", () => {
      const mockReminders = [createMockReminder()]
      mockReminderStore.getRemindersForPrayerTime.mockReturnValueOnce(mockReminders)

      const { result } = renderHook(() => useReminders())

      const prayerTimeReminders = result.current.getRemindersForPrayerTime("fajr")

      expect(mockReminderStore.getRemindersForPrayerTime).toHaveBeenCalledWith("fajr")
      expect(prayerTimeReminders).toEqual(mockReminders)
    })

    it("should return store properties directly", () => {
      const mockReminders = [createMockReminder()]
      const mockEnabledReminders = [createMockReminder()]
      const mockRemindersByPrayerTime = { fajr: [createMockReminder()] }

      useStores.mockReturnValue({
        reminderStore: {
          ...mockReminderStore,
          reminders: mockReminders,
          enabledReminders: mockEnabledReminders,
          remindersByPrayerTime: mockRemindersByPrayerTime,
          isLoaded: true,
        },
        dataStore: mockDataStore,
      })

      const { result } = renderHook(() => useReminders())

      expect(result.current.reminders).toEqual(mockReminders)
      expect(result.current.enabledReminders).toEqual(mockEnabledReminders)
      expect(result.current.remindersByPrayerTime).toEqual(mockRemindersByPrayerTime)
      expect(result.current.isLoaded).toBe(true)
    })
  })

  describe("error handling", () => {
    it("should handle store errors gracefully", async () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {})

      const reminderData = {
        name: "Test Reminder",
        prayerTime: "fajr" as const,
        offsetMinutes: 0,
        repeatType: "daily" as const,
        customDays: [],
      }

      mockReminderStore.addReminder.mockRejectedValueOnce(new Error("Store error"))

      const { result } = renderHook(() => useReminders())

      await act(async () => {
        try {
          await result.current.createReminder(reminderData)
        } catch (error) {
          // Expected to throw
        }
      })

      expect(consoleSpy).toHaveBeenCalled()
      consoleSpy.mockRestore()
    })
  })
})
