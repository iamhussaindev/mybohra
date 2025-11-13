import { REMINDER_DEBUG_MODE, REMINDER_DEBUG_TEST_DELAY_SECONDS } from "app/constants/debug"
import { reminderDataBodies, reminderDataNames } from "app/data/reminderData"
import { NamazTimes } from "app/helpers/namaz.helper"
import { schedulePrayerReminder, cancelNotification } from "app/services/notificationService"
import { testReminderService } from "app/services/testReminderService"
import { PlainLocation } from "app/types/location"
import { momentTime } from "app/utils/currentTime"
import * as storage from "app/utils/storage"
import { types, flow, Instance, SnapshotOut } from "mobx-state-tree"
import { NativeModules } from "react-native"

const MAX_SCHEDULE_DAYS = 30
const MIN_REMAINING_NOTIFICATIONS = 10

const ScheduledNotificationModel = types.model("ScheduledNotificationModel", {
  id: types.string,
  triggerTime: types.number,
})

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
  scheduledNotifications: types.optional(types.array(ScheduledNotificationModel), []),
})

export const ReminderStoreModel = types
  .model("ReminderStore", {
    reminders: types.optional(types.array(ReminderModel), []),
    isLoaded: types.optional(types.boolean, false),
  })
  .actions((self) => {
    const formatScheduleId = (reminderId: string, targetMoment: ReturnType<typeof momentTime>) =>
      `${reminderId}_${targetMoment.format("YYYYMMDD")}`

    const fetchTriggerTime = (
      reminder: Instance<typeof ReminderModel>,
      targetMoment: ReturnType<typeof momentTime>,
    ): Promise<number | null> => {
      return new Promise((resolve) => {
        NativeModules.SalaatTimes.getPrayerTimes(
          reminder.location.latitude,
          reminder.location.longitude,
          targetMoment.clone().startOf("day").toISOString(),
          (times: NamazTimes) => {
            const prayerTime = times?.[reminder.prayerTime as keyof NamazTimes]
            if (!prayerTime) {
              resolve(null)
              return
            }

            const [hours, minutes] = prayerTime.split(":").map((value) => parseInt(value, 10))
            const triggerMoment = targetMoment
              .clone()
              .hour(hours)
              .minute(minutes)
              .second(0)
              .millisecond(0)
              .add(reminder.offsetMinutes ?? 0, "minutes")

            if (triggerMoment.isBefore(momentTime())) {
              resolve(null)
              return
            }

            resolve(triggerMoment.valueOf())
          },
        )
      })
    }

    const updateNextTriggerTime = (reminder: Instance<typeof ReminderModel>) => {
      const upcoming = reminder.scheduledNotifications
        .map((notification) => notification.triggerTime)
        .filter((triggerTime) => triggerTime > Date.now())
        .sort((a, b) => a - b)[0]

      reminder.nextTriggerTime = upcoming ?? null
    }

    const persistReminders = flow(function* () {
      try {
        const remindersData = self.reminders.map((r) => ({
          id: r.id,
          name: r.name,
          prayerTime: r.prayerTime,
          offsetMinutes: r.offsetMinutes,
          isEnabled: r.isEnabled,
          repeatType: r.repeatType,
          customDays: r.customDays.slice(),
          location: r.location,
          createdAt: r.createdAt,
          lastTriggered: r.lastTriggered,
          nextTriggerTime: r.nextTriggerTime,
          notificationType: r.notificationType,
          scheduledNotifications: r.scheduledNotifications.map((n) => ({
            id: n.id,
            triggerTime: n.triggerTime,
          })),
        }))
        yield storage.save("REMINDERS", remindersData)
      } catch (error) {
        console.error("Error saving reminders:", error)
      }
    })

    const cancelReminderNotifications = flow(function* (reminder: Instance<typeof ReminderModel>) {
      if (reminder.scheduledNotifications.length === 0) return false

      for (const notification of reminder.scheduledNotifications.slice()) {
        try {
          yield cancelNotification(notification.id)
        } catch (error) {
          console.error("Error canceling reminder notification:", error)
        }
      }

      reminder.scheduledNotifications.clear()
      updateNextTriggerTime(reminder)
      return true
    })

    const scheduleReminderBatch = flow(function* (
      reminder: Instance<typeof ReminderModel>,
      options?: { replace?: boolean; startMoment?: ReturnType<typeof momentTime> },
    ) {
      const replace = options?.replace ?? false
      const referenceMoment = options?.startMoment
        ? options.startMoment.clone().startOf("day")
        : reminder.scheduledNotifications.length > 0 && !replace
        ? momentTime(
            new Date(
              reminder.scheduledNotifications[
                reminder.scheduledNotifications.length - 1
              ].triggerTime,
            ),
          )
            .add(1, "day")
            .startOf("day")
        : momentTime().startOf("day")

      if (replace) {
        yield cancelReminderNotifications(reminder)
      }

      const newNotifications: { id: string; triggerTime: number }[] = []
      let dayOffset = 0
      let attempts = 0
      const maxAttempts = MAX_SCHEDULE_DAYS * 3

      while (newNotifications.length < MAX_SCHEDULE_DAYS && attempts < maxAttempts) {
        const targetMoment = referenceMoment.clone().add(dayOffset, "day")
        const notificationId = formatScheduleId(reminder.id, targetMoment)

        const alreadyScheduled =
          replace === false &&
          reminder.scheduledNotifications.some((notification) => notification.id === notificationId)

        if (!alreadyScheduled) {
          const triggerTime: number | null = yield fetchTriggerTime(reminder, targetMoment)
          if (triggerTime) {
            yield schedulePrayerReminder({
              id: notificationId,
              title: reminderDataNames[reminder.prayerTime as keyof typeof reminderDataNames],
              body: reminderDataBodies[reminder.prayerTime as keyof typeof reminderDataBodies],
              triggerTime,
              repeatType: "never",
              notificationType: reminder.notificationType as "short" | "long",
            })

            newNotifications.push({ id: notificationId, triggerTime })
          }
        }

        dayOffset += 1
        attempts += 1
      }

      if (newNotifications.length > 0) {
        if (replace) {
          reminder.scheduledNotifications.replace(newNotifications)
        } else {
          reminder.scheduledNotifications.push(...newNotifications)
        }

        reminder.scheduledNotifications.replace(
          reminder.scheduledNotifications.slice().sort((a, b) => a.triggerTime - b.triggerTime),
        )
        updateNextTriggerTime(reminder)
        return true
      }

      updateNextTriggerTime(reminder)
      return false
    })

    const pruneExpiredNotifications = (reminder: Instance<typeof ReminderModel>) => {
      const now = Date.now()
      const futureNotifications = reminder.scheduledNotifications.filter(
        (notification) => notification.triggerTime > now,
      )

      if (futureNotifications.length !== reminder.scheduledNotifications.length) {
        reminder.scheduledNotifications.replace(futureNotifications)
        updateNextTriggerTime(reminder)
        return true
      }

      updateNextTriggerTime(reminder)
      return false
    }

    const ensureCoverageForReminder = flow(function* (reminder: Instance<typeof ReminderModel>) {
      let changed = pruneExpiredNotifications(reminder)

      if (!reminder.isEnabled) {
        return changed
      }

      if (reminder.scheduledNotifications.length < MIN_REMAINING_NOTIFICATIONS) {
        const lastNotification =
          reminder.scheduledNotifications[reminder.scheduledNotifications.length - 1]

        const startMoment = lastNotification
          ? momentTime(new Date(lastNotification.triggerTime)).add(1, "day").startOf("day")
          : momentTime().startOf("day")

        const scheduled = yield scheduleReminderBatch(reminder, {
          replace: false,
          startMoment,
        })

        if (scheduled) {
          changed = true
        }
      }

      return changed
    })

    const triggerDebugReminder = (reminder: Instance<typeof ReminderModel>) => {
      if (!REMINDER_DEBUG_MODE) return
      const reminderName = reminder.name
      Promise.resolve()
        .then(() =>
          testReminderService.createTestReminder(
            `${reminderName} (Debug)`,
            REMINDER_DEBUG_TEST_DELAY_SECONDS,
          ),
        )
        .catch((error) => {
          console.warn("Error scheduling debug reminder:", error)
        })
    }

    return {
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

        if (reminder.isEnabled) {
          yield scheduleReminderBatch(reminder, { replace: true })
          triggerDebugReminder(reminder)
        }

        yield persistReminders()
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
        if (!reminder) return

        const wasEnabled = reminder.isEnabled
        Object.assign(reminder, updates)

        if (reminder.isEnabled) {
          yield scheduleReminderBatch(reminder, { replace: true })
          if (!wasEnabled) {
            triggerDebugReminder(reminder)
          }
        } else {
          yield cancelReminderNotifications(reminder)
        }

        yield persistReminders()
      }),

      deleteReminder: flow(function* (id: string) {
        const index = self.reminders.findIndex((r) => r.id === id)
        if (index === -1) return

        const reminder = self.reminders[index]
        yield cancelReminderNotifications(reminder)

        self.reminders.splice(index, 1)
        yield persistReminders()
      }),

      toggleReminder: flow(function* (id: string) {
        const reminder = self.reminders.find((r) => r.id === id)
        if (!reminder) return

        reminder.isEnabled = !reminder.isEnabled

        if (reminder.isEnabled) {
          yield scheduleReminderBatch(reminder, { replace: true })
          triggerDebugReminder(reminder)
        } else {
          yield cancelReminderNotifications(reminder)
        }

        yield persistReminders()
      }),

      cancelReminderNotification: flow(function* (id: string) {
        for (const reminder of self.reminders) {
          const idx = reminder.scheduledNotifications.findIndex(
            (notification) => notification.id === id,
          )
          if (idx !== -1) {
            reminder.scheduledNotifications.splice(idx, 1)
            updateNextTriggerTime(reminder)
          }
        }

        try {
          yield cancelNotification(id)
        } catch (error) {
          console.error("Error canceling reminder notification:", error)
        }

        yield persistReminders()
      }),

      rescheduleAllReminders: flow(function* (currentLocation: PlainLocation) {
        for (const reminder of self.reminders) {
          reminder.location = currentLocation
          yield cancelReminderNotifications(reminder)

          if (reminder.isEnabled) {
            yield scheduleReminderBatch(reminder, { replace: true })
            triggerDebugReminder(reminder)
          }
        }

        yield persistReminders()
      }),

      ensureFutureSchedules: flow(function* () {
        let updated = false

        for (const reminder of self.reminders) {
          const changed = yield ensureCoverageForReminder(reminder)
          if (changed) {
            updated = true
          }
        }

        if (updated) {
          yield persistReminders()
        }
      }),

      loadReminders: flow(function* () {
        try {
          const savedReminders = yield storage.load("REMINDERS")
          if (savedReminders && Array.isArray(savedReminders)) {
            const hydrated = savedReminders.map((reminder: any) => ({
              ...reminder,
              scheduledNotifications: reminder.scheduledNotifications ?? [],
            }))
            self.reminders.replace(hydrated)
          }
          self.isLoaded = true
        } catch (error) {
          console.error("Error loading reminders:", error)
          self.isLoaded = true
        }
      }),
    }
  })
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
