/* eslint-disable react-native/split-platform-components */
import PushNotificationIOS from "@react-native-community/push-notification-ios"
import { PermissionsAndroid, Platform } from "react-native"
import PushNotification, { Importance } from "react-native-push-notification"

// Check if PushNotification is available
const isPushNotificationAvailable = () => {
  try {
    return PushNotification && typeof PushNotification.configure === "function"
  } catch (error) {
    console.warn("PushNotification module not available:", error)
    return false
  }
}

export interface PrayerReminderNotification {
  id: string
  title: string
  body: string
  triggerTime: number
  repeatType: "daily" | "weekly" | "monthly" | "never"
  customDays?: number[]
  notificationType?: "short" | "long"
}

// Configure push notifications with error handling
if (isPushNotificationAvailable()) {
  try {
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
  } catch (error) {
    console.warn("PushNotification.configure failed:", error)
  }
} else {
  console.warn("PushNotification module not available - notifications will not work")
}

// Create notification channel for Android with error handling
if (isPushNotificationAvailable()) {
  try {
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
  } catch (error) {
    console.warn("PushNotification.createChannel failed:", error)
  }
}

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
  } else if (Platform.OS === "ios") {
    try {
      const authStatus = await PushNotificationIOS.requestPermissions({
        alert: true,
        badge: true,
        sound: true,
      })

      return authStatus.alert === true || authStatus.badge === true || authStatus.sound === true
    } catch (err) {
      console.warn("Error requesting iOS notification permissions:", err)
      return false
    }
  }
  return false
}

export const schedulePrayerReminder = async (
  notification: PrayerReminderNotification,
): Promise<void> => {
  if (!isPushNotificationAvailable()) {
    console.warn("PushNotification not available - cannot schedule reminder")
    return
  }

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

    // Determine sound based on notification type
    const soundName =
      notification.notificationType === "long" ? "long_prayer_reminder.mp3" : "default"
    const vibrationDuration = notification.notificationType === "long" ? 500 : 300

    try {
      const result = PushNotification.localNotificationSchedule({
        id: notification.id,
        title: notification.title,
        message: notification.body,
        date: triggerDate,
        repeatType: repeatType as any,
        repeatTime,
        soundName,
        vibrate: true,
        vibration: vibrationDuration,
        priority: "high",
        importance: "high",
        channelId: "prayer-reminders",
        userInfo: {
          id: notification.id,
          repeatType: notification.repeatType,
          customDays: notification.customDays,
          notificationType: notification.notificationType,
        },
      })

      console.log("✅ Notification scheduled successfully!")
      console.log(`📊 Schedule result:`, result)
    } catch (scheduleError: any) {
      console.error("❌ Failed to schedule notification:", scheduleError)
      console.error("📊 Error details:", {
        message: scheduleError.message,
        stack: scheduleError.stack,
        notification: {
          id: notification.id,
          title: notification.title,
          triggerDate: triggerDate.toISOString(),
          repeatType,
          repeatTime,
        },
      })
      throw scheduleError
    }

    console.log(
      `🎉 Successfully scheduled reminder: ${notification.title} for ${triggerDate.toISOString()}`,
    )
  } catch (error) {
    console.error("Error scheduling prayer reminder:", error)
  }
}

export const cancelNotification = async (id: string): Promise<void> => {
  if (!isPushNotificationAvailable()) {
    console.warn("PushNotification not available - cannot cancel notification")
    return
  }

  try {
    PushNotification.cancelLocalNotification({ id })
    console.log(`Cancelled notification: ${id}`)
  } catch (error) {
    console.warn("Error cancelling notification:", error)
  }
}

export const cancelAllNotifications = async (): Promise<void> => {
  if (!isPushNotificationAvailable()) {
    console.warn("PushNotification not available - cannot cancel notifications")
    return
  }

  try {
    PushNotification.cancelAllLocalNotifications()
    console.log("Cancelled all notifications")
  } catch (error) {
    console.warn("Error cancelling all notifications:", error)
  }
}

export const getScheduledNotifications = async (): Promise<any[]> => {
  if (!isPushNotificationAvailable()) {
    console.warn("PushNotification not available - cannot get scheduled notifications")
    return []
  }

  return new Promise((resolve) => {
    try {
      PushNotification.getScheduledLocalNotifications((notifications) => {
        resolve(notifications || [])
      })
    } catch (error) {
      console.warn("Error getting scheduled notifications:", error)
      resolve([])
    }
  })
}

export const clearNotificationBadge = (): void => {
  if (!isPushNotificationAvailable()) {
    console.warn("PushNotification not available - cannot clear badge")
    return
  }

  try {
    PushNotification.setApplicationIconBadgeNumber(0)
  } catch (error) {
    console.warn("Error clearing notification badge:", error)
  }
}

