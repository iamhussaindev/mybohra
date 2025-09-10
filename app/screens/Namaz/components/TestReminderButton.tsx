import { IconBell } from "@tabler/icons-react-native"
import { Button } from "app/components/Button"
import { Text } from "app/components/Text"
import { useTestReminders } from "app/hooks/useTestReminders"
import { colors, spacing } from "app/theme"
import { observer } from "mobx-react-lite"
import React, { useState } from "react"
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

  const [showDetails, setShowDetails] = useState(false)

  const handleCreateTestReminder = async () => {
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
