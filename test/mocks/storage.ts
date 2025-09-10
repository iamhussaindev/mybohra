// Mock for app/utils/storage
export const mockStorage = {
  load: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
  clear: jest.fn(),
  keys: jest.fn(),
  multiLoad: jest.fn(),
  multiSave: jest.fn(),
  multiRemove: jest.fn(),
}

// Mock data for storage tests
export const mockStorageData = {
  locations: [
    {
      id: "location-1",
      latitude: 23.0225,
      longitude: 72.5714,
      city: "Ahmedabad",
      state: "Gujarat",
      country: "India",
      timezone: "Asia/Kolkata",
      type: "current",
    },
  ],
  reminders: [
    {
      id: "reminder-1",
      name: "Fajr Reminder",
      prayerTime: "fajr",
      offsetMinutes: 0,
      isEnabled: true,
      repeatType: "daily",
      customDays: [],
      location: {
        latitude: 23.0225,
        longitude: 72.5714,
        city: "Ahmedabad",
        state: "Gujarat",
        country: "India",
        timezone: "Asia/Kolkata",
        type: "current",
      },
      createdAt: Date.now(),
      lastTriggered: null,
      nextTriggerTime: Date.now() + 3600000,
    },
  ],
  settings: {
    theme: "light",
    language: "en",
    notifications: true,
  },
}

// Helper functions for storage mocking
export const setupStorageMocks = () => {
  mockStorage.load.mockImplementation((key: string) => {
    return Promise.resolve(mockStorageData[key as keyof typeof mockStorageData] || null)
  })

  mockStorage.save.mockImplementation((key: string, value: any) => {
    mockStorageData[key as keyof typeof mockStorageData] = value
    return Promise.resolve()
  })

  mockStorage.remove.mockImplementation((key: string) => {
    delete mockStorageData[key as keyof typeof mockStorageData]
    return Promise.resolve()
  })

  mockStorage.clear.mockImplementation(() => {
    Object.keys(mockStorageData).forEach((key) => {
      delete mockStorageData[key as keyof typeof mockStorageData]
    })
    return Promise.resolve()
  })

  mockStorage.keys.mockImplementation(() => {
    return Promise.resolve(Object.keys(mockStorageData))
  })
}

export const resetStorageMocks = () => {
  Object.values(mockStorage).forEach((mockFn) => {
    if (typeof mockFn === "function") {
      mockFn.mockReset()
    }
  })
}
