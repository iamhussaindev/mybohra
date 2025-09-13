import { getAnalytics, Analytics } from "firebase/analytics"
import { initializeApp, getApps, FirebaseApp } from "firebase/app"
import { getRemoteConfig, RemoteConfig } from "firebase/remote-config"
import { Platform } from "react-native"

// Firebase configuration
// Replace these with your actual Firebase project configuration
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "your-api-key",
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || "your-project.firebaseapp.com",
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "your-project-id",
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || "your-project.appspot.com",
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || "your-app-id",
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-XXXXXXXXXX",
}

// Initialize Firebase
let app: FirebaseApp
let analytics: Analytics | null = null
let remoteConfig: RemoteConfig | null = null

if (getApps().length === 0) {
  app = initializeApp(firebaseConfig)

  // Initialize Analytics (only in browser environment for web)
  if (Platform.OS === "web" && typeof window !== "undefined") {
    try {
      analytics = getAnalytics(app)
    } catch (error) {
      console.warn("Analytics initialization failed:", error)
    }
  }

  // Note: Crashlytics is not available in Expo managed workflow
  // Use error reporting through analytics instead

  // Initialize Remote Config
  try {
    remoteConfig = getRemoteConfig(app)
    remoteConfig.settings = {
      minimumFetchIntervalMillis: 3600000, // 1 hour
      fetchTimeoutMillis: 60000, // 1 minute
    }
  } catch (error) {
    console.warn("Remote Config initialization failed:", error)
  }
} else {
  app = getApps()[0]
}

export { app, analytics, remoteConfig }
export default app
