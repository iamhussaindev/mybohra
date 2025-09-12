import { reminderDataBodies, reminderDataNames } from "app/data/reminderData"
import { NamazTimes } from "app/helpers/namaz.helper"
import { schedulePrayerReminder, cancelNotification } from "app/services/notificationService"
import { PlainLocation } from "app/types/location"
import { momentTime } from "app/utils/currentTime"
import * as storage from "app/utils/storage"
import { types, flow, Instance, SnapshotOut } from "mobx-state-tree"
import { NativeModules } from "react-native"

export const ReminderModel = types.model("ReminderModel", {
  id: types.identifier,
  name: types.string,
  prayerTime: types.enumeration("PrayerTime", [
    "fajr",
    "zawaal",
    "zohar",
    "asar",
    "sihori",
    "maghrib_safe",
    "nisful_layl",
  ]),
  offsetMinutes: types.optional(types.number, 0), // -30 for 30 minutes before, +15 for 15 minutes after
  isEnabled: types.optional(types.boolean, true),
  repeatType: types.enumeration("RepeatType", ["daily", "weekly", "monthly", "never"]),
  customDays: types.optional(types.array(types.number), []), // 0=Sunday, 1=Monday, etc. for weekly repeat
  location: types.frozen<PlainLocation>(), // Store location when reminder was created
  createdAt: types.optional(types.number, () => Date.now()),
  lastTriggered: types.maybeNull(types.number),
  nextTriggerTime: types.maybeNull(types.number),
  notificationType: types.optional(
    types.enumeration("NotificationType", ["short", "long"]),
    "short",
  ),
})

