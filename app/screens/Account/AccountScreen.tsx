import React from "react"
import { Text } from "app/components"
import { View } from "react-native"
import { $centerScreen } from "app/theme/styling"

export function AccountScreen() {
  return (
    <View style={$centerScreen}>
      <Text>Account Screen</Text>
    </View>
  )
}
