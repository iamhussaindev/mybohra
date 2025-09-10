import { NamazTimes } from "app/helpers/namaz.helper"
import { useStores } from "app/models"
import { PlainLocation } from "app/types/location"
import { useEffect, useCallback } from "react"

export interface CreateReminderData {
  name: string
  prayerTime: keyof NamazTimes
  offsetMinutes?: number
  repeatType?: "daily" | "weekly" | "monthly" | "never"
  customDays?: number[]
}

export function useReminders() {
  const { reminderStore, dataStore } = useStores()

  // Load reminders on mount
  useEffect(() => {
    if (!reminderStore.isLoaded) {
      reminderStore.loadReminders()
    }
  }, [reminderStore])

  // Reschedule reminders when location changes
  useEffect(() => {
    if (dataStore.currentLocationLoaded && reminderStore.isLoaded) {
      reminderStore.rescheduleAllReminders({
        latitude: dataStore.currentLocation.latitude,
        longitude: dataStore.currentLocation.longitude,
        city: dataStore.currentLocation.city,
        country: dataStore.currentLocation.country,
        state: dataStore.currentLocation.state,
        timezone: dataStore.currentLocation.timezone,
        type: dataStore.currentLocation.type,
      })
    }
  }, [
    dataStore.currentLocation.latitude,
    dataStore.currentLocation.longitude,
    dataStore.currentLocationLoaded,
    reminderStore.isLoaded,
  ])

  const createReminder = useCallback(
    async (reminderData: CreateReminderData) => {
      // avoid duplicate reminders
      const existingReminder = reminderStore.reminders.find(
        (reminder) =>
          reminder.name === reminderData.name && reminder.prayerTime === reminderData.prayerTime,
      )
      if (existingReminder) {
        return
      }

      const location: PlainLocation = {
        latitude: dataStore.currentLocation.latitude,
        longitude: dataStore.currentLocation.longitude,
        city: dataStore.currentLocation.city,
        country: dataStore.currentLocation.country,
        state: dataStore.currentLocation.state,
        timezone: dataStore.currentLocation.timezone,
        type: dataStore.currentLocation.type,
      }

      await reminderStore.addReminder({
        ...reminderData,
        location,
      })
    },
    [reminderStore, dataStore.currentLocation],
  )

  const updateReminder = useCallback(
    async (id: string, updates: Partial<CreateReminderData>) => {
      await reminderStore.updateReminder(id, updates)
    },
    [reminderStore],
  )

  const deleteReminder = useCallback(
    async (id: string) => {
      await reminderStore.deleteReminder(id)
    },
    [reminderStore],
  )

  const toggleReminder = useCallback(
    async (id: string) => {
      await reminderStore.toggleReminder(id)
    },
    [reminderStore],
  )

  return {
    reminders: reminderStore.reminders,
    enabledReminders: reminderStore.enabledReminders,
    remindersByPrayerTime: reminderStore.remindersByPrayerTime,
    isLoaded: reminderStore.isLoaded,
    createReminder,
    updateReminder,
    deleteReminder,
    toggleReminder,
    getRemindersForPrayerTime: reminderStore.getRemindersForPrayerTime,
  }
}
