import BottomSheet from "@gorhom/bottom-sheet"
import { IconChevronRight } from "@tabler/icons-react-native"
import { Icon, Screen, Text, BottomSheetDrawer } from "app/components"
import Header from "app/components/Header"
import { useStores } from "app/models"
import { AppStackScreenProps } from "app/navigators"
import { colors, spacing } from "app/theme"
import { observer } from "mobx-react-lite"
import React, { FC, useRef } from "react"
import { View, ViewStyle, TextStyle, Pressable, ScrollView } from "react-native"

import NotificationTypeSelector from "./NotificationTypeSelector"
import ReminderOffsetSelector from "./ReminderOffsetSelector"

interface ReminderSettingsScreenProps extends AppStackScreenProps<"ReminderSettings"> {}

const triggerTimeOptions = [
  { label: "5 minutes before", value: 5 },
  { label: "10 minutes before", value: 10 },
  { label: "15 minutes before", value: 15 },
  { label: "20 minutes before", value: 20 },
  { label: "25 minutes before", value: 25 },
  { label: "30 minutes before", value: 30 },
  { label: "45 minutes before", value: 45 },
  { label: "1 hour before", value: 60 },
]

export const ReminderSettingsScreen: FC<ReminderSettingsScreenProps> = observer(
  function ReminderSettingsScreen({ navigation: _navigation }) {
    const { dataStore } = useStores()

    const $bottomSheetRefGoal = useRef<BottomSheet>(null)
    const $bottomSheetRefTriggerTime = useRef<BottomSheet>(null)

    const handleNotificationTypeSelect = (notificationType: "long" | "short") => {
      dataStore.setNotificationType(notificationType)
      $bottomSheetRefTriggerTime.current?.close()
    }

    const handleNotificationTypePress = () => {
      $bottomSheetRefTriggerTime.current?.expand()
    }

    const handleTriggerTimePress = () => {
      $bottomSheetRefGoal.current?.expand()
    }

    const handleTriggerTimeSelect = (minutes: number) => {
      dataStore.setTriggerBeforeMinutes(minutes)
      $bottomSheetRefGoal.current?.close()
    }

    return (
      <Screen preset="fixed" safeAreaEdges={["top"]} contentContainerStyle={$screenContainer}>
        <Header title="Reminder Settings" showBackButton />
        <ScrollView
          style={$scrollView}
          contentContainerStyle={$scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Notification Type Section */}
          <View style={$settingsGroup}>
            <Pressable onPress={handleNotificationTypePress} style={$settingsItem}>
              <View style={$itemContent}>
                <View style={$itemIcon}>
                  <Icon icon="bell" size={20} color={colors.palette.primary500} />
                </View>
                <View style={$itemText}>
                  <Text style={$itemTitle}>Notification Type</Text>
                </View>
              </View>
              <View style={$itemValueContainer}>
                <Text weight="medium" style={$itemValue}>
                  {dataStore.reminderSettings.notificationType === "long" ? "Azan" : "Alert"}
                </Text>
                <IconChevronRight size={18} color={colors.palette.neutral500} />
              </View>
            </Pressable>
          </View>

          {/* Trigger Time Section */}
          <View style={$settingsGroup}>
            <Pressable style={$settingsItem} onPress={handleTriggerTimePress}>
              <View style={$itemContent}>
                <View style={$itemIcon}>
                  <Icon icon="alarm" size={20} color={colors.palette.primary500} />
                </View>
                <View style={$itemText}>
                  <Text style={$itemTitle}>Trigger Time</Text>
                </View>
              </View>
              <View style={$itemValueContainer}>
                <Text weight="medium" style={$itemValue}>
                  {triggerTimeOptions.find(
                    (opt) => opt.value === dataStore.reminderSettings.triggerBeforeMinutes,
                  )?.label || "5 minutes before"}
                </Text>
                <IconChevronRight size={18} color={colors.palette.neutral500} />
              </View>
            </Pressable>
          </View>
        </ScrollView>

        <BottomSheetDrawer ref={$bottomSheetRefGoal} snapPoints={["40%", "70%"]}>
          <ReminderOffsetSelector setOffset={(offset) => handleTriggerTimeSelect(offset)} />
        </BottomSheetDrawer>
        <BottomSheetDrawer ref={$bottomSheetRefTriggerTime} snapPoints={["40%", "70%"]}>
          <NotificationTypeSelector
            setNotificationType={(notificationType) =>
              handleNotificationTypeSelect(notificationType)
            }
          />
        </BottomSheetDrawer>
      </Screen>
    )
  },
)

const $screenContainer: ViewStyle = {
  flex: 1,
  backgroundColor: colors.white,
}

const $scrollView: ViewStyle = {
  flex: 1,
}

const $scrollContent: ViewStyle = {
  paddingBottom: spacing.xl,
}

const $settingsGroup: ViewStyle = {
  marginTop: spacing.lg,
  marginHorizontal: spacing.sm,
}

const $itemValueContainer: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
}

const $itemValue: TextStyle = {
  fontSize: 16,
  marginLeft: spacing.sm,
  marginRight: spacing.xs,
  color: colors.palette.neutral600,
}

const $settingsItem: ViewStyle = {
  backgroundColor: colors.background,
  borderTopWidth: 0.5,
  borderBottomWidth: 0.5,
  borderColor: colors.palette.neutral200,
  paddingVertical: spacing.sm,
  marginHorizontal: spacing.sm,
  paddingHorizontal: spacing.sm,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  shadowColor: colors.gray,
  height: 60,
  shadowOffset: { width: 0, height: 5 },
  shadowOpacity: 1,
  shadowRadius: 10,
  borderRadius: 10,
  elevation: 5,
  borderWidth: 1,
}

// const $lastItem: ViewStyle = {
//   borderBottomWidth: 0,
// }

const $itemContent: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  flex: 1,
}

const $itemIcon: ViewStyle = {
  width: 32,
  height: 32,
  borderRadius: 6,
  backgroundColor: colors.palette.neutral100,
  alignItems: "center",
  justifyContent: "center",
  marginRight: spacing.sm,
}

const $itemText: ViewStyle = {
  flex: 1,
}

const $itemTitle: TextStyle = {
  fontSize: 16,
  fontWeight: "500",
  color: colors.text,
  marginBottom: 2,
}

// const $emptyState: ViewStyle = {
//   backgroundColor: colors.background,
//   paddingVertical: spacing.xl,
//   paddingHorizontal: spacing.md,
//   alignItems: "center",
//   borderTopWidth: 0.5,
//   borderBottomWidth: 0.5,
//   borderColor: colors.palette.neutral200,
// }

// const $emptyStateText: TextStyle = {
//   fontSize: 16,
//   fontWeight: "500",
//   color: colors.palette.neutral600,
//   marginBottom: spacing.xs,
// }

// const $emptyStateSubtext: TextStyle = {
//   fontSize: 14,
//   color: colors.palette.neutral500,
//   textAlign: "center",
// }

// const $removeButton: ViewStyle = {
//   width: 28,
//   height: 28,
//   borderRadius: 14,
//   backgroundColor: colors.palette.neutral100,
//   alignItems: "center",
//   justifyContent: "center",
// }
