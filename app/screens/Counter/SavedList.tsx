import { Screen, Text } from "app/components"
import Header from "app/components/Header"
import { AppStackScreenProps } from "app/navigators"
import { observer } from "mobx-react-lite"
import React, { FC } from "react"
import { View, ViewStyle, Dimensions } from "react-native"

import { useStores } from "app/models"

interface SavedTasbeehScreenProps extends AppStackScreenProps<"SavedTasbeeh"> {}

export const SavedTasbeehScreen: FC<SavedTasbeehScreenProps> = observer(
  function SavedTasbeehScreen() {
    const { tasbeehStore } = useStores()
    const savedList = tasbeehStore.savedList

    console.log("savedList", savedList)

    return (
      <Screen
        preset="fixed"
        backgroundColor="rgb(254, 244, 227)"
        safeAreaEdges={["top"]}
        contentContainerStyle={$screenContainer}
      >
        <Header title="Saved Tasbeeh" showBackButton rightActions={<View />} />
        <View style={$listContainer}>
          {savedList.map((item) => (
            <View key={item.tasbeeh.id}>
              <Text>{item.count}</Text>
            </View>
          ))}
        </View>
      </Screen>
    )
  },
)

const $screenContainer: ViewStyle = {
  backgroundColor: "rgb(254, 244, 227)",
  flex: 1,
  height: Dimensions.get("screen").height,
}

const $listContainer: ViewStyle = {
  paddingHorizontal: 20,
  paddingVertical: 20,
}
