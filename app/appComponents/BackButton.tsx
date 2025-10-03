import { useNavigation } from "@react-navigation/native"
import { Button, Icon } from "app/components"
import { colors } from "app/theme"
import React from "react"
import { ViewStyle } from "react-native"

export function BackButton({ style }: { style?: ViewStyle }) {
  const navigation = useNavigation()

  return (
    <Button
      style={[$calendarLeftButton, style]}
      pressedStyle={$pressedCalendarLeftButton}
      onPress={() => {
        if (navigation.canGoBack()) {
          navigation.goBack()
        } else {
          navigation.navigate("Tabs" as never)
        }
      }}
    >
      <Icon icon="caretLeft" size={24} />
    </Button>
  )
}

const $calendarLeftButton: ViewStyle = {
  borderRadius: 10,
  display: "flex",
  justifyContent: "flex-end",
  backgroundColor: colors.transparent,
}

const $pressedCalendarLeftButton: ViewStyle = {
  backgroundColor: colors.palette.neutral100,
}
