import { TestReminderService } from "app/services/testReminderService"

const baseTime = Date.UTC(2024, 0, 1, 8, 0, 0)

jest.mock("react-native", () => {
  const request = jest.fn().mockResolvedValue("granted")

  return {
    Platform: { OS: "android" },
    PermissionsAndroid: {
      PERMISSIONS: { POST_NOTIFICATIONS: "post" },
      RESULTS: { GRANTED: "granted" },
      request,
    },
  }
})

jest.mock("@react-native-community/push-notification-ios", () => ({
  requestPermissions: jest.fn().mockResolvedValue({
    alert: true,
    badge: true,
    sound: true,
  }),
}))

jest.mock("react-native-push-notification", () => {
  const createChannel = jest.fn((_, callback?: (created: boolean) => void) => {
    callback?.(true)
  })

  return {
    __esModule: true,
    default: {
      configure: jest.fn(),
      createChannel,
      localNotificationSchedule: jest.fn(),
      cancelLocalNotification: jest.fn(),
      cancelAllLocalNotifications: jest.fn(),
    },
    Importance: { HIGH: "high" },
  }
})

const permissionsRequestMock = jest.requireMock("react-native").PermissionsAndroid
  .request as jest.Mock
const requestPermissionsMock = jest.requireMock("@react-native-community/push-notification-ios")
  .requestPermissions as jest.Mock
const pushNotificationModule = jest.requireMock("react-native-push-notification")
const localNotificationScheduleMock = pushNotificationModule.default
  .localNotificationSchedule as jest.Mock
const cancelLocalNotificationMock = pushNotificationModule.default
  .cancelLocalNotification as jest.Mock
const cancelAllLocalNotificationsMock = pushNotificationModule.default
  .cancelAllLocalNotifications as jest.Mock
const createChannelMock = pushNotificationModule.default.createChannel as jest.Mock

describe("TestReminderService quick reminders", () => {
  let service: TestReminderService
  let consoleLogSpy: jest.SpyInstance
  let consoleWarnSpy: jest.SpyInstance
  let consoleErrorSpy: jest.SpyInstance

  beforeAll(() => {
    jest.useFakeTimers()
  })

  beforeEach(async () => {
    jest.setSystemTime(new Date(baseTime))
    consoleLogSpy = jest.spyOn(console, "log").mockImplementation(() => {})
    consoleWarnSpy = jest.spyOn(console, "warn").mockImplementation(() => {})
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {})

    service = TestReminderService.getInstance()
    await service.clearAllTestReminders()
    jest.clearAllMocks()

    // Reactivate console spies after clearing mocks
    consoleLogSpy = jest.spyOn(console, "log").mockImplementation(() => {})
    consoleWarnSpy = jest.spyOn(console, "warn").mockImplementation(() => {})
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {})
  })

  afterEach(() => {
    consoleLogSpy.mockRestore()
    consoleWarnSpy.mockRestore()
    consoleErrorSpy.mockRestore()
  })

  afterAll(() => {
    jest.useRealTimers()
  })

  it("schedules a reminder that fires within seconds", async () => {
    const reminder = await service.createTestReminder("Quick Fajr", 3)

    expect(reminder).toBeTruthy()
    expect(reminder?.isScheduled).toBe(true)
    expect(reminder?.triggerTime).toBe(baseTime + 3000)
    expect(permissionsRequestMock).toHaveBeenCalledTimes(1)
    expect(localNotificationScheduleMock).toHaveBeenCalledWith(
      expect.objectContaining({
        id: reminder?.id,
        date: new Date(baseTime + 3000),
      }),
    )
    expect(service.getScheduledReminders()).toHaveLength(1)
    expect(service.getCountdown(reminder!.id)).toBe(3)
  })

  it("marks a quick reminder as triggered after the delay passes", async () => {
    const reminder = await service.createTestReminder("Quick Trigger", 2)
    expect(reminder).toBeTruthy()

    jest.setSystemTime(new Date(baseTime + 2100))

    expect(service.hasTriggered(reminder!.id)).toBe(true)
    expect(service.getCountdown(reminder!.id)).toBe(0)
  })

  it("cancels a quick reminder before it fires", async () => {
    const reminder = await service.createTestReminder("Quick Cancel", 5)
    expect(reminder).toBeTruthy()

    const cancelled = await service.cancelTestReminder(reminder!.id)
    expect(cancelled).toBe(true)
    expect(cancelLocalNotificationMock).toHaveBeenCalledWith({ id: reminder!.id })
    expect(service.getScheduledReminders()).toHaveLength(0)
  })
})
