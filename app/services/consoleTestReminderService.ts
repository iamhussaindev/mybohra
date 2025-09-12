// Console-based test reminder service for testing without actual notifications
export interface ConsoleTestReminder {
  id: string
  name: string
  triggerTime: number
  isScheduled: boolean
  intervalSeconds: number
}

// Namaz times configuration for testing
const NAMAZ_TEST_CONFIG = [
  { name: "Fajr", triggerAfterSeconds: 35, intervalSeconds: 5 }, // triggers at 5th second after start
  { name: "Dhuhr", triggerAfterSeconds: 40, intervalSeconds: 12 }, // triggers at 12th second after start
  { name: "Asr", triggerAfterSeconds: 48, intervalSeconds: 18 }, // triggers at 18th second after start
  { name: "Maghrib", triggerAfterSeconds: 55, intervalSeconds: 25 }, // triggers at 25th second after start
  { name: "Isha", triggerAfterSeconds: 62, intervalSeconds: 32 }, // triggers at 32nd second after start
  { name: "Zawal", triggerAfterSeconds: 68, intervalSeconds: 38 }, // triggers at 38th second after start
]

// Console test reminder service
export class ConsoleTestReminderService {
  private static instance: ConsoleTestReminderService
  private scheduledReminders: Map<string, ConsoleTestReminder> = new Map()
  private activeTimeouts: Map<string, NodeJS.Timeout> = new Map()
  private startTime = 0
  private isRunning = false

  static getInstance(): ConsoleTestReminderService {
    if (!ConsoleTestReminderService.instance) {
      ConsoleTestReminderService.instance = new ConsoleTestReminderService()
    }
    return ConsoleTestReminderService.instance
  }

  // Start the test reminder system
  startTestReminders(): void {
    if (this.isRunning) {
      console.log("🚫 Test reminders are already running")
      return
    }

    this.isRunning = true
    this.startTime = Date.now()
    console.log("🚀 Starting Console Test Reminder System")
    console.log("⏰ Test will run for 1 minute with multiple namaz reminders")
    console.log("📅 Schedule:")

    NAMAZ_TEST_CONFIG.forEach((config) => {
      console.log(
        `   ${config.name}: triggers ${config.triggerAfterSeconds}s after start (at ${config.intervalSeconds}s mark)`,
      )
    })

    console.log("----------------------------------------")

    // Schedule initial reminder after 30 seconds
    setTimeout(() => {
      console.log("⏰ 30 seconds elapsed - Starting namaz reminders...")
      this.scheduleAllReminders()
    }, 30000)

    // Stop the test after 1 minute
    setTimeout(() => {
      this.stopTestReminders()
    }, 60000)
  }

  // Schedule all namaz reminders
  private scheduleAllReminders(): void {
    NAMAZ_TEST_CONFIG.forEach((config, index) => {
      const reminder: ConsoleTestReminder = {
        id: `namaz-${config.name.toLowerCase()}-${Date.now()}`,
        name: config.name,
        triggerTime: this.startTime + config.triggerAfterSeconds * 1000,
        isScheduled: true,
        intervalSeconds: config.intervalSeconds,
      }

      this.scheduledReminders.set(reminder.id, reminder)

      // Schedule the reminder to trigger
      const timeout = setTimeout(() => {
        this.triggerReminder(reminder)

        // Special case: when Fajr triggers, schedule Zawal as mentioned in the example
        if (config.name === "Fajr") {
          console.log("🔄 Fajr triggered - scheduling additional Zawal reminder...")
          this.scheduleAdditionalZawal()
        }
      }, config.triggerAfterSeconds * 1000 - 30000) // subtract 30s since we already waited

      this.activeTimeouts.set(reminder.id, timeout)
    })
  }

  // Schedule additional Zawal reminder when Fajr triggers
  private scheduleAdditionalZawal(): void {
    const additionalZawal: ConsoleTestReminder = {
      id: `zawal-additional-${Date.now()}`,
      name: "Zawal (Additional)",
      triggerTime: this.startTime + 55000, // trigger at 55s mark (25s after start)
      isScheduled: true,
      intervalSeconds: 25,
    }

    this.scheduledReminders.set(additionalZawal.id, additionalZawal)

    const timeout = setTimeout(() => {
      this.triggerReminder(additionalZawal)
    }, 25000) // 25 seconds from now

    this.activeTimeouts.set(additionalZawal.id, timeout)
    console.log("📝 Additional Zawal reminder scheduled for 25 seconds from now")
  }

  // Trigger a reminder (console log instead of notification)
  private triggerReminder(reminder: ConsoleTestReminder): void {
    const currentTime = Date.now()
    const elapsedSeconds = Math.round((currentTime - this.startTime) / 1000)

    console.log("🔔 ====== NAMAZ REMINDER TRIGGERED ======")
    console.log(`📿 Prayer: ${reminder.name}`)
    console.log(`⏰ Time: ${new Date().toLocaleTimeString()}`)
    console.log(`📊 Elapsed: ${elapsedSeconds}s since start`)
    console.log(`🎯 Target: ${reminder.intervalSeconds}s mark`)
    console.log(`🆔 ID: ${reminder.id}`)
    console.log("========================================")
  }

  // Stop the test reminder system
  stopTestReminders(): void {
    if (!this.isRunning) {
      console.log("🚫 Test reminders are not running")
      return
    }

    console.log("🛑 Stopping Console Test Reminder System")

    // Clear all active timeouts
    this.activeTimeouts.forEach((timeout, id) => {
      clearTimeout(timeout)
      console.log(`⏹️  Cleared timeout for: ${id}`)
    })

    this.activeTimeouts.clear()
    this.scheduledReminders.clear()
    this.isRunning = false

    const totalElapsed = Math.round((Date.now() - this.startTime) / 1000)
    console.log(`✅ Test completed - Total time: ${totalElapsed}s`)
    console.log("========================================")
  }

  // Get current status
  getStatus(): {
    isRunning: boolean
    scheduledCount: number
    elapsedSeconds: number
    scheduledReminders: ConsoleTestReminder[]
  } {
    const elapsedSeconds = this.isRunning ? Math.round((Date.now() - this.startTime) / 1000) : 0

    return {
      isRunning: this.isRunning,
      scheduledCount: this.scheduledReminders.size,
      elapsedSeconds,
      scheduledReminders: Array.from(this.scheduledReminders.values()),
    }
  }

  // Cancel a specific reminder
  cancelReminder(id: string): boolean {
    const timeout = this.activeTimeouts.get(id)
    if (timeout) {
      clearTimeout(timeout)
      this.activeTimeouts.delete(id)
      this.scheduledReminders.delete(id)
      console.log(`⏹️  Cancelled reminder: ${id}`)
      return true
    }
    return false
  }

  // Get remaining time for each reminder
  getRemainingTimes(): { [key: string]: number } {
    const currentTime = Date.now()
    const remaining: { [key: string]: number } = {}

    this.scheduledReminders.forEach((reminder, id) => {
      const timeLeft = Math.max(0, Math.round((reminder.triggerTime - currentTime) / 1000))
      remaining[id] = timeLeft
    })

    return remaining
  }
}

// Export singleton instance
export const consoleTestReminderService = ConsoleTestReminderService.getInstance()
