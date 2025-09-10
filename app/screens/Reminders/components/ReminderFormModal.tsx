import { observer } from "mobx-react-lite"
import React, { FC, useEffect } from "react"
import { View, Modal, ScrollView, Pressable } from "react-native"
import { IconX } from "@tabler/icons-react-native"
import { Button } from "app/components/Button"
import { Screen } from "app/components/Screen"
import { Text } from "app/components/Text"
import { TextField } from "app/components/TextField"
import { useReminders } from "app/hooks/useReminders"
import { useReminderForm } from "app/hooks/useReminderForm"
import { namazLabels } from "app/helpers/namaz.helper"
import { colors, spacing } from "app/theme"

interface ReminderFormModalProps {
  isVisible: boolean
  onClose: () => void
  editingReminderId?: string | null
}

export const ReminderFormModal: FC<ReminderFormModalProps> = observer(function ReminderFormModal({
  isVisible,
  onClose,
  editingReminderId,
}) {
  const { reminders, createReminder, updateReminder } = useReminders()
  const {
    formData,
    errors,
    updateField,
    updatePrayerTime,
    updateOffset,
    updateRepeatType,
    toggleCustomDay,
    validateForm,
    resetForm,
    getOffsetDescription,
    getRepeatDescription,
    dayNames,
  } = useReminderForm()

  // Load editing reminder data
  useEffect(() => {
    if (editingReminderId && isVisible) {
      const reminder = reminders.find((r) => r.id === editingReminderId)
      if (reminder) {
        updateField("name", reminder.name)
        updateField("prayerTime", reminder.prayerTime)
        updateField("offsetMinutes", reminder.offsetMinutes)
        updateField("repeatType", reminder.repeatType)
        updateField("customDays", reminder.customDays)
      }
    } else if (isVisible) {
      resetForm()
    }
  }, [editingReminderId, isVisible, reminders, updateField, resetForm])

  const handleSave = async () => {
    if (!validateForm()) return

    try {
      if (editingReminderId) {
        await updateReminder(editingReminderId, formData)
      } else {
        await createReminder(formData)
      }
      onClose()
    } catch (error) {
      console.error("Error saving reminder:", error)
    }
  }

  const prayerTimes = Object.keys(namazLabels) as Array<keyof typeof namazLabels>

  return (
    <Modal visible={isVisible} animationType="slide" presentationStyle="pageSheet">
      <Screen preset="fixed" safeAreaEdges={["top"]}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.sm,
            borderBottomWidth: 1,
            borderBottomColor: colors.palette.neutral200,
          }}
        >
          <Text size="lg" weight="medium">
            {editingReminderId ? "Edit Reminder" : "New Reminder"}
          </Text>
          <Pressable onPress={onClose} style={{ padding: spacing.xs }}>
            <IconX size={24} color={colors.palette.neutral600} />
          </Pressable>
        </View>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: spacing.md }}>
          {/* Reminder Name */}
          <View style={{ marginBottom: spacing.lg }}>
            <Text size="md" weight="medium" style={{ marginBottom: spacing.sm }}>
              Reminder Name
            </Text>
            <TextField
              value={formData.name}
              onChangeText={(text) => updateField("name", text)}
              placeholder="Enter reminder name"
              error={errors.name}
            />
          </View>

          {/* Prayer Time Selection */}
          <View style={{ marginBottom: spacing.lg }}>
            <Text size="md" weight="medium" style={{ marginBottom: spacing.sm }}>
              Prayer Time
            </Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.xs }}>
              {prayerTimes.map((prayerTime) => (
                <Button
                  key={prayerTime}
                  preset={formData.prayerTime === prayerTime ? "filled" : "default"}
                  text={namazLabels[prayerTime]}
                  onPress={() => updatePrayerTime(prayerTime)}
                  style={{ marginBottom: spacing.xs }}
                />
              ))}
            </View>
          </View>

          {/* Offset Selection */}
          <View style={{ marginBottom: spacing.lg }}>
            <Text size="md" weight="medium" style={{ marginBottom: spacing.sm }}>
              Timing: {getOffsetDescription(formData.offsetMinutes)}
            </Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.xs }}>
              {[-30, -15, -5, 0, 5, 15, 30].map((offset) => (
                <Button
                  key={offset}
                  preset={formData.offsetMinutes === offset ? "filled" : "default"}
                  text={offset === 0 ? "At time" : `${offset > 0 ? "+" : ""}${offset} min`}
                  onPress={() => updateOffset(offset)}
                  style={{ marginBottom: spacing.xs }}
                />
              ))}
            </View>
          </View>

          {/* Repeat Type Selection */}
          <View style={{ marginBottom: spacing.lg }}>
            <Text size="md" weight="medium" style={{ marginBottom: spacing.sm }}>
              Repeat: {getRepeatDescription(formData.repeatType, formData.customDays)}
            </Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.xs }}>
              {[
                { key: "never", label: "Once only" },
                { key: "daily", label: "Daily" },
                { key: "weekly", label: "Weekly" },
                { key: "monthly", label: "Monthly" },
              ].map(({ key, label }) => (
                <Button
                  key={key}
                  preset={formData.repeatType === key ? "filled" : "default"}
                  text={label}
                  onPress={() => updateRepeatType(key as any)}
                  style={{ marginBottom: spacing.xs }}
                />
              ))}
            </View>
          </View>

          {/* Custom Days for Weekly Repeat */}
          {formData.repeatType === "weekly" && (
            <View style={{ marginBottom: spacing.lg }}>
              <Text size="md" weight="medium" style={{ marginBottom: spacing.sm }}>
                Select Days
              </Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.xs }}>
                {dayNames.map((day, index) => (
                  <Button
                    key={index}
                    preset={formData.customDays.includes(index) ? "filled" : "default"}
                    text={day.slice(0, 3)}
                    onPress={() => toggleCustomDay(index)}
                    style={{ marginBottom: spacing.xs }}
                  />
                ))}
              </View>
              {errors.customDays && (
                <Text size="sm" style={{ color: colors.palette.error500, marginTop: spacing.xs }}>
                  {errors.customDays}
                </Text>
              )}
            </View>
          )}
        </ScrollView>

        {/* Action Buttons */}
        <View
          style={{
            flexDirection: "row",
            padding: spacing.md,
            borderTopWidth: 1,
            borderTopColor: colors.palette.neutral200,
            gap: spacing.sm,
          }}
        >
          <Button preset="default" text="Cancel" onPress={onClose} style={{ flex: 1 }} />
          <Button
            preset="filled"
            text={editingReminderId ? "Update" : "Create"}
            onPress={handleSave}
            style={{ flex: 1 }}
          />
        </View>
      </Screen>
    </Modal>
  )
})
