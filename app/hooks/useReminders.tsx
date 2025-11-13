import { REMINDER_DEBUG_MODE } from "app/constants/debug"
import { NamazTimes } from "app/helpers/namaz.helper"
import { useStores } from "app/models"
import { PlainLocation } from "app/types/location"
import { useCallback, useEffect, useRef } from "react"
import { Alert } from "react-native"

export interface CreateReminderData {
  name: string
  prayerTime: keyof NamazTimes
  offsetMinutes?: number
  repeatType?: "daily" | "weekly" | "monthly" | "never"
  customDays?: number[]
  notificationType?: "short" | "long"
}

export function useReminders() {
  const { reminderStore, dataStore } = useStores()

  // Track location version to show debug alerts exactly once per change
  const lastLocationVersionRef = useRef<number>(dataStore.currentLocationVersion)

  // Load reminders on mount
  useEffect(() => {
    if (!reminderStore.isLoaded) {
      reminderStore.loadReminders()
    }
  }, [reminderStore])

  // Reschedule reminders when location changes
  useEffect(() => {
    if (!dataStore.currentLocationLoaded || !reminderStore.isLoaded) {
      return
    }

    if (lastLocationVersionRef.current === dataStore.currentLocationVersion) {
      return
    }

    lastLocationVersionRef.current = dataStore.currentLocationVersion

    reminderStore
      .rescheduleAllReminders({
        latitude: dataStore.currentLocation.latitude,
        longitude: dataStore.currentLocation.longitude,
        city: dataStore.currentLocation.city,
        country: dataStore.currentLocation.country,
        state: dataStore.currentLocation.state,
        timezone: dataStore.currentLocation.timezone,
        type: dataStore.currentLocation.type,
      })
      .then(() => {
        if (REMINDER_DEBUG_MODE) {
          Alert.alert(
            "Reminders Updated",
            `Location changed to ${dataStore.currentLocation.city}. Reminders rescheduled.`,
          )
        }
      })
      .catch((error) => {
        console.warn("Error rescheduling reminders after location change:", error)
      })
  }, [
    dataStore.currentLocation.latitude,
    dataStore.currentLocation.longitude,
    dataStore.currentLocationVersion,
    dataStore.currentLocationLoaded,
    reminderStore.isLoaded,
  ])

  useEffect(() => {
    if (reminderStore.isLoaded && dataStore.currentLocationLoaded) {
      reminderStore.ensureFutureSchedules()
    }
  }, [reminderStore, reminderStore.isLoaded, dataStore.currentLocationLoaded])

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
