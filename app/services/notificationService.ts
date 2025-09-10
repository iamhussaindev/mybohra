import { Platform, PermissionsAndroid } from "react-native"
import PushNotification, { Importance } from "react-native-push-notification"

export interface PrayerReminderNotification {
  id: string
  title: string
  body: string
  triggerTime: number
  repeatType: "daily" | "weekly" | "monthly" | "never"
  customDays?: number[]
}

// Configure push notifications
PushNotification.configure({
  onRegister: function (token) {
    console.log("TOKEN:", token)
  },

  onNotification: function (notification) {
    console.log("NOTIFICATION:", notification)
  },

  onAction: function (notification) {
    console.log("ACTION:", notification.action)
    console.log("NOTIFICATION:", notification)
  },

  onRegistrationError: function (err) {
    console.error(err.message, err)
  },

  permissions: {
    alert: true,
    badge: true,
    sound: true,
  },

  popInitialNotification: true,
  requestPermissions: Platform.OS === "ios",
})

// Create notification channel for Android
PushNotification.createChannel(
  {
    channelId: "prayer-reminders",
    channelName: "Prayer Reminders",
    channelDescription: "Notifications for prayer times",
    playSound: true,
    soundName: "default",
    importance: Importance.HIGH,
    vibrate: true,
  },
  (created) => console.log(`createChannel returned '${created}'`),
)

export const requestNotificationPermissions = async (): Promise<boolean> => {
  if (Platform.OS === "android") {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        {
          title: "Prayer Reminder Permissions",
          message: "This app needs notification permissions to remind you about prayer times.",
          buttonNeutral: "Ask Me Later",
          buttonNegative: "Cancel",
          buttonPositive: "OK",
        },
      )
      return granted === PermissionsAndroid.RESULTS.GRANTED
    } catch (err) {
      console.warn(err)
      return false
    }
  }
  return true // iOS permissions are handled automatically
}

export const schedulePrayerReminder = async (
  notification: PrayerReminderNotification,
): Promise<void> => {
  try {
    const hasPermission = await requestNotificationPermissions()
    if (!hasPermission) {
      console.warn("Notification permission not granted")
      return
    }

    const triggerDate = new Date(notification.triggerTime)

    // Calculate repeat interval based on repeat type
    let repeatType: string | undefined
    let repeatTime: number | undefined

    switch (notification.repeatType) {
      case "daily":
        repeatType = "day"
        repeatTime = 24 * 60 * 60 * 1000 // 24 hours in milliseconds
        break
      case "weekly":
        repeatType = "week"
        repeatTime = 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
        break
      case "monthly":
        repeatType = "month"
        break
      case "never":
        repeatType = undefined
        break
    }

    PushNotification.localNotificationSchedule({
      id: notification.id,
      title: notification.title,
      message: notification.body,
      date: triggerDate,
      repeatType: repeatType as any,
      repeatTime: repeatTime,
      soundName: "default",
      vibrate: true,
      vibration: 300,
      priority: "high",
      importance: "high",
      channelId: "prayer-reminders",
      userInfo: {
        id: notification.id,
        repeatType: notification.repeatType,
        customDays: notification.customDays,
      },
    })

    console.log(`Scheduled reminder: ${notification.title} for ${triggerDate.toISOString()}`)
  } catch (error) {
    console.error("Error scheduling prayer reminder:", error)
  }
}

export const cancelNotification = async (id: string): Promise<void> => {
  try {
    PushNotification.cancelLocalNotifications({ id })
    console.log(`Cancelled notification: ${id}`)
  } catch (error) {
    console.error("Error cancelling notification:", error)
  }
}

export const cancelAllNotifications = async (): Promise<void> => {
  try {
    PushNotification.cancelAllLocalNotifications()
    console.log("Cancelled all notifications")
  } catch (error) {
    console.error("Error cancelling all notifications:", error)
  }
}

export const getScheduledNotifications = async (): Promise<any[]> => {
  return new Promise((resolve) => {
    PushNotification.getScheduledLocalNotifications((notifications) => {
      resolve(notifications || [])
    })
  })
}

export const clearNotificationBadge = (): void => {
  PushNotification.setApplicationIconBadgeNumber(0)
}

export const setNotificationBadge = (count: number): void => {
  PushNotification.setApplicationIconBadgeNumber(count)
}
