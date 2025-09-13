import AsyncStorage from "@react-native-async-storage/async-storage"
import DeviceInfo from "react-native-device-info"

import { expoAnalyticsService } from "../analytics/expo-analytics.service"

interface UserSession {
  userId: string
  sessionId: string
  deviceId: string
  startTime: number
  lastActiveTime: number
  currentScreen: string
  appVersion: string
  deviceModel: string
  osVersion: string
  isActive: boolean
}

interface PageView {
  screenName: string
  userId: string
  sessionId: string
  timestamp: number
  duration?: number
  previousScreen?: string
}

class RealtimeMonitorService {
  private sessionId = ""
  private deviceId = ""
  private currentSession: UserSession | null = null
  private pageViewHistory: PageView[] = []
  private heartbeatInterval: NodeJS.Timeout | null = null
  private isMonitoring = false

  async initialize(): Promise<void> {
    try {
      // Generate unique session and device IDs
      this.sessionId = await this.generateSessionId()
      this.deviceId = await this.getOrCreateDeviceId()

      // Start monitoring
      await this.startMonitoring()

      // Send verification test event
      await expoAnalyticsService.logEvent("realtime_monitoring_initialized", {
        timestamp: Date.now(),
        session_id: this.sessionId,
        device_id: this.deviceId,
        verification: "double_verification_test",
      })

      console.log("Realtime monitoring initialized")
    } catch (error) {
      console.error("Failed to initialize realtime monitoring:", error)
      expoAnalyticsService.recordError("realtime_monitoring_init_failed", error)
    }
  }

