import { render, RenderOptions } from "@testing-library/react-native"
import { RootStore, setupRootStore } from "app/models"
import { PlainLocation } from "app/types/location"
import React from "react"

// Mock data for testing
export const mockLocation: PlainLocation = {
  latitude: 23.0225,
  longitude: 72.5714,
  city: "Ahmedabad",
  state: "Gujarat",
  country: "India",
  timezone: "Asia/Kolkata",
  type: "current",
}

export const mockPrayerTimes = {
  fajr: "05:30",
  zawaal: "12:15",
  zohar: "12:45",
  asar: "16:20",
  sihori: "18:45",
  maghrib: "19:15",
  nisful_layl: "23:30",
}

// Custom render function with providers
interface CustomRenderOptions extends Omit<RenderOptions, "wrapper"> {
  initialStore?: Partial<RootStore>
}

export function renderWithProviders(
  ui: React.ReactElement,
  { initialStore, ...renderOptions }: CustomRenderOptions = {},
) {
  const store = setupRootStore(initialStore)

  function Wrapper({ children }: { children: React.ReactNode }) {
    return <>{children}</>
  }

  return {
    store,
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  }
}

// Test data generators
export const createMockReminder = (overrides = {}) => ({
  id: "test-reminder-1",
  name: "Test Reminder",
  prayerTime: "fajr" as const,
  offsetMinutes: 0,
  isEnabled: true,
  repeatType: "daily" as const,
  customDays: [],
  location: mockLocation,
  createdAt: Date.now(),
  lastTriggered: null,
  nextTriggerTime: Date.now() + 3600000, // 1 hour from now
  ...overrides,
})

export const createMockLocation = (overrides = {}) => ({
  ...mockLocation,
  ...overrides,
})

// Async test utilities
export const waitFor = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// Mock functions
export const mockAsyncStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  getAllKeys: jest.fn(),
  multiGet: jest.fn(),
  multiSet: jest.fn(),
  multiRemove: jest.fn(),
}

export const mockNativeModules = {
  SalaatTimes: {
    getPrayerTimes: jest.fn(() => Promise.resolve(mockPrayerTimes)),
  },
}

export const mockPushNotification = {
  configure: jest.fn(),
  createChannel: jest.fn(),
  requestPermissions: jest.fn(() => Promise.resolve(true)),
  scheduleLocalNotification: jest.fn(),
  cancelLocalNotification: jest.fn(),
  cancelAllLocalNotifications: jest.fn(),
  setBadgeCount: jest.fn(),
}
