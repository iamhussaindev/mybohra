import React from "react"
import { Text } from "app/components"
import { View } from "react-native"
import { $centerScreen } from "app/theme/styling"

export function MarketScreen() {
  return (
    <View style={$centerScreen}>
      <Text>Market Screen</Text>
    </View>
  )
}
