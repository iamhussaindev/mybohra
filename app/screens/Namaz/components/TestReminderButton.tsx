import { IconBell } from "@tabler/icons-react-native"
import { Button } from "app/components/Button"
import { Text } from "app/components/Text"
import { useConsoleTestReminders } from "app/hooks/useConsoleTestReminders"
import { useTestReminders } from "app/hooks/useTestReminders"
import {
  checkNotificationPermissions,
  requestNotificationPermissions,
  debugNotificationStatus,
  testNotification,
} from "app/services/notificationService"
import { colors, spacing } from "app/theme"
import { observer } from "mobx-react-lite"
import React, { useState, useEffect } from "react"
import { View, Alert, ViewStyle, TextStyle } from "react-native"

export const TestReminderButton = observer(function TestReminderButton() {
  const {
    scheduledReminders,
    isLoading,
    error,
    createTestReminder,
    cancelTestReminder,
    clearAllTestReminders,
    getCountdown,
  } = useTestReminders()

  const {
    isRunning: consoleTestRunning,
    scheduledReminders: consoleReminders,
    elapsedSeconds,
    remainingTimes,
    startTest: startConsoleTest,
    stopTest: stopConsoleTest,
    cancelReminder: cancelConsoleReminder,
    formatTime: formatConsoleTime,
  } = useConsoleTestReminders()

  const [showDetails, setShowDetails] = useState(false)
  const [showConsoleTest, setShowConsoleTest] = useState(false)
  const [permissionStatus, setPermissionStatus] = useState<{
    alert: boolean
    badge: boolean
    sound: boolean
    authorized: boolean
  } | null>(null)

  // Check notification permissions on component mount
  useEffect(() => {
    checkPermissions()
  }, [])

  const checkPermissions = async () => {
    try {
      const status = await checkNotificationPermissions()
      setPermissionStatus(status)
    } catch (error) {
      console.warn("Error checking notification permissions:", error)
    }
  }

  const requestPermissions = async () => {
    try {
      const granted = await requestNotificationPermissions()
      if (granted) {
        Alert.alert(
          "Permissions Granted",
          "Notification permissions have been granted. You can now create test reminders.",
          [{ text: "OK" }],
        )
        await checkPermissions() // Refresh permission status
      } else {
        Alert.alert(
          "Permissions Denied",
          "Notification permissions were denied. Please enable them in Settings to use reminders.",
          [{ text: "OK" }],
        )
      }
    } catch (error) {
      Alert.alert("Error", "Failed to request notification permissions.", [{ text: "OK" }])
    }
  }

  const handleCreateTestReminder = async () => {
    // Check permissions first
    if (!permissionStatus?.authorized) {
      Alert.alert(
        "Permissions Required",
        "Notification permissions are required to create test reminders. Would you like to grant them now?",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Grant Permissions", onPress: requestPermissions },
        ],
      )
      return
    }

    try {
      const reminder = await createTestReminder("Test Prayer Reminder", 30)
      if (reminder) {
        Alert.alert(
          "Test Reminder Created",
          "A test reminder has been scheduled to trigger in 30 seconds. You will receive a notification on your device.",
          [{ text: "OK" }],
        )
      } else {
        Alert.alert("Error", "Failed to create test reminder. Please try again.", [{ text: "OK" }])
      }
    } catch (err) {
      Alert.alert("Error", "An error occurred while creating the test reminder.", [{ text: "OK" }])
    }
  }

  const handleCancelReminder = async (id: string) => {
    try {
      const success = await cancelTestReminder(id)
      if (success) {
        Alert.alert("Reminder Cancelled", "The test reminder has been cancelled.", [{ text: "OK" }])
      }
    } catch (err) {
      Alert.alert("Error", "Failed to cancel the reminder.", [{ text: "OK" }])
    }
  }

  const handleClearAllReminders = async () => {
    Alert.alert("Clear All Reminders", "Are you sure you want to cancel all test reminders?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Clear All",
        style: "destructive",
        onPress: async () => {
          try {
            await clearAllTestReminders()
            Alert.alert("Reminders Cleared", "All test reminders have been cancelled.", [
              { text: "OK" },
            ])
          } catch (err) {
            Alert.alert("Error", "Failed to clear reminders.", [{ text: "OK" }])
          }
        },
      },
    ])
  }

  const formatTime = (seconds: number) => {
    if (seconds <= 0) return "Triggered"
    if (seconds < 60) return `${seconds}s`
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds}s`
  }

  return (
    <View style={$container}>
      <View style={$header}>
        <IconBell size={20} color={colors.palette.primary500} />
        <Text
          size="md"
          weight="medium"
          style={{ marginLeft: spacing.xs, color: colors.palette.neutral900 }}
        >
          Test Reminders
        </Text>
      </View>

      {error && (
        <View style={$error}>
          <Text size="sm" style={{ color: colors.palette.angry500 }}>
            Error: {error}
          </Text>
        </View>
      )}

      {permissionStatus && (
        <View style={$permissionStatus}>
          <Text size="sm" style={{ color: colors.palette.neutral600, marginBottom: spacing.xs }}>
            Notification Status:
          </Text>
          <View style={$permissionRow}>
            <Text
              size="xs"
              style={{
                color: permissionStatus.alert
                  ? colors.palette.primary500
                  : colors.palette.neutral400,
              }}
            >
              Alerts: {permissionStatus.alert ? "✓" : "✗"}
            </Text>
            <Text
              size="xs"
              style={{
                color: permissionStatus.badge
                  ? colors.palette.primary500
                  : colors.palette.neutral400,
              }}
            >
              Badge: {permissionStatus.badge ? "✓" : "✗"}
            </Text>
            <Text
              size="xs"
              style={{
                color: permissionStatus.sound
                  ? colors.palette.primary500
                  : colors.palette.neutral400,
              }}
            >
              Sound: {permissionStatus.sound ? "✓" : "✗"}
            </Text>
          </View>
          {!permissionStatus.authorized && (
            <Button
              text="Grant Permissions"
              preset="tinted"
              onPress={requestPermissions}
              style={{
                marginTop: spacing.xs,
                paddingHorizontal: spacing.sm,
                paddingVertical: spacing.xs,
              }}
            />
          )}
        </View>
      )}

      <View style={$buttonContainer}>
        <Button
          text="Create Test Reminder"
          preset="filled"
          onPress={handleCreateTestReminder}
          disabled={isLoading}
          style={$buttonStyle}
        />

        {scheduledReminders.length > 0 && (
          <Button
            text="Show Details"
            preset="tinted"
            onPress={() => setShowDetails(!showDetails)}
            style={$buttonStyle}
          />
        )}
      </View>

      {scheduledReminders.length > 0 && (
        <View style={{ marginBottom: spacing.sm }}>
          <View style={$buttonContainer}>
            <Text size="sm" style={{ color: colors.palette.neutral600 }}>
              {scheduledReminders.length} reminder(s) scheduled
            </Text>
            <Button
              text="Clear All"
              preset="reversed"
              onPress={handleClearAllReminders}
              disabled={isLoading}
              style={{ paddingHorizontal: spacing.sm, paddingVertical: spacing.xs }}
            />
          </View>
        </View>
      )}

      {showDetails && scheduledReminders.length > 0 && (
        <View style={$detailsContainer}>
          {scheduledReminders.map((reminder) => {
            const countdown = getCountdown(reminder.id)
            const hasTriggered = countdown <= 0

            return (
              <View key={reminder.id} style={$reminderItem}>
                <View style={$reminderItemContent}>
                  <Text size="sm" weight="medium" style={{ color: colors.palette.neutral900 }}>
                    {reminder.name}
                  </Text>
                  <Text
                    size="xs"
                    style={{
                      color: hasTriggered ? colors.palette.angry500 : colors.palette.neutral600,
                    }}
                  >
                    {hasTriggered ? "Triggered" : `Triggers in: ${formatTime(countdown)}`}
                  </Text>
                </View>

                <Button
                  text="Cancel"
                  preset="reversed"
                  onPress={() => handleCancelReminder(reminder.id)}
                  disabled={isLoading || hasTriggered}
                  style={$buttonStyle}
                />
              </View>
            )
          })}
        </View>
      )}

      <View style={{ marginTop: spacing.sm }}>
        <Text size="xs" style={$textStyle}>
          Test reminders will show actual notifications on your device. Make sure notification
          permissions are enabled.
        </Text>
      </View>

      {/* Console Test Reminders Section */}
      <View style={$consoleTestSection}>
        <View style={$header}>
          <IconBell size={20} color={colors.palette.secondary500} />
          <Text
            size="md"
            weight="medium"
            style={{ marginLeft: spacing.xs, color: colors.palette.neutral900 }}
          >
            Console Test (Namaz Reminders)
          </Text>
        </View>

        <Text size="xs" style={$consoleDescription}>
          Test 6 namaz reminders with sequential scheduling (1 minute test, no notifications)
        </Text>

        <View style={$buttonContainer}>
          <Button
            text={consoleTestRunning ? "Stop Console Test" : "Start Console Test"}
            preset={consoleTestRunning ? "reversed" : "filled"}
            onPress={consoleTestRunning ? stopConsoleTest : startConsoleTest}
            style={$buttonStyle}
          />

          {consoleReminders.length > 0 && (
            <Button
              text="Show Details"
              preset="tinted"
              onPress={() => setShowConsoleTest(!showConsoleTest)}
              style={$buttonStyle}
            />
          )}
        </View>

        {consoleTestRunning && (
          <View style={$consoleStatus}>
            <Text size="sm" weight="medium" style={{ color: colors.palette.secondary500 }}>
              Test Running: {elapsedSeconds}s elapsed
            </Text>
            <Text size="xs" style={{ color: colors.palette.neutral600 }}>
              {consoleReminders.length} reminders scheduled
            </Text>
          </View>
        )}

        {showConsoleTest && consoleReminders.length > 0 && (
          <View style={$detailsContainer}>
            {consoleReminders.map((reminder) => {
              const remaining = remainingTimes[reminder.id] || 0
              const hasTriggered = remaining <= 0

              return (
                <View key={reminder.id} style={$reminderItem}>
                  <View style={$reminderItemContent}>
                    <Text size="sm" weight="medium" style={{ color: colors.palette.neutral900 }}>
                      {reminder.name}
                    </Text>
                    <Text
                      size="xs"
                      style={{
                        color: hasTriggered
                          ? colors.palette.secondary500
                          : colors.palette.neutral600,
                      }}
                    >
                      {hasTriggered ? "Triggered" : `In: ${formatConsoleTime(remaining)}`}
                    </Text>
                    <Text size="xs" style={{ color: colors.palette.neutral500 }}>
                      Target: {reminder.intervalSeconds}s mark
                    </Text>
                  </View>

                  <Button
                    text="Cancel"
                    preset="reversed"
                    onPress={() => cancelConsoleReminder(reminder.id)}
                    disabled={hasTriggered}
                    style={$buttonStyle}
                  />
                </View>
              )
            })}
          </View>
        )}
      </View>

      <View style={{ marginTop: spacing.sm }}>
        <Text size="xs" style={$textStyle}>
          Console test simulates sequential namaz reminders - each reminder schedules the next one
          when triggered. Check the console for reminder outputs.
        </Text>
      </View>

      {/* Debug Section */}
      <View style={$debugSection}>
        <Text size="sm" weight="bold" style={$debugTitle}>
          🔧 Notification Debug Tools
        </Text>

        <View style={$buttonContainer}>
          <Button
            text="Debug Status"
            preset="tinted"
            onPress={debugNotificationStatus}
            style={$buttonStyle}
          />

          <Button
            text="Test Notification"
            preset="filled"
            onPress={testNotification}
            style={$buttonStyle}
          />
        </View>

        <Text size="xs" style={$debugDescription}>
          Use these tools to verify if PushNotification.localNotificationSchedule is working
          properly. Check console for detailed logs.
        </Text>
      </View>
    </View>
  )
})

const $container: ViewStyle = {
  marginTop: spacing.md,
}

const $header: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  marginBottom: spacing.sm,
}

const $error: ViewStyle = {
  marginBottom: spacing.sm,
}

const $buttonContainer: ViewStyle = {
  flexDirection: "row",
  gap: spacing.sm,
  marginBottom: spacing.sm,
}

const $detailsContainer: ViewStyle = {
  backgroundColor: colors.palette.neutral100,
  padding: spacing.sm,
  borderRadius: 8,
}

const $reminderItem: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  paddingVertical: spacing.xs,
  borderBottomWidth: 1,
  borderBottomColor: colors.palette.neutral200,
}

const $reminderItemContent: ViewStyle = {
  flex: 1,
}

const $buttonStyle: ViewStyle = {
  paddingHorizontal: spacing.sm,
  paddingVertical: spacing.xs,
}

const $textStyle: TextStyle = {
  color: colors.palette.neutral500,
  textAlign: "center",
}

const $permissionStatus: ViewStyle = {
  backgroundColor: colors.palette.neutral100,
  padding: spacing.sm,
  borderRadius: 8,
  marginBottom: spacing.sm,
}

const $permissionRow: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-between",
  gap: spacing.sm,
}

const $consoleTestSection: ViewStyle = {
  marginTop: spacing.lg,
  paddingTop: spacing.md,
  borderTopWidth: 1,
  borderTopColor: colors.palette.neutral200,
}

const $consoleDescription: TextStyle = {
  color: colors.palette.neutral600,
  marginBottom: spacing.sm,
}

const $consoleStatus: ViewStyle = {
  backgroundColor: colors.palette.secondary100,
  padding: spacing.sm,
  borderRadius: 8,
  marginTop: spacing.sm,
}

const $debugSection: ViewStyle = {
  marginTop: spacing.lg,
  padding: spacing.md,
  backgroundColor: colors.palette.neutral100,
  borderRadius: 12,
  borderWidth: 1,
  borderColor: colors.palette.neutral300,
}

const $debugTitle: TextStyle = {
  color: colors.text,
  textAlign: "center",
  marginBottom: spacing.sm,
}

const $debugDescription: TextStyle = {
  color: colors.palette.neutral500,
  textAlign: "center",
  marginTop: spacing.sm,
}
