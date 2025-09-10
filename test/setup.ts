// we always make sure 'react-native' gets included first
import * as ReactNative from "react-native"

import mockFile from "./mockFile"
import {
  mockNativeModules,
  mockGetLocation,
  mockPushNotification,
  mockPushNotificationIOS,
  mockAsyncStorage,
} from "./mocks/nativeModules"
import { mockStorage } from "./mocks/storage"

// libraries to mock
jest.doMock("react-native", () => {
  // Extend ReactNative
  return Object.setPrototypeOf(
    {
      Image: {
        ...ReactNative.Image,
        resolveAssetSource: jest.fn((_source) => mockFile), // eslint-disable-line @typescript-eslint/no-unused-vars
        getSize: jest.fn(
          (
            uri: string, // eslint-disable-line @typescript-eslint/no-unused-vars
            success: (width: number, height: number) => void,
            failure?: (_error: any) => void, // eslint-disable-line @typescript-eslint/no-unused-vars
          ) => success(100, 100),
        ),
      },
      NativeModules: mockNativeModules,
    },
    ReactNative,
  )
})

// Mock AsyncStorage
jest.mock("@react-native-async-storage/async-storage", () => mockAsyncStorage)

// Mock react-native-get-location
jest.mock("react-native-get-location", () => mockGetLocation)

// Mock react-native-push-notification
jest.mock("react-native-push-notification", () => mockPushNotification)

// Mock @react-native-community/push-notification-ios
jest.mock("@react-native-community/push-notification-ios", () => mockPushNotificationIOS)

// Mock app/utils/storage
jest.mock("app/utils/storage", () => mockStorage)

// Mock moment
jest.mock("app/utils/currentTime", () => ({
  momentTime: jest.fn((date?: any) => {
    const moment = require("moment")
    return moment(date)
  }),
  currentTime: jest.fn(() => {
    const moment = require("moment")
    return moment()
  }),
}))

// Mock i18n-js
jest.mock("i18n-js", () => ({
  currentLocale: () => "en",
  t: (key: string, params: Record<string, string>) => {
    return `${key} ${JSON.stringify(params)}`
  },
}))

// Mock expo-localization
jest.mock("expo-localization", () => ({
  ...jest.requireActual("expo-localization"),
  getLocales: () => [{ languageTag: "en-US", textDirection: "ltr" }],
}))

// Mock haversine
jest.mock("haversine", () => ({
  __esModule: true,
  default: jest.fn((start: any, end: any) => {
    // Simple mock distance calculation
    const latDiff = end.latitude - start.latitude
    const lngDiff = end.longitude - start.longitude
    return Math.sqrt(latDiff * latDiff + lngDiff * lngDiff) * 111 // Rough km conversion
  }),
}))

// Mock Fuse.js
jest.mock("fuse.js", () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    search: jest.fn(() => []),
  })),
}))

declare const tron // eslint-disable-line @typescript-eslint/no-unused-vars

declare global {
  let __TEST__: boolean
}