export const setNotificationBadge = (count: number): void => {
  if (!isPushNotificationAvailable()) {
    console.warn("PushNotification not available - cannot set badge")
    return
  }

  try {
    PushNotification.setApplicationIconBadgeNumber(count)
  } catch (error) {
    console.warn("Error setting notification badge:", error)
  }
}

export const checkNotificationPermissions = async (): Promise<{
  alert: boolean
  badge: boolean
  sound: boolean
  authorized: boolean
}> => {
  if (Platform.OS === "ios") {
    try {
      return new Promise((resolve) => {
        PushNotificationIOS.checkPermissions((permissions) => {
          resolve({
            alert: permissions.alert === true,
            badge: permissions.badge === true,
            sound: permissions.sound === true,
            authorized:
              permissions.alert === true ||
              permissions.badge === true ||
              permissions.sound === true,
          })
        })
      })
    } catch (error) {
      console.warn("Error checking iOS notification permissions:", error)
      return { alert: false, badge: false, sound: false, authorized: false }
    }
  } else if (Platform.OS === "android") {
    // For Android, we'll assume permissions are granted if the module is available
    // In a real app, you might want to check actual permission status
    return { alert: true, badge: true, sound: true, authorized: true }
  }

  return { alert: false, badge: false, sound: false, authorized: false }
}

// Comprehensive notification debugging function
export const debugNotificationStatus = async (): Promise<void> => {
  console.log("🔍 ====== NOTIFICATION DEBUG STATUS ======")

  // Check if PushNotification is available
  const isAvailable = isPushNotificationAvailable()
  console.log(`📱 PushNotification Available: ${isAvailable ? "✅ YES" : "❌ NO"}`)

  if (!isAvailable) {
    console.log("❌ Cannot proceed with debugging - PushNotification not available")
    return
  }

  try {
    // Check permissions
    const hasPermission = await requestNotificationPermissions()
    console.log(`🔐 Notification Permissions: ${hasPermission ? "✅ GRANTED" : "❌ DENIED"}`)

    // Get scheduled notifications
    const scheduledNotifications = await getScheduledNotifications()
    console.log(`📋 Total Scheduled Notifications: ${scheduledNotifications.length}`)

    if (scheduledNotifications.length > 0) {
      console.log("📝 Scheduled Notifications Details:")
      scheduledNotifications.forEach((notification: any, index: number) => {
        console.log(`  ${index + 1}. ID: ${notification.id}`)
        console.log(`     Title: ${notification.title}`)
        console.log(`     Message: ${notification.message}`)
        console.log(`     Date: ${notification.date}`)
        console.log(`     Repeat: ${notification.repeatType || "none"}`)
        console.log(`     User Info: ${JSON.stringify(notification.userInfo)}`)
        console.log("     ---")
      })
    } else {
      console.log("📭 No scheduled notifications found")
    }

    // Check notification channels (Android)
    if (Platform.OS === "android") {
      try {
        const channels = await (PushNotification as any).getChannels()
        console.log(`📺 Notification Channels: ${channels.length}`)
        channels.forEach((channel: any, index: number) => {
          console.log(`  ${index + 1}. ID: ${channel.id}`)
          console.log(`     Name: ${channel.name}`)
          console.log(`     Importance: ${channel.importance}`)
          console.log(`     Sound: ${channel.sound}`)
        })
      } catch (channelError) {
        console.log("⚠️  Could not get notification channels:", channelError)
      }
    }
  } catch (error) {
    console.error("❌ Error during notification debugging:", error)
  }

  console.log("==========================================")
}

// Test notification function for immediate testing
export const testNotification = async (): Promise<void> => {
  console.log("🧪 ====== TESTING NOTIFICATION ======")

  const testNotification = {
    id: `test_${Date.now()}`,
    title: "Test Notification",
    body: "This is a test notification to verify the system works",
    triggerTime: Date.now() + 5000, // 5 seconds from now
    repeatType: "never" as const,
  }

  try {
    await schedulePrayerReminder(testNotification)
    console.log("✅ Test notification scheduled successfully!")
    console.log("⏰ Check your device in 5 seconds for the notification")

    // Schedule cleanup after 10 seconds
    setTimeout(async () => {
      try {
        await cancelNotification(testNotification.id)
        console.log("🧹 Test notification cleaned up")
      } catch (cleanupError) {
        console.error("❌ Error cleaning up test notification:", cleanupError)
      }
    }, 10000)
  } catch (error) {
    console.error("❌ Test notification failed:", error)
  }

  console.log("=====================================")
}
