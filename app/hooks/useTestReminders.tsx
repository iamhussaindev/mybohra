import { testReminderService, TestReminder } from "app/services/testReminderService"
import { useState, useEffect, useCallback } from "react"

export function useTestReminders() {
  const [scheduledReminders, setScheduledReminders] = useState<TestReminder[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load scheduled reminders
  const loadScheduledReminders = useCallback(() => {
    try {
      const reminders = testReminderService.getScheduledReminders()
      setScheduledReminders(reminders)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load reminders")
    }
  }, [])

  // Create a test reminder
  const createTestReminder = useCallback(
    async (name: string, delaySeconds = 30) => {
      setIsLoading(true)
      setError(null)

      try {
        const reminder = await testReminderService.createTestReminder(name, delaySeconds)
        if (reminder) {
          loadScheduledReminders()
          return reminder
        } else {
          setError("Failed to create test reminder")
          return null
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to create test reminder"
        setError(errorMessage)
        return null
      } finally {
        setIsLoading(false)
      }
    },
    [loadScheduledReminders],
  )

  // Cancel a test reminder
  const cancelTestReminder = useCallback(
    async (id: string) => {
      setIsLoading(true)
      setError(null)

      try {
        const success = await testReminderService.cancelTestReminder(id)
        if (success) {
          loadScheduledReminders()
          return true
        } else {
          setError("Failed to cancel test reminder")
          return false
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to cancel test reminder"
        setError(errorMessage)
        return false
      } finally {
        setIsLoading(false)
      }
    },
    [loadScheduledReminders],
  )

  // Clear all test reminders
  const clearAllTestReminders = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const success = await testReminderService.clearAllTestReminders()
      if (success) {
        loadScheduledReminders()
        return true
      } else {
        setError("Failed to clear test reminders")
        return false
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to clear test reminders"
      setError(errorMessage)
      return false
    } finally {
      setIsLoading(false)
    }
  }, [loadScheduledReminders])

  // Get countdown for a reminder
  const getCountdown = useCallback((id: string) => {
    return testReminderService.getCountdown(id)
  }, [])

  // Check if a reminder has triggered
  const hasTriggered = useCallback((id: string) => {
    return testReminderService.hasTriggered(id)
  }, [])

  // Load reminders on mount
  useEffect(() => {
    loadScheduledReminders()
  }, [loadScheduledReminders])

  // Update countdown every second
  useEffect(() => {
    const interval = setInterval(() => {
      setScheduledReminders((prev) => {
        const updated = prev.map((reminder) => ({
          ...reminder,
          // Force re-render by updating the object reference
          triggerTime: reminder.triggerTime,
        }))
        return updated
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  return {
    scheduledReminders,
    isLoading,
    error,
    createTestReminder,
    cancelTestReminder,
    clearAllTestReminders,
    getCountdown,
    hasTriggered,
    loadScheduledReminders,
  }
}
