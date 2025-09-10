import { testReminderService } from "app/services/testReminderService"

/**
 * Demo function to test the reminder system
 * This can be called from anywhere in the app to test the functionality
 */
export const runTestReminderDemo = async () => {
  console.log("🚀 Starting Test Reminder Demo...")

  try {
    // Create a test reminder that triggers in 30 seconds
    const reminder = await testReminderService.createTestReminder("Demo Prayer Reminder", 30)

    if (reminder) {
      console.log("✅ Test reminder created successfully!")
      console.log(`   ID: ${reminder.id}`)
      console.log(`   Name: ${reminder.name}`)
      console.log(`   Trigger time: ${new Date(reminder.triggerTime).toLocaleString()}`)

      // Show countdown
      const showCountdown = () => {
        const countdown = testReminderService.getCountdown(reminder.id)
        if (countdown > 0) {
          console.log(`⏰ Countdown: ${countdown} seconds remaining...`)
          setTimeout(showCountdown, 1000)
        } else {
          console.log("🔔 Reminder has triggered!")
        }
      }

      // Start countdown display
      showCountdown()

      return reminder
    } else {
      console.log("❌ Failed to create test reminder")
      return null
    }
  } catch (error) {
    console.error("❌ Error in test reminder demo:", error)
    return null
  }
}

/**
 * Demo function to test multiple reminders
 */
export const runMultipleRemindersDemo = async () => {
  console.log("🚀 Starting Multiple Reminders Demo...")

  try {
    // Create multiple reminders with different delays
    const reminders = await Promise.all([
      testReminderService.createTestReminder("Quick Reminder", 5),
      testReminderService.createTestReminder("Medium Reminder", 15),
      testReminderService.createTestReminder("Long Reminder", 30),
    ])

    const successfulReminders = reminders.filter((r) => r !== null)
    console.log(`✅ Created ${successfulReminders.length} test reminders`)

    // Show all scheduled reminders
    const scheduled = testReminderService.getScheduledReminders()
    console.log(`📋 Total scheduled reminders: ${scheduled.length}`)

    scheduled.forEach((reminder, index) => {
      const countdown = testReminderService.getCountdown(reminder.id)
      console.log(`   ${index + 1}. ${reminder.name} - ${countdown}s remaining`)
    })

    return successfulReminders
  } catch (error) {
    console.error("❌ Error in multiple reminders demo:", error)
    return []
  }
}

/**
 * Demo function to test reminder cancellation
 */
export const runCancellationDemo = async () => {
  console.log("🚀 Starting Cancellation Demo...")

  try {
    // Create a reminder
    const reminder = await testReminderService.createTestReminder("Cancellation Test", 20)

    if (reminder) {
      console.log("✅ Reminder created, will cancel in 5 seconds...")

      setTimeout(async () => {
        const success = await testReminderService.cancelTestReminder(reminder.id)
        if (success) {
          console.log("✅ Reminder cancelled successfully!")
        } else {
          console.log("❌ Failed to cancel reminder")
        }
      }, 5000)

      return reminder
    }

    return null
  } catch (error) {
    console.error("❌ Error in cancellation demo:", error)
    return null
  }
}
