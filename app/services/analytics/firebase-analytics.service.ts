import {
  logEvent as firebaseLogEvent,
  setUserId as firebaseSetUserId,
  setUserProperties as firebaseSetUserProperties,
} from "firebase/analytics"
import { Platform } from "react-native"

import { analytics } from "../firebase/firebase.config"

interface FirebaseAnalyticsEvent {
  name: string
  parameters?: Record<string, any>
}

class FirebaseAnalyticsService {
  private isAvailable = false

  constructor() {
    this.isAvailable = Platform.OS === "web" && analytics !== null
  }

  async logEvent(eventName: string, parameters?: Record<string, any>): Promise<void> {
    if (!this.isAvailable) {
      console.log(
        `📊 [Firebase Analytics] Event not sent (not available on ${Platform.OS}): ${eventName}`,
      )
      return
    }

    try {
      // Convert parameters to Firebase Analytics format
      const firebaseParams = this.convertParameters(parameters)

      firebaseLogEvent(analytics!, eventName, firebaseParams)
      console.log(`📊 [Firebase Analytics] Event sent: ${eventName}`, firebaseParams)
    } catch (error) {
      console.error(`❌ [Firebase Analytics] Failed to log event ${eventName}:`, error)
    }
  }

  async setUserId(userId: string): Promise<void> {
    if (!this.isAvailable) {
      console.log(`📊 [Firebase Analytics] User ID not set (not available on ${Platform.OS})`)
      return
    }

    try {
      firebaseSetUserId(analytics!, userId)
      console.log(`📊 [Firebase Analytics] User ID set: ${userId}`)
    } catch (error) {
      console.error("❌ [Firebase Analytics] Failed to set user ID:", error)
    }
  }

  async setUserProperties(properties: Record<string, any>): Promise<void> {
    if (!this.isAvailable) {
      console.log(
        `📊 [Firebase Analytics] User properties not set (not available on ${Platform.OS})`,
      )
      return
    }

    try {
      const firebaseProperties = this.convertParameters(properties)
      firebaseSetUserProperties(analytics!, firebaseProperties)
      console.log(`📊 [Firebase Analytics] User properties set:`, firebaseProperties)
    } catch (error) {
      console.error("❌ [Firebase Analytics] Failed to set user properties:", error)
    }
  }

  private convertParameters(parameters?: Record<string, any>): Record<string, any> {
    if (!parameters) return {}

    const converted: Record<string, any> = {}

    for (const [key, value] of Object.entries(parameters)) {
      // Firebase Analytics has specific parameter requirements
      if (typeof value === "string" && value.length > 100) {
        // Truncate long strings
        converted[key] = value.substring(0, 100)
      } else if (typeof value === "number" && (value < -2e9 || value > 2e9)) {
        // Clamp large numbers
        converted[key] = Math.max(-2e9, Math.min(2e9, value))
      } else if (
        typeof value === "boolean" ||
        typeof value === "number" ||
        typeof value === "string"
      ) {
        converted[key] = value
      } else {
        // Convert other types to strings
        converted[key] = String(value)
      }
    }

    return converted
  }

  getAvailability(): { isAvailable: boolean; platform: string; reason?: string } {
    if (Platform.OS === "web") {
      return {
        isAvailable: this.isAvailable,
        platform: Platform.OS,
        reason: this.isAvailable
          ? "Firebase Analytics available on web"
          : "Firebase Analytics not initialized on web",
      }
    } else {
      return {
        isAvailable: false,
        platform: Platform.OS,
        reason: "Firebase Analytics only available on web platform in Expo managed workflow",
      }
    }
  }

  async testConnection(): Promise<boolean> {
    if (!this.isAvailable) {
      console.log(
        `📊 [Firebase Analytics] Connection test skipped (not available on ${Platform.OS})`,
      )
      return false
    }

    try {
      await this.logEvent("firebase_analytics_test", {
        test_timestamp: Date.now(),
        test_platform: Platform.OS,
        test_message: "Firebase Analytics connection test",
      })
      return true
    } catch (error) {
      console.error("❌ [Firebase Analytics] Connection test failed:", error)
      return false
    }
  }

  /**
   * Initialize Firebase Analytics (compatibility method)
   */
  async initialize(): Promise<void> {
    console.log("📊 [Firebase Analytics] Initialized")
    // Firebase Analytics initializes automatically, no action needed
  }

  /**
   * Record error event (compatibility method)
   */
  async recordError(errorName: string, error: any, fatal: boolean = false): Promise<void> {
    await this.logEvent("error_occurred", {
      error_name: errorName,
      error_message: error?.message || String(error),
      fatal: fatal,
      timestamp: Date.now(),
    })
  }
}

export const firebaseAnalyticsService = new FirebaseAnalyticsService()
export default firebaseAnalyticsService
