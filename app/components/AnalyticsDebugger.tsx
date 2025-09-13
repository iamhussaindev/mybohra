import { colors } from "app/theme"
import React, { useState, useEffect } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal } from "react-native"

import { expoAnalyticsService as analyticsService } from "../services/analytics/expo-analytics.service"
import { firebaseAnalyticsService } from "../services/analytics/firebase-analytics.service"
import { actionLoggerService } from "../services/analytics/action-logger.service"
import { firebaseVerificationService } from "../services/analytics/firebase-verification.service"
import { realtimeMonitorService } from "../services/monitoring"

interface AnalyticsDebuggerProps {
  visible: boolean
  onClose: () => void
}

export const AnalyticsDebugger: React.FC<AnalyticsDebuggerProps> = ({ visible, onClose }) => {
  const [analyticsState, setAnalyticsState] = useState<any>(null)
  const [monitoringData, setMonitoringData] = useState<any>(null)
  const [firebaseVerification, setFirebaseVerification] = useState<any>(null)
  const [firebaseAnalyticsStatus, setFirebaseAnalyticsStatus] = useState<any>(null)
  const [actionLoggerStatus, setActionLoggerStatus] = useState<any>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    if (visible) {
      refreshData()
      const interval = setInterval(refreshData, 2000) // Refresh every 2 seconds
      return () => clearInterval(interval)
    }
  }, [visible])

  const refreshData = async () => {
    setAnalyticsState(analyticsService.getCurrentState())
    setMonitoringData(realtimeMonitorService.getCurrentData())
    const verification = await firebaseVerificationService.verifyConnection()
    setFirebaseVerification(verification)
    const firebaseStatus = firebaseAnalyticsService.getAvailability()
    setFirebaseAnalyticsStatus(firebaseStatus)

    // Get action logger status
    const pendingCount = await actionLoggerService.getPendingActionsCount()
    const uploadedCount = await actionLoggerService.getUploadedActionsCount()
    setActionLoggerStatus({
      pendingCount,
      uploadedCount,
      totalActions: pendingCount + uploadedCount,
    })

    setRefreshKey((prev) => prev + 1)
  }

  const testEvent = () => {
    analyticsService.logEvent("debug_test_event", {
      timestamp: Date.now(),
      test_data: "This is a test event from debugger",
    })
  }

  const testError = () => {
    analyticsService.recordError(
      "debug_test_error",
      new Error("This is a test error from debugger"),
    )
  }

  const testUserActivity = () => {
    realtimeMonitorService.trackUserActivity("debug_test_activity", {
      test_data: "This is a test activity from debugger",
    })
  }

  const testFirebaseConnection = async () => {
    const isConnected = await firebaseVerificationService.testFirebaseConnection()
    console.log(`Firebase Connection Test: ${isConnected ? "✅ Success" : "❌ Failed"}`)
  }

  const testFirebaseAnalytics = async () => {
    const isWorking = await firebaseAnalyticsService.testConnection()
    console.log(`Firebase Analytics Test: ${isWorking ? "✅ Success" : "❌ Failed"}`)
  }

  if (!visible) return null

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Analytics Debugger</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          {/* Test Buttons */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Test Actions</Text>
            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.testButton} onPress={testEvent}>
                <Text style={styles.testButtonText}>Test Event</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.testButton} onPress={testError}>
                <Text style={styles.testButtonText}>Test Error</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.testButton} onPress={testUserActivity}>
                <Text style={styles.testButtonText}>Test Activity</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.testButton} onPress={testFirebaseConnection}>
                <Text style={styles.testButtonText}>Test Firebase</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.testButton} onPress={testFirebaseAnalytics}>
                <Text style={styles.testButtonText}>Test Analytics</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Firebase Connection Status */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Firebase Connection</Text>
            <View style={styles.dataContainer}>
              <Text style={styles.dataText}>
                Status: {firebaseVerification?.isConnected ? "✅ Connected" : "❌ Not Connected"}
              </Text>
              <Text style={styles.dataText}>
                Platform: {firebaseVerification?.platform || "Unknown"}
              </Text>
              <Text style={styles.dataText}>
                Firebase App: {firebaseVerification?.firebaseApp ? "✅" : "❌"}
              </Text>
              <Text style={styles.dataText}>
                Analytics: {firebaseVerification?.analytics ? "✅" : "❌"}
              </Text>
              <Text style={styles.dataText}>
                API Key: {firebaseVerification?.config?.hasApiKey ? "✅" : "❌"}
              </Text>
              <Text style={styles.dataText}>
                Project ID: {firebaseVerification?.config?.hasProjectId ? "✅" : "❌"}
              </Text>
              <Text style={styles.dataText}>
                Measurement ID: {firebaseVerification?.config?.hasMeasurementId ? "✅" : "❌"}
              </Text>
              <Text style={styles.dataText}>
                Using Placeholders:{" "}
                {firebaseVerification?.config?.isUsingPlaceholders ? "❌ Yes" : "✅ No"}
              </Text>
            </View>
          </View>

          {/* Firebase Analytics Status */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Firebase Analytics</Text>
            <View style={styles.dataContainer}>
              <Text style={styles.dataText}>
                Available: {firebaseAnalyticsStatus?.isAvailable ? "✅ Yes" : "❌ No"}
              </Text>
              <Text style={styles.dataText}>
                Platform: {firebaseAnalyticsStatus?.platform || "Unknown"}
              </Text>
              <Text style={styles.dataText}>
                Reason: {firebaseAnalyticsStatus?.reason || "Unknown"}
              </Text>
            </View>
          </View>

          {/* Action Logger Status */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Action Logger</Text>
            <View style={styles.dataContainer}>
              <Text style={styles.dataText}>
                Pending Actions: {actionLoggerStatus?.pendingCount || 0}
              </Text>
              <Text style={styles.dataText}>
                Uploaded Actions: {actionLoggerStatus?.uploadedCount || 0}
              </Text>
              <Text style={styles.dataText}>
                Total Actions: {actionLoggerStatus?.totalActions || 0}
              </Text>
            </View>
          </View>

          {/* Analytics State */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Analytics State</Text>
            <View style={styles.dataContainer}>
              <Text style={styles.dataText}>
                Initialized: {analyticsState?.isInitialized ? "✅" : "❌"}
              </Text>
              <Text style={styles.dataText}>User ID: {analyticsState?.userId || "Not set"}</Text>
              <Text style={styles.dataText}>
                Current Screen: {analyticsState?.currentScreen || "Unknown"}
              </Text>
              <Text style={styles.dataText}>
                Session Duration:{" "}
                {analyticsState?.sessionDuration
                  ? `${Math.floor(analyticsState.sessionDuration / 1000)}s`
                  : "Unknown"}
              </Text>
            </View>
          </View>

          {/* Monitoring Data */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Real-time Monitoring</Text>
            <View style={styles.dataContainer}>
              <Text style={styles.dataText}>
                Session ID: {monitoringData?.sessionId || "Unknown"}
              </Text>
              <Text style={styles.dataText}>
                Device ID: {monitoringData?.deviceId || "Unknown"}
              </Text>
              <Text style={styles.dataText}>
                Is Monitoring: {monitoringData?.isMonitoring ? "✅" : "❌"}
              </Text>
              <Text style={styles.dataText}>
                Current Screen: {monitoringData?.currentSession?.currentScreen || "Unknown"}
              </Text>
              <Text style={styles.dataText}>
                User ID: {monitoringData?.currentSession?.userId || "Not set"}
              </Text>
              <Text style={styles.dataText}>
                App Version: {monitoringData?.currentSession?.appVersion || "Unknown"}
              </Text>
              <Text style={styles.dataText}>
                Device Model: {monitoringData?.currentSession?.deviceModel || "Unknown"}
              </Text>
              <Text style={styles.dataText}>
                OS Version: {monitoringData?.currentSession?.osVersion || "Unknown"}
              </Text>
              <Text style={styles.dataText}>
                Is Active: {monitoringData?.currentSession?.isActive ? "✅" : "❌"}
              </Text>
            </View>
          </View>

          {/* Page View History */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Page Views</Text>
            <View style={styles.dataContainer}>
              {monitoringData?.pageViewHistory?.length > 0 ? (
                monitoringData.pageViewHistory.map((pageView: any, index: number) => (
                  <View key={index} style={styles.pageViewItem}>
                    <Text style={styles.pageViewText}>
                      {pageView.screenName} - {new Date(pageView.timestamp).toLocaleTimeString()}
                    </Text>
                  </View>
                ))
              ) : (
                <Text style={styles.dataText}>No page views recorded</Text>
              )}
            </View>
          </View>

          {/* Refresh Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Debug Info</Text>
            <View style={styles.dataContainer}>
              <Text style={styles.dataText}>Last Refresh: {new Date().toLocaleTimeString()}</Text>
              <Text style={styles.dataText}>Refresh Count: {refreshKey}</Text>
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  buttonRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  closeButton: {
    alignItems: "center",
    backgroundColor: colors.palette.neutral200,
    borderRadius: 15,
    height: 30,
    justifyContent: "center",
    width: 30,
  },
  closeButtonText: {
    color: colors.palette.neutral100,
    fontSize: 16,
    fontWeight: "bold",
  },
  container: {
    backgroundColor: colors.background,
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  dataContainer: {
    gap: 8,
  },
  dataText: {
    color: colors.palette.neutral600,
    fontFamily: "monospace",
    fontSize: 14,
  },
  header: {
    alignItems: "center",
    backgroundColor: colors.palette.primary500,
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
    paddingTop: 50,
  },
  pageViewItem: {
    backgroundColor: colors.palette.neutral200,
    borderRadius: 5,
    marginBottom: 5,
    padding: 8,
  },
  pageViewText: {
    color: colors.palette.neutral900,
    fontFamily: "monospace",
    fontSize: 12,
  },
  section: {
    backgroundColor: colors.palette.neutral100,
    borderRadius: 10,
    elevation: 3,
    marginBottom: 20,
    padding: 15,
    shadowColor: colors.palette.neutral900,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    color: colors.palette.neutral900,
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  testButton: {
    backgroundColor: colors.palette.primary500,
    borderRadius: 5,
    minWidth: 100,
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  testButtonText: {
    color: colors.palette.neutral100,
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "center",
  },
  title: {
    color: colors.palette.neutral100,
    fontSize: 20,
    fontWeight: "bold",
  },
})

export default AnalyticsDebugger
