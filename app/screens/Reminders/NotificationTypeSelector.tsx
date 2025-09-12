import { BottomSheetFlatList } from "@gorhom/bottom-sheet"
import { Text } from "app/components"
import { colors, spacing } from "app/theme"
import React from "react"
import { Pressable, TextStyle, ViewStyle } from "react-native"

const NotificationTypeSelector = ({
  setNotificationType,
}: {
  setNotificationType: (offset: "long" | "short") => void
}) => {
  const handleNotificationTypePress = (offset: "long" | "short") => {
    setNotificationType(offset)
  }

  return (
    <BottomSheetFlatList
      contentContainerStyle={$contentStyle}
      style={$contentStyle}
      data={["long", "short"]}
      renderItem={({ item, index }) => {
        return (
          <Pressable
            onPress={() => handleNotificationTypePress(item as "long" | "short")}
            style={$offsetItem}
            key={index}
          >
            <Text style={$offsetText}>{item === "long" ? "Azan" : "Alert"}</Text>
            <Text style={$offsetSubtext}>
              {item === "long" ? "Azan will be played" : "Notification will be played"}
            </Text>
          </Pressable>
        )
      }}
      showsVerticalScrollIndicator={false}
    />
  )
}

const $contentStyle: ViewStyle = {
  backgroundColor: colors.background,
  paddingBottom: spacing.xl,
}

const $offsetItem: ViewStyle = {
  paddingVertical: spacing.md,
  paddingHorizontal: spacing.lg,
  borderBottomWidth: 0.5,
  borderBottomColor: colors.palette.neutral200,
  alignItems: "center",
  justifyContent: "space-between",
  flexDirection: "row",
}

const $offsetText: TextStyle = {
  fontSize: 18,
  fontWeight: "600",
  color: colors.text,
  marginBottom: spacing.xs,
}

const $offsetSubtext: TextStyle = {
  fontSize: 14,
  color: colors.palette.neutral600,
}

export default NotificationTypeSelector
