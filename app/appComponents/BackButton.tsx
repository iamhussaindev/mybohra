import { useNavigation } from "@react-navigation/native"
import { Button, Icon } from "app/components"
import { useColors } from "app/theme/useColors"
import React from "react"
import { ViewStyle } from "react-native"

export function BackButton({ style }: { style?: ViewStyle }) {
  const navigation = useNavigation()
  const colors = useColors()
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
      <Icon color={colors.text} icon="caretLeft" size={24} />
    </Button>
  )
}

const $calendarLeftButton: ViewStyle = {
  borderRadius: 10,
  display: "flex",
  justifyContent: "flex-end",
  backgroundColor: "transparent",
}

const $pressedCalendarLeftButton: ViewStyle = {}
