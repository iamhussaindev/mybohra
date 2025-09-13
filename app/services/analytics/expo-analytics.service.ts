import AsyncStorage from "@react-native-async-storage/async-storage"
import { Platform } from "react-native"
import DeviceInfo from "react-native-device-info"

import { actionLoggerService } from "./action-logger.service"
import { firebaseAnalyticsService } from "./firebase-analytics.service"

// Analytics event names
export const ANALYTICS_EVENTS = {
  // Screen tracking
  SCREEN_VIEW: "screen_view",

  // User actions
  USER_LOGIN: "user_login",
  USER_LOGOUT: "user_logout",
  USER_REGISTER: "user_register",

  // App features
  PRAYER_TIME_VIEWED: "prayer_time_viewed",
  QIBLA_OPENED: "qibla_opened",
  CALENDAR_OPENED: "calendar_opened",
  REMINDER_CREATED: "reminder_created",
  REMINDER_DELETED: "reminder_deleted",
  TASBEEH_STARTED: "tasbeeh_started",
  TASBEEH_COMPLETED: "tasbeeh_completed",
  PDF_OPENED: "pdf_opened",
  AUDIO_PLAYED: "audio_played",
  AUDIO_PAUSED: "audio_paused",
  SEARCH_PERFORMED: "search_performed",

  // Navigation
  NAVIGATION_TAB_CHANGED: "navigation_tab_changed",
  DRAWER_OPENED: "drawer_opened",
  DRAWER_CLOSED: "drawer_closed",

  // Location
  LOCATION_UPDATED: "location_updated",
  LOCATION_PERMISSION_GRANTED: "location_permission_granted",
  LOCATION_PERMISSION_DENIED: "location_permission_denied",

  // Errors
  ERROR_OCCURRED: "error_occurred",
  API_ERROR: "api_error",
  NETWORK_ERROR: "network_error",

  // Performance
  APP_START_TIME: "app_start_time",
  SCREEN_LOAD_TIME: "screen_load_time",
  API_RESPONSE_TIME: "api_response_time",
} as const

// User properties
export const USER_PROPERTIES = {
  APP_VERSION: "app_version",
  DEVICE_MODEL: "device_model",
  OS_VERSION: "os_version",
  PLATFORM: "platform",
  IS_FIRST_LAUNCH: "is_first_launch",
  LAST_ACTIVE_DATE: "last_active_date",
} as const

interface AnalyticsEvent {
  name: string
  parameters?: Record<string, any>
  timestamp: number
}

interface UserSession {
  userId?: string
  sessionId: string
  startTime: number
  lastActiveTime: number
  currentScreen?: string
  deviceInfo: {
    appVersion: string
    deviceModel: string
    osVersion: string
    platform: string
  }
}

class ExpoAnalyticsService {
  private isInitialized = false
  private sessionId = ""
  private currentSession: UserSession | null = null
  private eventQueue: AnalyticsEvent[] = []
  private userId: string | null = null
  private currentScreen: string | null = null
  private sessionStartTime: number = Date.now()

  async initialize(): Promise<void> {
    try {
      if (this.isInitialized) return

      // Initialize action logger
      await actionLoggerService.initialize()

      // Generate session ID
      this.sessionId = await this.generateSessionId()

      // Get device information
      const deviceInfo = await this.getDeviceInfo()

      // Create session
      this.currentSession = {
        sessionId: this.sessionId,
        startTime: this.sessionStartTime,
        lastActiveTime: this.sessionStartTime,
        deviceInfo,
      }

      // Set user properties
      await this.setUserProperties(deviceInfo)

      // Process any queued events
      await this.processEventQueue()

      this.isInitialized = true
      console.log("Expo Analytics service initialized successfully")

      // Send verification test event
      await this.logEvent("analytics_service_initialized", {
        timestamp: Date.now(),
        platform: Platform.OS,
        session_id: this.sessionId,
        user_id: this.userId,
        verification: "double_verification_test",
        device_info: deviceInfo,
      })
    } catch (error) {
      console.error("Failed to initialize Expo analytics service:", error)
    }
  }

