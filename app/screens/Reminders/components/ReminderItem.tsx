import { IconBell, IconBellOff, IconEdit, IconTrash } from "@tabler/icons-react-native"
import { Button } from "app/components/Button"
import { ListItem } from "app/components/ListItem"
import { Text } from "app/components/Text"
import { namazLabels } from "app/helpers/namaz.helper"
import { useReminders } from "app/hooks/useReminders"
import { IReminder } from "app/models"
import { colors, spacing } from "app/theme"
import { momentTime } from "app/utils/currentTime"
import { observer } from "mobx-react-lite"
import React, { FC } from "react"
import { View, Pressable, StyleSheet } from "react-native"

interface ReminderItemProps {
  reminder: IReminder
  onEdit: () => void
}

export const ReminderItem: FC<ReminderItemProps> = observer(function ReminderItem({
  reminder,
  onEdit,
}) {
  const { deleteReminder, toggleReminder } = useReminders()

  const handleToggle = () => {
    toggleReminder(reminder.id)
  }

  const handleDelete = () => {
    deleteReminder(reminder.id)
  }

  const getOffsetDescription = (offsetMinutes: number): string => {
    if (offsetMinutes === 0) return "At prayer time"
    if (offsetMinutes > 0) return `${offsetMinutes} min after`
    return `${Math.abs(offsetMinutes)} min before`
  }

  const getRepeatDescription = (): string => {
    switch (reminder.repeatType) {
      case "daily":
        return "Daily"
      case "weekly": {
        if (reminder.customDays.length === 0) return "Weekly"
        if (reminder.customDays.length === 7) return "Daily"
        const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
        return reminder.customDays.map((day) => dayNames[day]).join(", ")
      }
      case "monthly":
        return "Monthly"
      case "never":
        return "Once only"
      default:
        return "Unknown"
    }
  }

  const getNextTriggerTime = (): string => {
    if (!reminder.nextTriggerTime) return "Not scheduled"

    const triggerDate = momentTime(reminder.nextTriggerTime as any)
    const now = momentTime()

    if (triggerDate.isSame(now, "day")) {
      return `Today at ${triggerDate.format("h:mm A")}`
    } else if (triggerDate.isSame(now.add(1, "day"), "day")) {
      return `Tomorrow at ${triggerDate.format("h:mm A")}`
    } else {
      return triggerDate.format("MMM D, h:mm A")
    }
  }

  return (
    <ListItem
      style={[
        styles.listItem,
        {
          borderColor: reminder.isEnabled ? colors.palette.primary200 : colors.palette.neutral300,
        },
      ]}
    >
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <View style={styles.titleRow}>
            {reminder.isEnabled ? (
              <IconBell size={20} color={colors.palette.primary500} />
            ) : (
              <IconBellOff size={20} color={colors.palette.neutral400} />
            )}
            <Text
              size="md"
              weight="medium"
              style={[
                styles.titleText,
                {
                  color: reminder.isEnabled ? colors.palette.neutral900 : colors.palette.neutral500,
                },
              ]}
            >
              {reminder.name}
            </Text>
          </View>

          <View style={styles.actionButtons}>
            <Pressable onPress={onEdit} style={styles.editButton}>
              <IconEdit size={18} color={colors.palette.neutral600} />
            </Pressable>

            <Pressable onPress={handleDelete} style={styles.deleteButton}>
              <IconTrash size={18} color={colors.palette.angry500} />
            </Pressable>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Text size="sm" style={styles.infoText}>
            {namazLabels[reminder.prayerTime as keyof typeof namazLabels]} •{" "}
            {getOffsetDescription(reminder.offsetMinutes)}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text size="sm" style={styles.infoText}>
            {getRepeatDescription()}
          </Text>
        </View>

        <View style={styles.nextTriggerRow}>
          <Text size="sm" style={styles.nextTriggerText}>
            Next: {getNextTriggerTime()}
          </Text>
        </View>

        <Button
          preset={reminder.isEnabled ? "default" : "tinted"}
          text={reminder.isEnabled ? "Disable" : "Enable"}
          onPress={handleToggle}
          style={styles.toggleButton}
        />
      </View>
    </ListItem>
  )
})

// Style objects
const styles = StyleSheet.create({
  actionButtons: {
    alignItems: "center",
    flexDirection: "row",
  },
  container: {
    flex: 1,
  },
  deleteButton: {
    padding: spacing.xs,
  },
  editButton: {
    marginRight: spacing.xs,
    padding: spacing.xs,
  },
  headerRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.xs,
  },
  infoRow: {
    marginBottom: spacing.xs,
  },
  infoText: {
    color: colors.palette.neutral600,
  },
  listItem: {
    backgroundColor: colors.palette.neutral100,
    borderRadius: 8,
    borderWidth: 1,
    padding: spacing.md,
  },
  nextTriggerRow: {
    marginBottom: spacing.sm,
  },
  nextTriggerText: {
    color: colors.palette.neutral500,
  },
  titleRow: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
  },
  titleText: {
    marginLeft: spacing.xs,
  },
  toggleButton: {
    alignSelf: "flex-start",
  },
})
