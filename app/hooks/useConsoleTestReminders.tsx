import {
  consoleTestReminderService,
  ConsoleTestReminder,
} from "app/services/consoleTestReminderService"
import { useState, useEffect, useCallback } from "react"

export function useConsoleTestReminders() {
  const [isRunning, setIsRunning] = useState(false)
  const [scheduledReminders, setScheduledReminders] = useState<ConsoleTestReminder[]>([])
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [remainingTimes, setRemainingTimes] = useState<{ [key: string]: number }>({})

  // Update status every second
  useEffect(() => {
    const interval = setInterval(() => {
      const status = consoleTestReminderService.getStatus()
      setIsRunning(status.isRunning)
      setScheduledReminders(status.scheduledReminders)
      setElapsedSeconds(status.elapsedSeconds)

      if (status.isRunning) {
        setRemainingTimes(consoleTestReminderService.getRemainingTimes())
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const startTest = useCallback(() => {
    consoleTestReminderService.startTestReminders()
  }, [])

  const stopTest = useCallback(() => {
    consoleTestReminderService.stopTestReminders()
  }, [])

  const cancelReminder = useCallback((id: string) => {
    return consoleTestReminderService.cancelReminder(id)
  }, [])

  const formatTime = useCallback((seconds: number) => {
    if (seconds <= 0) return "Triggered"
    if (seconds < 60) return `${seconds}s`
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds}s`
  }, [])

  return {
    isRunning,
    scheduledReminders,
    elapsedSeconds,
    remainingTimes,
    startTest,
    stopTest,
    cancelReminder,
    formatTime,
  }
}