  private async generateSessionId(): Promise<string> {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 15)
    return `session_${timestamp}_${random}`
  }

  private async getOrCreateDeviceId(): Promise<string> {
    try {
      let deviceId = await AsyncStorage.getItem("device_id")
      if (!deviceId) {
        deviceId = await DeviceInfo.getUniqueId()
        await AsyncStorage.setItem("device_id", deviceId)
      }
      return deviceId
    } catch (error) {
      console.error("Failed to get device ID:", error)
      return `device_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
    }
  }

  private async startMonitoring(): Promise<void> {
    if (this.isMonitoring) return

    try {
      // Get device information
      const [appVersion, deviceModel, systemVersion] = await Promise.all([
        DeviceInfo.getVersion(),
        DeviceInfo.getModel(),
        DeviceInfo.getSystemVersion(),
      ])

      // Create initial session
      this.currentSession = {
        userId: "", // Will be set when user logs in
        sessionId: this.sessionId,
        deviceId: this.deviceId,
        startTime: Date.now(),
        lastActiveTime: Date.now(),
        currentScreen: "unknown",
        appVersion,
        deviceModel,
        osVersion: systemVersion,
        isActive: true,
      }

      // Start heartbeat to track active users
      this.startHeartbeat()

      this.isMonitoring = true
      console.log("Realtime monitoring started")
    } catch (error) {
      console.error("Failed to start monitoring:", error)
      expoAnalyticsService.recordError("monitoring_start_failed", error)
    }
  }

  private startHeartbeat(): void {
    // Send heartbeat every 30 seconds
    this.heartbeatInterval = setInterval(() => {
      this.sendHeartbeat()
    }, 30000)
  }

  private async sendHeartbeat(): Promise<void> {
    try {
      if (!this.currentSession) return

      // Update last active time
      this.currentSession.lastActiveTime = Date.now()

      // Track active user
      await this.trackActiveUser()

      // Send to analytics
      await expoAnalyticsService.logEvent("user_heartbeat", {
        session_id: this.currentSession.sessionId,
        device_id: this.currentSession.deviceId,
        current_screen: this.currentSession.currentScreen,
        session_duration: Date.now() - this.currentSession.startTime,
        is_active: this.currentSession.isActive,
      })
    } catch (error) {
      console.error("Failed to send heartbeat:", error)
    }
  }

  async setUserId(userId: string): Promise<void> {
    try {
      if (this.currentSession) {
        this.currentSession.userId = userId
      }

      // Track user login
      await expoAnalyticsService.logEvent("user_session_started", {
        user_id: userId,
        session_id: this.sessionId,
        device_id: this.deviceId,
      })

      console.log(`User ID set for monitoring: ${userId}`)
    } catch (error) {
      console.error("Failed to set user ID for monitoring:", error)
    }
  }

  async trackPageView(screenName: string, previousScreen?: string): Promise<void> {
    try {
      if (!this.currentSession) return

      // Update current screen in session
      this.currentSession.currentScreen = screenName
      this.currentSession.lastActiveTime = Date.now()

      // Create page view record
      const pageView: PageView = {
        screenName,
        userId: this.currentSession.userId,
        sessionId: this.sessionId,
        timestamp: Date.now(),
        previousScreen,
      }

      // Add to history
      this.pageViewHistory.push(pageView)

      // Keep only last 50 page views to prevent memory issues
      if (this.pageViewHistory.length > 50) {
        this.pageViewHistory = this.pageViewHistory.slice(-50)
      }

      // Track page view
      await expoAnalyticsService.logEvent("page_view_tracked", {
        screen_name: screenName,
        user_id: this.currentSession.userId,
        session_id: this.sessionId,
        device_id: this.deviceId,
        previous_screen: previousScreen,
        timestamp: pageView.timestamp,
      })

      console.log(`📄 Page View: ${screenName}`)
    } catch (error) {
      console.error("Failed to track page view:", error)
      expoAnalyticsService.recordError("page_view_tracking_failed", error)
    }
  }

  async trackUserActivity(activity: string, details?: Record<string, any>): Promise<void> {
    try {
      if (!this.currentSession) return

      // Update last active time
      this.currentSession.lastActiveTime = Date.now()

      // Track activity
      await expoAnalyticsService.logEvent("user_activity", {
        activity,
        user_id: this.currentSession.userId,
        session_id: this.sessionId,
        device_id: this.deviceId,
        current_screen: this.currentSession.currentScreen,
        timestamp: Date.now(),
        ...details,
      })

      console.log(`🎯 Activity: ${activity}`)
    } catch (error) {
      console.error("Failed to track user activity:", error)
    }
  }

  private async trackActiveUser(): Promise<void> {
    try {
      if (!this.currentSession) return

      await expoAnalyticsService.logEvent("active_user_tracked", {
        user_id: this.currentSession.userId,
        session_id: this.sessionId,
        device_id: this.deviceId,
        current_screen: this.currentSession.currentScreen,
        session_duration: Date.now() - this.currentSession.startTime,
        last_active: this.currentSession.lastActiveTime,
        app_version: this.currentSession.appVersion,
        device_model: this.currentSession.deviceModel,
        os_version: this.currentSession.osVersion,
      })
    } catch (error) {
      console.error("Failed to track active user:", error)
    }
  }

  async setUserActive(isActive: boolean): Promise<void> {
    try {
      if (this.currentSession) {
        this.currentSession.isActive = isActive
        this.currentSession.lastActiveTime = Date.now()
      }

      await expoAnalyticsService.logEvent("user_activity_status_changed", {
        is_active: isActive,
        user_id: this.currentSession?.userId,
        session_id: this.sessionId,
        device_id: this.deviceId,
        timestamp: Date.now(),
      })
    } catch (error) {
      console.error("Failed to set user active status:", error)
    }
  }

  async endSession(): Promise<void> {
    try {
      if (!this.currentSession) return

      const sessionDuration = Date.now() - this.currentSession.startTime

      // Track session end
      await expoAnalyticsService.logEvent("user_session_ended", {
        user_id: this.currentSession.userId,
        session_id: this.sessionId,
        device_id: this.deviceId,
        session_duration: sessionDuration,
        page_views_count: this.pageViewHistory.length,
        last_screen: this.currentSession.currentScreen,
      })

      // Clear heartbeat
      if (this.heartbeatInterval) {
        clearInterval(this.heartbeatInterval)
        this.heartbeatInterval = null
      }

      // Reset state
      this.currentSession = null
      this.pageViewHistory = []
      this.isMonitoring = false

      console.log("Session ended")
    } catch (error) {
      console.error("Failed to end session:", error)
    }
  }

  // Get current monitoring data
  getCurrentData() {
    return {
      sessionId: this.sessionId,
      deviceId: this.deviceId,
      currentSession: this.currentSession,
      pageViewHistory: this.pageViewHistory.slice(-10), // Last 10 page views
      isMonitoring: this.isMonitoring,
    }
  }

  // Get active users data (for dashboard)
  async getActiveUsersData() {
    try {
      // This would typically query your backend or Firebase
      // For now, return current session data
      return {
        activeUsers: this.currentSession ? 1 : 0,
        currentUser: this.currentSession,
        totalSessions: 1,
        averageSessionDuration: this.currentSession
          ? Date.now() - this.currentSession.startTime
          : 0,
      }
    } catch (error) {
      console.error("Failed to get active users data:", error)
      return {
        activeUsers: 0,
        currentUser: null,
        totalSessions: 0,
        averageSessionDuration: 0,
      }
    }
  }
}

// Export singleton instance
export const realtimeMonitorService = new RealtimeMonitorService()
export default realtimeMonitorService
