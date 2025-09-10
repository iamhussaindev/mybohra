import { getSnapshot, applySnapshot } from "mobx-state-tree"
import { ReminderStoreModel, ReminderModel } from "app/models/ReminderStore"
import { PlainLocation } from "app/types/location"
import { mockLocation, createMockReminder } from "../utils/testUtils"

describe("ReminderStore", () => {
  let store: any

  beforeEach(() => {
    store = ReminderStoreModel.create({
      reminders: [],
      isLoaded: false,
    })
  })

  describe("Initial State", () => {
    it("should have empty reminders array initially", () => {
      expect(store.reminders.length).toBe(0)
    })

    it("should not be loaded initially", () => {
      expect(store.isLoaded).toBe(false)
    })
  })

  describe("addReminder", () => {
    it("should add a new reminder", async () => {
      const reminderData = {
        name: "Test Reminder",
        prayerTime: "fajr" as const,
        offsetMinutes: 0,
        repeatType: "daily" as const,
        customDays: [],
        location: mockLocation,
      }

      await store.addReminder(reminderData)

      expect(store.reminders.length).toBe(1)
      expect(store.reminders[0].name).toBe("Test Reminder")
      expect(store.reminders[0].prayerTime).toBe("fajr")
      expect(store.reminders[0].isEnabled).toBe(true)
    })

    it("should generate unique ID for each reminder", async () => {
      const reminderData = {
        name: "Test Reminder",
        prayerTime: "fajr" as const,
        offsetMinutes: 0,
        repeatType: "daily" as const,
        customDays: [],
        location: mockLocation,
      }

      await store.addReminder(reminderData)
      await store.addReminder({ ...reminderData, name: "Test Reminder 2" })

      expect(store.reminders.length).toBe(2)
      expect(store.reminders[0].id).not.toBe(store.reminders[1].id)
    })

    it("should set nextTriggerTime when adding reminder", async () => {
      const reminderData = {
        name: "Test Reminder",
        prayerTime: "fajr" as const,
        offsetMinutes: 0,
        repeatType: "daily" as const,
        customDays: [],
        location: mockLocation,
      }

      await store.addReminder(reminderData)

      expect(store.reminders[0].nextTriggerTime).toBeDefined()
      expect(store.reminders[0].nextTriggerTime).toBeGreaterThan(Date.now())
    })
  })

  describe("updateReminder", () => {
    beforeEach(async () => {
      const reminderData = {
        name: "Test Reminder",
        prayerTime: "fajr" as const,
        offsetMinutes: 0,
        repeatType: "daily" as const,
        customDays: [],
        location: mockLocation,
      }
      await store.addReminder(reminderData)
    })

    it("should update reminder properties", async () => {
      const reminderId = store.reminders[0].id
      const updates = {
        name: "Updated Reminder",
        offsetMinutes: 5,
      }

      await store.updateReminder(reminderId, updates)

      expect(store.reminders[0].name).toBe("Updated Reminder")
      expect(store.reminders[0].offsetMinutes).toBe(5)
    })

    it("should recalculate nextTriggerTime when prayer time changes", async () => {
      const reminderId = store.reminders[0].id
      const originalTriggerTime = store.reminders[0].nextTriggerTime
      const updates = {
        prayerTime: "zohar" as const,
      }

      await store.updateReminder(reminderId, updates)

      expect(store.reminders[0].prayerTime).toBe("zohar")
      expect(store.reminders[0].nextTriggerTime).not.toBe(originalTriggerTime)
    })

    it("should throw error for non-existent reminder", async () => {
      const updates = { name: "Updated" }

      await expect(store.updateReminder("non-existent-id", updates)).rejects.toThrow()
    })
  })

  describe("deleteReminder", () => {
    beforeEach(async () => {
      const reminderData = {
        name: "Test Reminder",
        prayerTime: "fajr" as const,
        offsetMinutes: 0,
        repeatType: "daily" as const,
        customDays: [],
        location: mockLocation,
      }
      await store.addReminder(reminderData)
    })

    it("should remove reminder from store", async () => {
      const reminderId = store.reminders[0].id

      await store.deleteReminder(reminderId)

      expect(store.reminders.length).toBe(0)
    })

    it("should throw error for non-existent reminder", async () => {
      await expect(store.deleteReminder("non-existent-id")).rejects.toThrow()
    })
  })

  describe("toggleReminder", () => {
    beforeEach(async () => {
      const reminderData = {
        name: "Test Reminder",
        prayerTime: "fajr" as const,
        offsetMinutes: 0,
        repeatType: "daily" as const,
        customDays: [],
        location: mockLocation,
      }
      await store.addReminder(reminderData)
    })

    it("should toggle reminder enabled state", async () => {
      const reminderId = store.reminders[0].id
      const originalState = store.reminders[0].isEnabled

      await store.toggleReminder(reminderId)

      expect(store.reminders[0].isEnabled).toBe(!originalState)
    })

    it("should throw error for non-existent reminder", async () => {
      await expect(store.toggleReminder("non-existent-id")).rejects.toThrow()
    })
  })

  describe("Views", () => {
    beforeEach(async () => {
      const reminders = [
        {
          name: "Fajr Reminder",
          prayerTime: "fajr" as const,
          offsetMinutes: 0,
          repeatType: "daily" as const,
          customDays: [],
          location: mockLocation,
        },
        {
          name: "Zohar Reminder",
          prayerTime: "zohar" as const,
          offsetMinutes: 0,
          repeatType: "daily" as const,
          customDays: [],
          location: mockLocation,
        },
        {
          name: "Disabled Reminder",
          prayerTime: "asar" as const,
          offsetMinutes: 0,
          repeatType: "daily" as const,
          customDays: [],
          location: mockLocation,
        },
      ]

      for (const reminderData of reminders) {
        await store.addReminder(reminderData)
      }

      // Disable the third reminder
      await store.toggleReminder(store.reminders[2].id)
    })

    it("should return reminders by prayer time", () => {
      const fajrReminders = store.getRemindersForPrayerTime("fajr")
      expect(fajrReminders.length).toBe(1)
      expect(fajrReminders[0].name).toBe("Fajr Reminder")

      const zoharReminders = store.getRemindersForPrayerTime("zohar")
      expect(zoharReminders.length).toBe(1)
      expect(zoharReminders[0].name).toBe("Zohar Reminder")
    })

    it("should return only enabled reminders", () => {
      const enabledReminders = store.enabledReminders
      expect(enabledReminders.length).toBe(2)
      expect(enabledReminders.every((r: any) => r.isEnabled)).toBe(true)
    })

    it("should group reminders by prayer time", () => {
      const groupedReminders = store.remindersByPrayerTime
      expect(groupedReminders.fajr).toBeDefined()
      expect(groupedReminders.zohar).toBeDefined()
      expect(groupedReminders.asar).toBeDefined()
      expect(groupedReminders.fajr.length).toBe(1)
      expect(groupedReminders.zohar.length).toBe(1)
      expect(groupedReminders.asar.length).toBe(1)
    })
  })

  describe("rescheduleAllReminders", () => {
    beforeEach(async () => {
      const reminderData = {
        name: "Test Reminder",
        prayerTime: "fajr" as const,
        offsetMinutes: 0,
        repeatType: "daily" as const,
        customDays: [],
        location: mockLocation,
      }
      await store.addReminder(reminderData)
    })

    it("should reschedule all enabled reminders for new location", async () => {
      const newLocation: PlainLocation = {
        ...mockLocation,
        latitude: 19.076,
        longitude: 72.8777,
        city: "Mumbai",
      }

      const originalTriggerTime = store.reminders[0].nextTriggerTime

      await store.rescheduleAllReminders(newLocation)

      // Should recalculate trigger time for new location
      expect(store.reminders[0].nextTriggerTime).not.toBe(originalTriggerTime)
    })

    it("should not reschedule disabled reminders", async () => {
      const reminderId = store.reminders[0].id
      await store.toggleReminder(reminderId)

      const newLocation: PlainLocation = {
        ...mockLocation,
        latitude: 19.076,
        longitude: 72.8777,
        city: "Mumbai",
      }

      const originalTriggerTime = store.reminders[0].nextTriggerTime

      await store.rescheduleAllReminders(newLocation)

      // Should not change trigger time for disabled reminder
      expect(store.reminders[0].nextTriggerTime).toBe(originalTriggerTime)
    })
  })

  describe("calculateDistance", () => {
    it("should calculate distance between two points", () => {
      const point1 = { latitude: 23.0225, longitude: 72.5714 }
      const point2 = { latitude: 19.076, longitude: 72.8777 }

      const distance = store.calculateDistance(
        point1.latitude,
        point1.longitude,
        point2.latitude,
        point2.longitude,
      )

      expect(distance).toBeGreaterThan(0)
      expect(typeof distance).toBe("number")
    })

    it("should return 0 for same coordinates", () => {
      const point = { latitude: 23.0225, longitude: 72.5714 }

      const distance = store.calculateDistance(
        point.latitude,
        point.longitude,
        point.latitude,
        point.longitude,
      )

      expect(distance).toBe(0)
    })
  })

  describe("Persistence", () => {
    it("should load reminders from storage", async () => {
      const mockReminders = [createMockReminder(), createMockReminder({ id: "reminder-2" })]

      // Mock storage.load to return reminders
      const mockStorage = require("app/utils/storage")
      mockStorage.load.mockResolvedValueOnce(mockReminders)

      await store.loadReminders()

      expect(store.reminders.length).toBe(2)
      expect(store.isLoaded).toBe(true)
    })

    it("should save reminders to storage", async () => {
      const reminderData = {
        name: "Test Reminder",
        prayerTime: "fajr" as const,
        offsetMinutes: 0,
        repeatType: "daily" as const,
        customDays: [],
        location: mockLocation,
      }

      const mockStorage = require("app/utils/storage")
      mockStorage.save.mockResolvedValueOnce(undefined)

      await store.addReminder(reminderData)

      expect(mockStorage.save).toHaveBeenCalledWith(
        "reminders",
        expect.arrayContaining([expect.objectContaining({ name: "Test Reminder" })]),
      )
    })
  })
})
