import { Button } from "app/components/Button"
import { EmptyState } from "app/components/EmptyState"
import Header from "app/components/Header"
import { Screen } from "app/components/Screen"
import { Text } from "app/components/Text"
import { useReminders } from "app/hooks/useReminders"
import { spacing } from "app/theme"
import { observer } from "mobx-react-lite"
import React, { FC, useState } from "react"
import { FlatList, View, ViewStyle } from "react-native"

import { ReminderFormModal } from "./components/ReminderFormModal"
import { ReminderItem } from "./components/ReminderItem"

export const ReminderScreen: FC = observer(function ReminderScreen() {
  const { reminders, enabledReminders, isLoaded } = useReminders()
  const [showFormModal, setShowFormModal] = useState(false)
  const [editingReminder, setEditingReminder] = useState<string | null>(null)

  const handleCreateReminder = () => {
    setEditingReminder(null)
    setShowFormModal(true)
  }

  const handleEditReminder = (id: string) => {
    setEditingReminder(id)
    setShowFormModal(true)
  }

  const handleCloseModal = () => {
    setShowFormModal(false)
    setEditingReminder(null)
  }

  if (!isLoaded) {
    return (
      <Screen preset="fixed" safeAreaEdges={["top"]}>
        <Header title="Prayer Reminders" showBackButton />
        <View style={$loadingContainer}>
          <Text>Loading reminders...</Text>
        </View>
      </Screen>
    )
  }

  return (
    <Screen preset="fixed" safeAreaEdges={["top"]}>
      <Header
        title="Prayer Reminders"
        showBackButton
        rightActions={[
          <Button
            key="add"
            preset="tinted"
            text="Add"
            onPress={handleCreateReminder}
            style={{ marginRight: spacing.sm }}
          />,
        ]}
      />

      {reminders.length === 0 ? (
        <EmptyState
          preset="generic"
          style={{ marginTop: spacing.xxl }}
          heading="No Reminders Set"
          content="Create your first prayer reminder to get notified about prayer times."
          button="Add Reminder"
          buttonOnPress={handleCreateReminder}
        />
      ) : (
        <FlatList
          data={reminders}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ReminderItem reminder={item} onEdit={() => handleEditReminder(item.id)} />
          )}
          contentContainerStyle={{ padding: spacing.md }}
          ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
        />
      )}

      <ReminderFormModal
        isVisible={showFormModal}
        onClose={handleCloseModal}
        editingReminderId={editingReminder}
      />
    </Screen>
  )
})

const $loadingContainer: ViewStyle = {
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  padding: spacing.md,
}
