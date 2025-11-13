// Mock for React Native NativeModules
export const mockNativeModules = {
  SalaatTimes: {
    getPrayerTimes: jest.fn((lat: number, lng: number, date: Date) => {
      // Return mock prayer times based on location and date
      const baseTimes = {
        fajr: "05:30",
        zawaal: "12:15",
        zohar: "12:45",
        asar: "16:20",
        sihori: "18:45",
        maghrib: "19:15",
        nisful_layl: "23:30",
      }

      // Simulate different times for different locations
      if (lat > 40) {
        // Northern hemisphere
        return {
          ...baseTimes,
          fajr: "04:30",
          maghrib: "20:15",
        }
      }

      return baseTimes
    }),
  },
}

// Mock for react-native-get-location
export const mockGetLocation = {
  getCurrentPosition: jest.fn(() =>
    Promise.resolve({
      latitude: 23.0225,
      longitude: 72.5714,
      accuracy: 10,
      altitude: 0,
      speed: 0,
      heading: 0,
      timestamp: Date.now(),
    }),
  ),
}

// Mock for react-native-push-notification
export const mockPushNotification = {
  configure: jest.fn(),
  createChannel: jest.fn(),
  requestPermissions: jest.fn(() => Promise.resolve(true)),
  scheduleLocalNotification: jest.fn(),
  cancelLocalNotification: jest.fn(),
  cancelAllLocalNotifications: jest.fn(),
  setBadgeCount: jest.fn(),
  checkPermissions: jest.fn(() => Promise.resolve({ alert: true, badge: true, sound: true })),
  getScheduledLocalNotifications: jest.fn(() => Promise.resolve([])),
  getDeliveredNotifications: jest.fn(() => Promise.resolve([])),
  removeAllDeliveredNotifications: jest.fn(),
  removeDeliveredNotifications: jest.fn(),
  getApplicationIconBadgeNumber: jest.fn(() => Promise.resolve(0)),
  setApplicationIconBadgeNumber: jest.fn(),
  popInitialNotification: jest.fn(() => Promise.resolve(null)),
  abandonPermissions: jest.fn(),
}

// Mock for @react-native-community/push-notification-ios
export const mockPushNotificationIOS = {
  requestPermissions: jest.fn(() => Promise.resolve({ alert: true, badge: true, sound: true })),
  checkPermissions: jest.fn(() => Promise.resolve({ alert: true, badge: true, sound: true })),
  getApplicationIconBadgeNumber: jest.fn(() => Promise.resolve(0)),
  setApplicationIconBadgeNumber: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  removeAllListeners: jest.fn(),
  presentLocalNotification: jest.fn(),
  scheduleLocalNotification: jest.fn(),
  cancelLocalNotification: jest.fn(),
  cancelAllLocalNotifications: jest.fn(),
  getScheduledLocalNotifications: jest.fn(() => Promise.resolve([])),
  getDeliveredNotifications: jest.fn(() => Promise.resolve([])),
  removeAllDeliveredNotifications: jest.fn(),
  removeDeliveredNotifications: jest.fn(),
  popInitialNotification: jest.fn(() => Promise.resolve(null)),
  abandonPermissions: jest.fn(),
}

// Mock for AsyncStorage
export const mockAsyncStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  getAllKeys: jest.fn(),
  multiGet: jest.fn(),
  multiSet: jest.fn(),
  multiRemove: jest.fn(),
  multiMerge: jest.fn(),
  flushGetRequests: jest.fn(),
}

// Mock for moment
export const mockMoment = {
  __esModule: true,
  default: jest.fn((date?: any) => {
    const moment = require("moment")
    return moment(date)
  }),
}

// Mock for date-fns
export const mockDateFns = {
  format: jest.fn((date: Date, format: string) => {
    const dateFns = require("date-fns")
    return dateFns.format(date, format)
  }),
  addDays: jest.fn((date: Date, days: number) => {
    const dateFns = require("date-fns")
    return dateFns.addDays(date, days)
  }),
  isToday: jest.fn((date: Date) => {
    const dateFns = require("date-fns")
    return dateFns.isToday(date)
  }),
  isTomorrow: jest.fn((date: Date) => {
    const dateFns = require("date-fns")
    return dateFns.isTomorrow(date)
  }),
}