export const ReminderStoreModel = types
  .model("ReminderStore", {
    reminders: types.optional(types.array(ReminderModel), []),
    isLoaded: types.optional(types.boolean, false),
  })
  .actions((self) => ({
    // Helper function to calculate distance between two coordinates
    calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
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
    },

    scheduleReminder: flow(function* (reminder: Instance<typeof ReminderModel>) {
      if (!reminder.isEnabled) return

      try {
        // Calculate next trigger time
        const currentDate = momentTime()
        const dateString = currentDate.toISOString()

        const nextTriggerTime = yield new Promise((resolve) => {
          NativeModules.SalaatTimes.getPrayerTimes(
            reminder.location.latitude,
            reminder.location.longitude,
            dateString,
            (times: NamazTimes) => {
              const prayerTime = times[reminder.prayerTime as keyof NamazTimes]
              if (!prayerTime) {
                resolve(null)
                return
              }

              const [hours, minutes] = prayerTime.split(":").map((t) => parseInt(t))
              const triggerTime = momentTime()
                .hour(hours)
                .minute(minutes)
                .second(0)
                .millisecond(0)
                .add(reminder.offsetMinutes, "minutes")

              // If the time has passed today, move to next occurrence based on repeat type
              if (triggerTime.isBefore(currentDate)) {
                switch (reminder.repeatType) {
                  case "daily":
                    triggerTime.add(1, "day")
                    break
                  case "weekly":
                    if (reminder.customDays.length > 0) {
                      const currentDay = currentDate.day()
                      const nextDay =
                        reminder.customDays.find((day) => day > currentDay) ||
                        reminder.customDays[0]
                      const daysToAdd =
                        nextDay > currentDay ? nextDay - currentDay : 7 - currentDay + nextDay
                      triggerTime.add(daysToAdd, "days")
                    } else {
                      triggerTime.add(1, "week")
                    }
                    break
                  case "monthly":
                    triggerTime.add(1, "month")
                    break
                  case "never":
                    resolve(null)
                    return
                }
              }

              resolve(triggerTime.valueOf())
            },
          )
        })

        if (nextTriggerTime) {
          reminder.nextTriggerTime = nextTriggerTime
          yield schedulePrayerReminder({
            id: reminder.id,
            title: reminderDataNames[reminder.prayerTime as keyof typeof reminderDataNames],
            body: reminderDataBodies[reminder.prayerTime as keyof typeof reminderDataBodies],
            triggerTime: nextTriggerTime,
            repeatType: reminder.repeatType as "daily" | "weekly" | "monthly" | "never",
            customDays: reminder.customDays.slice(),
            notificationType: reminder.notificationType as "short" | "long",
          })
        }
      } catch (error) {
        console.error("Error scheduling reminder:", error)
      }
    }),

    addReminder: flow(function* (reminderData: {
      name: string
      prayerTime: keyof NamazTimes
      offsetMinutes?: number
      repeatType?: "daily" | "weekly" | "monthly" | "never"
      customDays?: number[]
      location: PlainLocation
      notificationType?: "short" | "long"
    }) {
      const id = `reminder_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      const reminder = ReminderModel.create({
        id,
        name: reminderData.name,
        prayerTime: reminderData.prayerTime,
        offsetMinutes: reminderData.offsetMinutes || 0,
        repeatType: reminderData.repeatType || "daily",
        customDays: reminderData.customDays || [],
        location: reminderData.location,
        createdAt: Date.now(),
        notificationType: reminderData.notificationType || "short",
      })

      self.reminders.push(reminder)

      // Save reminders
      try {
        const remindersData = self.reminders.map((r) => ({
          id: r.id,
          name: r.name,
          prayerTime: r.prayerTime,
          offsetMinutes: r.offsetMinutes,
          isEnabled: r.isEnabled,
          repeatType: r.repeatType,
          customDays: r.customDays,
          location: r.location,
          createdAt: r.createdAt,
          lastTriggered: r.lastTriggered,
          nextTriggerTime: r.nextTriggerTime,
        }))
        yield storage.save("REMINDERS", remindersData)
      } catch (error) {
        console.error("Error saving reminders:", error)
      }

      // Schedule reminder inline
      if (reminder.isEnabled) {
        try {
          const currentDate = momentTime()
          const dateString = currentDate.toISOString()

          const nextTriggerTime = yield new Promise((resolve) => {
            NativeModules.SalaatTimes.getPrayerTimes(
              reminder.location.latitude,
              reminder.location.longitude,
              dateString,
              (times: NamazTimes) => {
                const prayerTime = times[reminder.prayerTime as keyof NamazTimes]
                if (!prayerTime) {
                  resolve(null)
                  return
                }

                const [hours, minutes] = prayerTime.split(":").map((t) => parseInt(t))
                const triggerTime = momentTime()
                  .hour(hours)
                  .minute(minutes)
                  .second(0)
                  .millisecond(0)

                // Next line is for testing a reminder notification immediately
                // const triggerTime = momentTime().add(30, "second")

                if (triggerTime.isBefore(currentDate)) {
                  switch (reminder.repeatType) {
                    case "daily":
                      triggerTime.add(1, "day")
                      break
                    case "weekly":
                      if (reminder.customDays.length > 0) {
                        const currentDay = currentDate.day()
                        const nextDay =
                          reminder.customDays.find((day) => day > currentDay) ||
                          reminder.customDays[0]
                        const daysToAdd =
                          nextDay > currentDay ? nextDay - currentDay : 7 - currentDay + nextDay
                        triggerTime.add(daysToAdd, "days")
                      } else {
                        triggerTime.add(1, "week")
                      }
                      break
                    case "monthly":
                      triggerTime.add(1, "month")
                      break
                    case "never":
                      resolve(null)
                      return
                  }
                }

                resolve(triggerTime.valueOf())
              },
            )
          })

          if (nextTriggerTime) {
            reminder.nextTriggerTime = nextTriggerTime
            yield schedulePrayerReminder({
              id: reminder.id,
              title: reminderDataNames[reminder.prayerTime as keyof typeof reminderDataNames],
              body: reminderDataBodies[reminder.prayerTime as keyof typeof reminderDataBodies],
              triggerTime: nextTriggerTime,
              repeatType: reminder.repeatType as "daily" | "weekly" | "monthly" | "never",
              customDays: reminder.customDays.slice(),
              notificationType: reminder.notificationType as "short" | "long",
            })
          }
        } catch (error) {
          console.error("Error scheduling reminder:", error)
        }
      }
    }),

    updateReminder: flow(function* (
      id: string,
      updates: Partial<{
        name: string
        prayerTime: keyof NamazTimes
        offsetMinutes: number
        isEnabled: boolean
        repeatType: "daily" | "weekly" | "monthly" | "never"
        customDays: number[]
      }>,
    ) {
      const reminder = self.reminders.find((r) => r.id === id)
      if (reminder) {
        Object.assign(reminder, updates)

        // Save reminders
        try {
          const remindersData = self.reminders.map((r) => ({
            id: r.id,
            name: r.name,
            prayerTime: r.prayerTime,
            offsetMinutes: r.offsetMinutes,
            isEnabled: r.isEnabled,
            repeatType: r.repeatType,
            customDays: r.customDays,
            location: r.location,
            createdAt: r.createdAt,
            lastTriggered: r.lastTriggered,
            nextTriggerTime: r.nextTriggerTime,
          }))
          yield storage.save("REMINDERS", remindersData)
        } catch (error) {
          console.error("Error saving reminders:", error)
        }

        // Schedule reminder inline
        if (reminder.isEnabled) {
          try {
            const currentDate = momentTime()
            const dateString = currentDate.toISOString()

            const nextTriggerTime = yield new Promise((resolve) => {
              NativeModules.SalaatTimes.getPrayerTimes(
                reminder.location.latitude,
                reminder.location.longitude,
                dateString,
                (times: NamazTimes) => {
                  const prayerTime = times[reminder.prayerTime as keyof NamazTimes]
                  if (!prayerTime) {
                    resolve(null)
                    return
                  }

                  const [hours, minutes] = prayerTime.split(":").map((t) => parseInt(t))
                  const triggerTime = momentTime()
                    .hour(hours)
                    .minute(minutes)
                    .second(0)
                    .millisecond(0)
                    .add(reminder.offsetMinutes, "minutes")

                  if (triggerTime.isBefore(currentDate)) {
                    switch (reminder.repeatType) {
                      case "daily":
                        triggerTime.add(1, "day")
                        break
                      case "weekly":
                        if (reminder.customDays.length > 0) {
                          const currentDay = currentDate.day()
                          const nextDay =
                            reminder.customDays.find((day) => day > currentDay) ||
                            reminder.customDays[0]
                          const daysToAdd =
                            nextDay > currentDay ? nextDay - currentDay : 7 - currentDay + nextDay
                          triggerTime.add(daysToAdd, "days")
                        } else {
                          triggerTime.add(1, "week")
                        }
                        break
                      case "monthly":
                        triggerTime.add(1, "month")
                        break
                      case "never":
                        resolve(null)
                        return
                    }
                  }

                  resolve(triggerTime.valueOf())
                },
              )
            })

            if (nextTriggerTime) {
              reminder.nextTriggerTime = nextTriggerTime
              yield schedulePrayerReminder({
                id: reminder.id,
                title: reminderDataNames[reminder.prayerTime as keyof typeof reminderDataNames],
                body: reminderDataBodies[reminder.prayerTime as keyof typeof reminderDataBodies],
                triggerTime: nextTriggerTime,
                repeatType: reminder.repeatType as "daily" | "weekly" | "monthly" | "never",
                customDays: reminder.customDays.slice(),
                notificationType: reminder.notificationType as "short" | "long",
              })
            }
          } catch (error) {
            console.error("Error scheduling reminder:", error)
          }
        }
      }
    }),

    deleteReminder: flow(function* (id: string) {
      const index = self.reminders.findIndex((r) => r.id === id)
      if (index !== -1) {
        // Cancel existing notification
        try {
          yield cancelNotification(id)
        } catch (error) {
          console.error("Error canceling reminder notification:", error)
        }

        self.reminders.splice(index, 1)

        // Save reminders
        try {
          const remindersData = self.reminders.map((r) => ({
            id: r.id,
            name: r.name,
            prayerTime: r.prayerTime,
            offsetMinutes: r.offsetMinutes,
            isEnabled: r.isEnabled,
            repeatType: r.repeatType,
            customDays: r.customDays,
            location: r.location,
            createdAt: r.createdAt,
            lastTriggered: r.lastTriggered,
            nextTriggerTime: r.nextTriggerTime,
          }))
          yield storage.save("REMINDERS", remindersData)
        } catch (error) {
          console.error("Error saving reminders:", error)
        }
      }
    }),

    toggleReminder: flow(function* (id: string) {
      const reminder = self.reminders.find((r) => r.id === id)
      if (reminder) {
        reminder.isEnabled = !reminder.isEnabled

        // Save reminders
        try {
          const remindersData = self.reminders.map((r) => ({
            id: r.id,
            name: r.name,
            prayerTime: r.prayerTime,
            offsetMinutes: r.offsetMinutes,
            isEnabled: r.isEnabled,
            repeatType: r.repeatType,
            customDays: r.customDays,
            location: r.location,
            createdAt: r.createdAt,
            lastTriggered: r.lastTriggered,
            nextTriggerTime: r.nextTriggerTime,
          }))
          yield storage.save("REMINDERS", remindersData)
        } catch (error) {
          console.error("Error saving reminders:", error)
        }

        if (reminder.isEnabled) {
          // Schedule reminder inline
          if (reminder.isEnabled) {
            try {
              const currentDate = momentTime()
              const dateString = currentDate.toISOString()

              const nextTriggerTime = yield new Promise((resolve) => {
                NativeModules.SalaatTimes.getPrayerTimes(
                  reminder.location.latitude,
                  reminder.location.longitude,
                  dateString,
                  (times: NamazTimes) => {
                    const prayerTime = times[reminder.prayerTime as keyof NamazTimes]
                    if (!prayerTime) {
                      resolve(null)
                      return
                    }

                    const [hours, minutes] = prayerTime.split(":").map((t) => parseInt(t))
                    const triggerTime = momentTime()
                      .hour(hours)
                      .minute(minutes)
                      .second(0)
                      .millisecond(0)
                      .add(reminder.offsetMinutes, "minutes")

                    if (triggerTime.isBefore(currentDate)) {
                      switch (reminder.repeatType) {
                        case "daily":
                          triggerTime.add(1, "day")
                          break
                        case "weekly":
                          if (reminder.customDays.length > 0) {
                            const currentDay = currentDate.day()
                            const nextDay =
                              reminder.customDays.find((day) => day > currentDay) ||
                              reminder.customDays[0]
                            const daysToAdd =
                              nextDay > currentDay ? nextDay - currentDay : 7 - currentDay + nextDay
                            triggerTime.add(daysToAdd, "days")
                          } else {
                            triggerTime.add(1, "week")
                          }
                          break
                        case "monthly":
                          triggerTime.add(1, "month")
                          break
                        case "never":
                          resolve(null)
                          return
                      }
                    }

                    resolve(triggerTime.valueOf())
                  },
                )
              })

              if (nextTriggerTime) {
                reminder.nextTriggerTime = nextTriggerTime
                yield schedulePrayerReminder({
                  id: reminder.id,
                  title: reminderDataNames[reminder.prayerTime as keyof typeof reminderDataNames],
                  body: reminderDataBodies[reminder.prayerTime as keyof typeof reminderDataBodies],
                  triggerTime: nextTriggerTime,
                  repeatType: reminder.repeatType as "daily" | "weekly" | "monthly" | "never",
                  customDays: reminder.customDays.slice(),
                  notificationType: reminder.notificationType as "short" | "long",
                })
              }
            } catch (error) {
              console.error("Error scheduling reminder:", error)
            }
          }
        } else {
          try {
            const { cancelNotification } = require("app/services/notificationService")
            yield cancelNotification(id)
          } catch (error) {
            console.error("Error canceling reminder notification:", error)
          }
        }
      }
    }),

    cancelReminderNotification: flow(function* (id: string) {
      try {
        yield cancelNotification(id)
      } catch (error) {
        console.error("Error canceling reminder notification:", error)
      }
    }),

    rescheduleAllReminders: flow(function* (currentLocation: PlainLocation) {
      // Reschedule all reminders when location changes
      for (const reminder of self.reminders) {
        if (reminder.isEnabled) {
          // Update location if it's significantly different
          // Calculate distance inline
          const R = 6371 // Earth's radius in kilometers
          const dLat = (currentLocation.latitude - reminder.location.latitude) * (Math.PI / 180)
          const dLon = (currentLocation.longitude - reminder.location.longitude) * (Math.PI / 180)
          const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(reminder.location.latitude * (Math.PI / 180)) *
              Math.cos(currentLocation.latitude * (Math.PI / 180)) *
              Math.sin(dLon / 2) *
              Math.sin(dLon / 2)
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
          const distance = R * c

          if (distance > 10) {
            // 10km threshold
            reminder.location = currentLocation
          }

          // Schedule reminder inline
          if (reminder.isEnabled) {
            try {
              const currentDate = momentTime()
              const dateString = currentDate.toISOString()

              const nextTriggerTime = yield new Promise((resolve) => {
                NativeModules.SalaatTimes.getPrayerTimes(
                  reminder.location.latitude,
                  reminder.location.longitude,
                  dateString,
                  (times: NamazTimes) => {
                    const prayerTime = times[reminder.prayerTime as keyof NamazTimes]
                    if (!prayerTime) {
                      resolve(null)
                      return
                    }

                    const [hours, minutes] = prayerTime.split(":").map((t) => parseInt(t))
                    const triggerTime = momentTime()
                      .hour(hours)
                      .minute(minutes)
                      .second(0)
                      .millisecond(0)
                      .add(reminder.offsetMinutes, "minutes")

                    if (triggerTime.isBefore(currentDate)) {
                      switch (reminder.repeatType) {
                        case "daily":
                          triggerTime.add(1, "day")
                          break
                        case "weekly":
                          if (reminder.customDays.length > 0) {
                            const currentDay = currentDate.day()
                            const nextDay =
                              reminder.customDays.find((day) => day > currentDay) ||
                              reminder.customDays[0]
                            const daysToAdd =
                              nextDay > currentDay ? nextDay - currentDay : 7 - currentDay + nextDay
                            triggerTime.add(daysToAdd, "days")
                          } else {
                            triggerTime.add(1, "week")
                          }
                          break
                        case "monthly":
                          triggerTime.add(1, "month")
                          break
                        case "never":
                          resolve(null)
                          return
                      }
                    }

                    resolve(triggerTime.valueOf())
                  },
                )
              })

              if (nextTriggerTime) {
                reminder.nextTriggerTime = nextTriggerTime
                yield schedulePrayerReminder({
                  id: reminder.id,
                  title: reminderDataNames[reminder.prayerTime as keyof typeof reminderDataNames],
                  body: reminderDataBodies[reminder.prayerTime as keyof typeof reminderDataBodies],
                  triggerTime: nextTriggerTime,
                  repeatType: reminder.repeatType as "daily" | "weekly" | "monthly" | "never",
                  customDays: reminder.customDays.slice(),
                  notificationType: reminder.notificationType as "short" | "long",
                })
              }
            } catch (error) {
              console.error("Error scheduling reminder:", error)
            }
          }
        }
      }

      // Save reminders
      try {
        const remindersData = self.reminders.map((r) => ({
          id: r.id,
          name: r.name,
          prayerTime: r.prayerTime,
          offsetMinutes: r.offsetMinutes,
          isEnabled: r.isEnabled,
          repeatType: r.repeatType,
          customDays: r.customDays,
          location: r.location,
          createdAt: r.createdAt,
          lastTriggered: r.lastTriggered,
          nextTriggerTime: r.nextTriggerTime,
        }))
        yield storage.save("REMINDERS", remindersData)
      } catch (error) {
        console.error("Error saving reminders:", error)
      }
    }),

    loadReminders: flow(function* () {
      try {
        const savedReminders = yield storage.load("REMINDERS")
        if (savedReminders && Array.isArray(savedReminders)) {
          self.reminders.replace(savedReminders)
        }
        self.isLoaded = true
      } catch (error) {
        console.error("Error loading reminders:", error)
        self.isLoaded = true
      }
    }),
  }))
  .views((self) => ({
    get enabledReminders() {
      return self.reminders.filter((reminder) => reminder.isEnabled)
    },

    get remindersByPrayerTime() {
      const grouped: Record<string, Instance<typeof ReminderModel>[]> = {}
      self.reminders.forEach((reminder) => {
        if (!grouped[reminder.prayerTime]) {
          grouped[reminder.prayerTime] = []
        }
        grouped[reminder.prayerTime].push(reminder)
      })
      return grouped
    },

    getRemindersForPrayerTime(prayerTime: keyof NamazTimes) {
      return self.reminders.filter(
        (reminder) => reminder.prayerTime === prayerTime && reminder.isEnabled,
      )
    },
  }))

export interface ReminderStore extends Instance<typeof ReminderStoreModel> {}
export interface ReminderStoreSnapshot extends SnapshotOut<typeof ReminderStoreModel> {}
export interface IReminder extends Instance<typeof ReminderModel> {}
