/* eslint-disable react-native/split-platform-components */
import PushNotificationIOS from "@react-native-community/push-notification-ios"
import { Platform, PermissionsAndroid } from "react-native"
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

// Create notification channel for test reminders with error handling
if (isPushNotificationAvailable()) {
  try {
    PushNotification.createChannel(
      {
        channelId: "test-reminders",
        channelName: "Test Reminders",
        channelDescription: "Notifications for testing reminder functionality",
        playSound: true,
        soundName: "default",
        importance: Importance.HIGH,
        vibrate: true,
      },
      (created: boolean) => console.log(`Test reminder channel created: '${created}'`),
    )
  } catch (error) {
    console.warn("PushNotification.createChannel failed for test reminders:", error)
  }
} else {
  console.warn("PushNotification module not available - test reminders will not work")
}

// Request notification permissions for test reminders
const requestTestNotificationPermissions = async (): Promise<boolean> => {
  if (Platform.OS === "android") {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        {
          title: "Test Reminder Permissions",
          message: "This app needs notification permissions to test reminder functionality.",
          buttonNeutral: "Ask Me Later",
          buttonNegative: "Cancel",
          buttonPositive: "OK",
        },
      )
      return granted === PermissionsAndroid.RESULTS.GRANTED
    } catch (err) {
      console.warn("Error requesting test notification permissions:", err)
      return false
    }
  } else if (Platform.OS === "ios") {
    try {
      const authStatus = await PushNotificationIOS.requestPermissions({
        alert: true,
        badge: true,
        sound: true,
      })

      console.log("iOS test notification permission status:", authStatus)
      return authStatus.alert === true || authStatus.badge === true || authStatus.sound === true
    } catch (err) {
      console.warn("Error requesting iOS test notification permissions:", err)
      return false
    }
  }
  return false
}

// Schedule actual test notifications
const scheduleTestNotification = async (
  id: string,
  title: string,
  body: string,
  triggerTime: number,
) => {
  if (!isPushNotificationAvailable()) {
    console.warn("PushNotification not available - cannot schedule test notification")
    return false
  }

  try {
    const hasPermission = await requestTestNotificationPermissions()
    if (!hasPermission) {
      console.warn("Test notification permission not granted")
      return false
    }

    const delay = triggerTime - Date.now()

    if (delay > 0) {
      const triggerDate = new Date(triggerTime)

      // Schedule the actual notification
      try {
        PushNotification.localNotificationSchedule({
          id,
          title,
          message: body,
          date: triggerDate,
          soundName: "default",
          vibrate: true,
          vibration: 300,
          priority: "high",
          importance: "high",
          channelId: "test-reminders",
          userInfo: {
            id,
            type: "test-reminder",
          },
        })
      } catch (scheduleError) {
        console.warn("Failed to schedule test notification:", scheduleError)
        return false
      }

      console.log(`⏰ Test notification scheduled:`)
      console.log(`   ID: ${id}`)
      console.log(`   Title: ${title}`)
      console.log(`   Body: ${body}`)
      console.log(`   Will trigger in: ${Math.round(delay / 1000)} seconds`)
      console.log(`   Trigger time: ${new Date(triggerTime).toLocaleString()}`)

      return true
    } else {
      console.log(`❌ Cannot schedule notification in the past`)
      return false
    }
  } catch (error) {
    console.error("Error scheduling test notification:", error)
    return false
  }
}

const cancelTestNotification = async (id: string) => {
  if (!isPushNotificationAvailable()) {
    console.warn("PushNotification not available - cannot cancel test notification")
    return false
  }

  try {
    // Cancel the actual notification
    PushNotification.cancelLocalNotification({ id })
    console.log(`🚫 Test notification cancelled: ${id}`)
    return true
  } catch (error) {
    console.warn("Error cancelling test notification:", error)
    return false
  }
}

// Test reminder data structure
export interface TestReminder {
  id: string
  name: string
  triggerTime: number
  isScheduled: boolean
}

// Test reminder service
export class TestReminderService {
  private static instance: TestReminderService
  private scheduledReminders: Map<string, TestReminder> = new Map()

  static getInstance(): TestReminderService {
    if (!TestReminderService.instance) {
      TestReminderService.instance = new TestReminderService()
    }
    return TestReminderService.instance
  }

  // Create a test reminder that triggers after specified seconds
  async createTestReminder(name: string, delaySeconds = 30): Promise<TestReminder | null> {
    try {
      const id = `test-reminder-${Date.now()}`
      const triggerTime = Date.now() + delaySeconds * 1000

      const reminder: TestReminder = {
        id,
        name,
        triggerTime,
        isScheduled: false,
      }

      // Schedule the notification
      const scheduled = await scheduleTestNotification(
        id,
        `Test Reminder: ${name}`,
        `This is a test reminder that was scheduled ${delaySeconds} seconds ago.`,
        triggerTime,
      )

      if (scheduled) {
        reminder.isScheduled = true
        this.scheduledReminders.set(id, reminder)

        console.log(`✅ Test reminder created successfully:`)
        console.log(`   ID: ${id}`)
        console.log(`   Name: ${name}`)
        console.log(`   Delay: ${delaySeconds} seconds`)
        console.log(`   Trigger time: ${new Date(triggerTime).toLocaleString()}`)

        return reminder
      } else {
        console.log(`❌ Failed to schedule test reminder`)
        return null
      }
    } catch (error) {
      console.error("Error creating test reminder:", error)
      return null
    }
  }

  // Cancel a test reminder
  async cancelTestReminder(id: string): Promise<boolean> {
    try {
      const reminder = this.scheduledReminders.get(id)
      if (reminder) {
        await cancelTestNotification(id)
        this.scheduledReminders.delete(id)
        console.log(`✅ Test reminder cancelled: ${id}`)
        return true
      } else {
        console.log(`❌ Test reminder not found: ${id}`)
        return false
      }
    } catch (error) {
      console.error("Error cancelling test reminder:", error)
      return false
    }
  }

  // Get all scheduled test reminders
  getScheduledReminders(): TestReminder[] {
    return Array.from(this.scheduledReminders.values())
  }

  // Get a specific test reminder
  getTestReminder(id: string): TestReminder | undefined {
    return this.scheduledReminders.get(id)
  }

  // Clear all test reminders
  async clearAllTestReminders(): Promise<boolean> {
    try {
      // Cancel all test reminder notifications
      for (const [id] of this.scheduledReminders) {
        await this.cancelTestReminder(id)
      }

      // Also cancel any remaining test notifications that might not be in our map
      try {
        PushNotification.cancelAllLocalNotifications()
      } catch (error) {
        console.warn("Error cancelling all notifications:", error)
      }

      console.log(`✅ All test reminders cleared`)
      return true
    } catch (error) {
      console.error("Error clearing test reminders:", error)
      return false
    }
  }

  // Get countdown for a test reminder
  getCountdown(id: string): number {
    const reminder = this.scheduledReminders.get(id)
    if (reminder) {
      const remaining = reminder.triggerTime - Date.now()
      return Math.max(0, Math.round(remaining / 1000))
    }
    return 0
  }

  // Check if a test reminder has triggered
  hasTriggered(id: string): boolean {
    const reminder = this.scheduledReminders.get(id)
    if (reminder) {
      return Date.now() >= reminder.triggerTime
    }
    return false
  }
}

// Export singleton instance
export const testReminderService = TestReminderService.getInstance()