  private async generateSessionId(): Promise<string> {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 15)
    return `session_${timestamp}_${random}`
  }

  private async getDeviceInfo() {
    try {
      const [appVersion, buildNumber, deviceModel, systemVersion] = await Promise.all([
        DeviceInfo.getVersion(),
        DeviceInfo.getBuildNumber(),
        DeviceInfo.getModel(),
        DeviceInfo.getSystemVersion(),
      ])

      return {
        appVersion: `${appVersion} (${buildNumber})`,
        deviceModel,
        osVersion: systemVersion,
        platform: Platform.OS,
      }
    } catch (error) {
      console.error("Failed to get device info:", error)
      return {
        appVersion: "unknown",
        deviceModel: "unknown",
        osVersion: "unknown",
        platform: Platform.OS,
      }
    }
  }

  private async setUserProperties(deviceInfo: any): Promise<void> {
    try {
      // Store user properties in AsyncStorage for persistence
      const userProperties = {
        [USER_PROPERTIES.APP_VERSION]: deviceInfo.appVersion,
        [USER_PROPERTIES.DEVICE_MODEL]: deviceInfo.deviceModel,
        [USER_PROPERTIES.OS_VERSION]: deviceInfo.osVersion,
        [USER_PROPERTIES.PLATFORM]: deviceInfo.platform,
        [USER_PROPERTIES.IS_FIRST_LAUNCH]: (await this.isFirstAppLaunch()) ? "true" : "false",
        [USER_PROPERTIES.LAST_ACTIVE_DATE]: new Date().toISOString(),
      }

      await AsyncStorage.setItem("analytics_user_properties", JSON.stringify(userProperties))
    } catch (error) {
      console.error("Failed to set user properties:", error)
    }
  }

  private async isFirstAppLaunch(): Promise<boolean> {
    try {
      const hasLaunched = await AsyncStorage.getItem("app_has_launched")
      if (!hasLaunched) {
        await AsyncStorage.setItem("app_has_launched", "true")
        return true
      }
      return false
    } catch (error) {
      console.error("Failed to check first launch:", error)
      return false
    }
  }

  // Screen tracking
  async trackScreenView(screenName: string, screenClass?: string): Promise<void> {
    try {
      this.currentScreen = screenName
      if (this.currentSession) {
        this.currentSession.currentScreen = screenName
        this.currentSession.lastActiveTime = Date.now()
      }

      await this.logEvent(ANALYTICS_EVENTS.SCREEN_VIEW, {
        screen_name: screenName,
        screen_class: screenClass || screenName,
        timestamp: Date.now(),
      })

      console.log(`📱 Screen View: ${screenName}`)
    } catch (error) {
      console.error("Failed to track screen view:", error)
    }
  }

  // Event tracking
  async logEvent(eventName: string, parameters?: Record<string, any>): Promise<void> {
    try {
      const event: AnalyticsEvent = {
        name: eventName,
        parameters: {
          ...parameters,
          timestamp: Date.now(),
          session_duration: Date.now() - this.sessionStartTime,
          current_screen: this.currentScreen,
          session_id: this.sessionId,
          user_id: this.userId,
        },
        timestamp: Date.now(),
      }

      // Add to queue
      this.eventQueue.push(event)

      // Process immediately if initialized, otherwise queue for later
      if (this.isInitialized) {
        await this.processEvent(event)
      }

      // Also send to Firebase Analytics if available (web platform)
      await firebaseAnalyticsService.logEvent(eventName, event.parameters)

      // Also log to action logger for server upload (exclude heartbeat events)
      if (eventName !== "user_heartbeat") {
        await actionLoggerService.logAction(
          eventName,
          "analytics",
          event.parameters,
          this.userId || undefined,
        )
      }

      console.log(`📊 Event: ${eventName}`, event.parameters)
    } catch (error) {
      console.error("Failed to log event:", error)
    }
  }

  private async processEvent(event: AnalyticsEvent): Promise<void> {
    try {
      // Store event locally for debugging and potential future sync
      const events = await this.getStoredEvents()
      events.push(event)

      // Keep only last 100 events to prevent storage bloat
      if (events.length > 100) {
        events.splice(0, events.length - 100)
      }

      await AsyncStorage.setItem("analytics_events", JSON.stringify(events))

      // In a real implementation, you would send this to your analytics service
      // For now, we'll just log it
      console.log("Analytics Event Processed:", event)
    } catch (error) {
      console.error("Failed to process event:", error)
    }
  }

  private async processEventQueue(): Promise<void> {
    for (const event of this.eventQueue) {
      await this.processEvent(event)
    }
    this.eventQueue = []
  }

  private async getStoredEvents(): Promise<AnalyticsEvent[]> {
    try {
      const stored = await AsyncStorage.getItem("analytics_events")
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error("Failed to get stored events:", error)
      return []
    }
  }

  // User identification
  async setUserId(userId: string): Promise<void> {
    try {
      this.userId = userId
      if (this.currentSession) {
        this.currentSession.userId = userId
      }

      await AsyncStorage.setItem("analytics_user_id", userId)

      // Also set user ID in Firebase Analytics if available
      await firebaseAnalyticsService.setUserId(userId)

      // Also set user ID in action logger
      await actionLoggerService.setUserId(userId)

      console.log(`👤 User ID set: ${userId}`)
    } catch (error) {
      console.error("Failed to set user ID:", error)
    }
  }

  // Error tracking
  async recordError(errorName: string, error: any, fatal = false): Promise<void> {
    try {
      const errorInfo = {
        error_name: errorName,
        error_message: error?.message || "Unknown error",
        error_stack: error?.stack || "",
        fatal,
        timestamp: Date.now(),
        current_screen: this.currentScreen,
        user_id: this.userId,
        session_id: this.sessionId,
      }

      await this.logEvent(ANALYTICS_EVENTS.ERROR_OCCURRED, errorInfo)
      console.error(`❌ Error: ${errorName}`, errorInfo)
    } catch (error) {
      console.error("Failed to record error:", error)
    }
  }

  // Performance tracking
  async trackPerformance(metricName: string, value: number, unit = "ms"): Promise<void> {
    try {
      await this.logEvent(metricName, {
        value,
        unit,
        timestamp: Date.now(),
      })
    } catch (error) {
      console.error("Failed to track performance:", error)
    }
  }

  // Custom user actions
  async trackUserAction(action: string, details?: Record<string, any>): Promise<void> {
    try {
      await this.logEvent(action, {
        ...details,
        action_type: "user_action",
        timestamp: Date.now(),
      })
    } catch (error) {
      console.error("Failed to track user action:", error)
    }
  }

  // App lifecycle tracking
  async trackAppStateChange(state: "active" | "background" | "inactive"): Promise<void> {
    try {
      await this.logEvent("app_state_change", {
        state,
        timestamp: Date.now(),
        session_duration: Date.now() - this.sessionStartTime,
      })
    } catch (error) {
      console.error("Failed to track app state change:", error)
    }
  }

  // Get analytics data for debugging
  async getAnalyticsData() {
    try {
      const events = await this.getStoredEvents()
      const userProperties = await AsyncStorage.getItem("analytics_user_properties")

      return {
        isInitialized: this.isInitialized,
        userId: this.userId,
        currentScreen: this.currentScreen,
        sessionDuration: Date.now() - this.sessionStartTime,
        sessionId: this.sessionId,
        totalEvents: events.length,
        recentEvents: events.slice(-10),
        userProperties: userProperties ? JSON.parse(userProperties) : null,
        currentSession: this.currentSession,
      }
    } catch (error) {
      console.error("Failed to get analytics data:", error)
      return null
    }
  }

  // Export events (for debugging or manual sync)
  async exportEvents(): Promise<AnalyticsEvent[]> {
    return await this.getStoredEvents()
  }

  // Clear stored data
  async clearData(): Promise<void> {
    try {
      await AsyncStorage.removeItem("analytics_events")
      await AsyncStorage.removeItem("analytics_user_properties")
      await AsyncStorage.removeItem("analytics_user_id")
      this.eventQueue = []
      console.log("Analytics data cleared")
    } catch (error) {
      console.error("Failed to clear analytics data:", error)
    }
  }

  // Get current analytics state
  getCurrentState() {
    return {
      isInitialized: this.isInitialized,
      userId: this.userId,
      currentScreen: this.currentScreen,
      sessionDuration: Date.now() - this.sessionStartTime,
      sessionId: this.sessionId,
    }
  }
}

// Export singleton instance
export const expoAnalyticsService = new ExpoAnalyticsService()
export default expoAnalyticsService
