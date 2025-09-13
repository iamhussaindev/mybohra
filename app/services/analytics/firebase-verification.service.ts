import { app, analytics } from "../firebase/firebase.config"
import { Platform } from "react-native"

interface VerificationResult {
  isConnected: boolean
  platform: string
  firebaseApp: boolean
  analytics: boolean
  config: {
    hasApiKey: boolean
    hasProjectId: boolean
    hasMeasurementId: boolean
    isUsingPlaceholders: boolean
  }
  errors: string[]
  recommendations: string[]
}

class FirebaseVerificationService {
  async verifyConnection(): Promise<VerificationResult> {
    const result: VerificationResult = {
      isConnected: false,
      platform: Platform.OS,
      firebaseApp: false,
      analytics: false,
      config: {
        hasApiKey: false,
        hasProjectId: false,
        hasMeasurementId: false,
        isUsingPlaceholders: false,
      },
      errors: [],
      recommendations: [],
    }

    try {
      // Check Firebase App
      if (app) {
        result.firebaseApp = true
        console.log("✅ Firebase App initialized successfully")
      } else {
        result.errors.push("Firebase App not initialized")
        result.recommendations.push("Check Firebase configuration and environment variables")
      }

      // Check Analytics
      if (analytics) {
        result.analytics = true
        console.log("✅ Firebase Analytics initialized successfully")
      } else {
        if (Platform.OS === "web") {
          result.errors.push("Firebase Analytics not initialized on web platform")
          result.recommendations.push("Check if Firebase Analytics is properly configured for web")
        } else {
          result.errors.push("Firebase Analytics not available on native platforms")
          result.recommendations.push("Use Expo Analytics service for native platforms")
        }
      }

      // Check Configuration
      const config = this.getFirebaseConfig()
      result.config.hasApiKey = !!config.apiKey && config.apiKey !== "your-api-key"
      result.config.hasProjectId = !!config.projectId && config.projectId !== "your-project-id"
      result.config.hasMeasurementId =
        !!config.measurementId && config.measurementId !== "G-XXXXXXXXXX"
      result.config.isUsingPlaceholders = this.isUsingPlaceholderValues(config)

      if (result.config.isUsingPlaceholders) {
        result.errors.push("Using placeholder Firebase configuration values")
        result.recommendations.push("Update .env file with actual Firebase project configuration")
      }

      if (!result.config.hasApiKey) {
        result.errors.push("Firebase API Key not configured")
        result.recommendations.push("Set EXPO_PUBLIC_FIREBASE_API_KEY in .env file")
      }

      if (!result.config.hasProjectId) {
        result.errors.push("Firebase Project ID not configured")
        result.recommendations.push("Set EXPO_PUBLIC_FIREBASE_PROJECT_ID in .env file")
      }

      if (!result.config.hasMeasurementId) {
        result.errors.push("Firebase Measurement ID not configured")
        result.recommendations.push("Set EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID in .env file")
      }

      // Determine overall connection status
      result.isConnected =
        result.firebaseApp &&
        (result.analytics || Platform.OS !== "web") &&
        !result.config.isUsingPlaceholders &&
        result.config.hasApiKey &&
        result.config.hasProjectId

      // Add platform-specific recommendations
      if (Platform.OS === "web") {
        result.recommendations.push("For web platform, check Firebase Console > Analytics > Events")
      } else {
        result.recommendations.push(
          "For native platforms, use the AnalyticsDebugger to view events",
        )
        result.recommendations.push("Events are stored locally and can be exported for analysis")
      }
    } catch (error) {
      result.errors.push(`Verification failed: ${error}`)
      result.recommendations.push("Check Firebase configuration and network connection")
    }

    return result
  }

  private getFirebaseConfig() {
    return {
      apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "your-api-key",
      authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || "your-project.firebaseapp.com",
      projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "your-project-id",
      storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || "your-project.appspot.com",
      messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "123456789",
      appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || "your-app-id",
      measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-XXXXXXXXXX",
    }
  }

  private isUsingPlaceholderValues(config: any): boolean {
    const placeholderValues = [
      "your-api-key",
      "your-project.firebaseapp.com",
      "your-project-id",
      "your-project.appspot.com",
      "123456789",
      "your-app-id",
      "G-XXXXXXXXXX",
    ]

    return Object.values(config).some((value) => placeholderValues.includes(value as string))
  }

  async testFirebaseConnection(): Promise<boolean> {
    try {
      // Test Firebase App
      if (!app) {
        console.error("❌ Firebase App not initialized")
        return false
      }

      // Test Analytics (web only)
      if (Platform.OS === "web" && analytics) {
        console.log("✅ Firebase Analytics available on web")
        return true
      } else if (Platform.OS !== "web") {
        console.log("✅ Using Expo Analytics for native platform")
        return true
      } else {
        console.error("❌ Firebase Analytics not available")
        return false
      }
    } catch (error) {
      console.error("❌ Firebase connection test failed:", error)
      return false
    }
  }

  getEnvironmentVariables(): Record<string, string> {
    return {
      EXPO_PUBLIC_FIREBASE_API_KEY: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "Not set",
      EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || "Not set",
      EXPO_PUBLIC_FIREBASE_PROJECT_ID: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "Not set",
      EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET:
        process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || "Not set",
      EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID:
        process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "Not set",
      EXPO_PUBLIC_FIREBASE_APP_ID: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || "Not set",
      EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID:
        process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID || "Not set",
    }
  }

  printVerificationReport(result: VerificationResult): void {
    console.log("\n🔍 Firebase Analytics Connection Verification Report")
    console.log("=".repeat(50))

    console.log(`📱 Platform: ${result.platform}`)
    console.log(`🔗 Overall Status: ${result.isConnected ? "✅ Connected" : "❌ Not Connected"}`)
    console.log(`🔥 Firebase App: ${result.firebaseApp ? "✅ Initialized" : "❌ Not Initialized"}`)
    console.log(`📊 Analytics: ${result.analytics ? "✅ Available" : "❌ Not Available"}`)

    console.log("\n📋 Configuration Status:")
    console.log(`   API Key: ${result.config.hasApiKey ? "✅ Set" : "❌ Not Set"}`)
    console.log(`   Project ID: ${result.config.hasProjectId ? "✅ Set" : "❌ Not Set"}`)
    console.log(`   Measurement ID: ${result.config.hasMeasurementId ? "✅ Set" : "❌ Not Set"}`)
    console.log(`   Using Placeholders: ${result.config.isUsingPlaceholders ? "❌ Yes" : "✅ No"}`)

    if (result.errors.length > 0) {
      console.log("\n❌ Errors:")
      result.errors.forEach((error) => console.log(`   - ${error}`))
    }

    if (result.recommendations.length > 0) {
      console.log("\n💡 Recommendations:")
      result.recommendations.forEach((rec) => console.log(`   - ${rec}`))
    }

    console.log("\n" + "=".repeat(50))
  }
}

// Export singleton instance
export const firebaseVerificationService = new FirebaseVerificationService()
export default firebaseVerificationService
