import { testReminderService, TestReminderService } from "app/services/testReminderService"

// Mock console methods
const mockConsoleLog = jest.fn()
const mockConsoleError = jest.fn()

beforeEach(() => {
  jest.clearAllMocks()
  global.console.log = mockConsoleLog
  global.console.error = mockConsoleError
})

describe("TestReminderService", () => {
  let service: TestReminderService

  beforeEach(() => {
    service = TestReminderService.getInstance()
    // Clear any existing reminders
    service.clearAllTestReminders()
  })

  describe("createTestReminder", () => {
    it("should create a test reminder with default 30 second delay", async () => {
      const reminder = await service.createTestReminder("Test Prayer Reminder")

      expect(reminder).toBeDefined()
      expect(reminder?.name).toBe("Test Prayer Reminder")
      expect(reminder?.isScheduled).toBe(true)
      expect(reminder?.triggerTime).toBeGreaterThan(Date.now())
      expect(reminder?.triggerTime - Date.now()).toBeLessThanOrEqual(31000) // Allow 1 second tolerance
    })

    it("should create a test reminder with custom delay", async () => {
      const delaySeconds = 10
      const reminder = await service.createTestReminder("Custom Delay Reminder", delaySeconds)

      expect(reminder).toBeDefined()
      expect(reminder?.name).toBe("Custom Delay Reminder")
      expect(reminder?.isScheduled).toBe(true)
      expect(reminder?.triggerTime - Date.now()).toBeLessThanOrEqual((delaySeconds + 1) * 1000)
    })

    it("should log notification details", async () => {
      await service.createTestReminder("Test Reminder", 5)

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining("Test notification scheduled:"),
      )
    })
  })

  describe("getScheduledReminders", () => {
    it("should return empty array initially", () => {
      const reminders = service.getScheduledReminders()
      expect(reminders).toEqual([])
    })

    it("should return scheduled reminders", async () => {
      await service.createTestReminder("Reminder 1")
      await service.createTestReminder("Reminder 2")

      const reminders = service.getScheduledReminders()
      expect(reminders).toHaveLength(2)
      expect(reminders[0].name).toBe("Reminder 1")
      expect(reminders[1].name).toBe("Reminder 2")
    })
  })

  describe("cancelTestReminder", () => {
    it("should cancel a scheduled reminder", async () => {
      const reminder = await service.createTestReminder("Test Reminder")
      expect(reminder).toBeDefined()

      const success = await service.cancelTestReminder(reminder!.id)
      expect(success).toBe(true)

      const reminders = service.getScheduledReminders()
      expect(reminders).toHaveLength(0)
    })

    it("should return false for non-existent reminder", async () => {
      const success = await service.cancelTestReminder("non-existent-id")
      expect(success).toBe(false)
    })
  })

  describe("getCountdown", () => {
    it("should return correct countdown for scheduled reminder", async () => {
      const delaySeconds = 5
      const reminder = await service.createTestReminder("Countdown Test", delaySeconds)
      expect(reminder).toBeDefined()

      const countdown = service.getCountdown(reminder!.id)
      expect(countdown).toBeLessThanOrEqual(delaySeconds)
      expect(countdown).toBeGreaterThan(0)
    })

    it("should return 0 for non-existent reminder", () => {
      const countdown = service.getCountdown("non-existent-id")
      expect(countdown).toBe(0)
    })
  })

  describe("hasTriggered", () => {
    it("should return false for future reminder", async () => {
      const reminder = await service.createTestReminder("Future Reminder", 10)
      expect(reminder).toBeDefined()

      const hasTriggered = service.hasTriggered(reminder!.id)
      expect(hasTriggered).toBe(false)
    })

    it("should return true for past reminder", async () => {
      const reminder = await service.createTestReminder("Past Reminder", -1) // Negative delay
      expect(reminder).toBeDefined()

      const hasTriggered = service.hasTriggered(reminder!.id)
      expect(hasTriggered).toBe(true)
    })
  })

  describe("clearAllTestReminders", () => {
    it("should clear all scheduled reminders", async () => {
      await service.createTestReminder("Reminder 1")
      await service.createTestReminder("Reminder 2")
      expect(service.getScheduledReminders()).toHaveLength(2)

      const success = await service.clearAllTestReminders()
      expect(success).toBe(true)
      expect(service.getScheduledReminders()).toHaveLength(0)
    })
  })

  describe("singleton pattern", () => {
    it("should return the same instance", () => {
      const instance1 = TestReminderService.getInstance()
      const instance2 = TestReminderService.getInstance()
      expect(instance1).toBe(instance2)
    })
  })
})
