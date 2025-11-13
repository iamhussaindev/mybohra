// Example usage of BottomSheetDrawer component

import { BottomSheetDrawer } from "app/components"
import React, { useRef } from "react"
import { Pressable, Text, View } from "react-native"

export function BottomSheetDrawerExample() {
  const bottomSheetRef = useRef<React.ElementRef<typeof BottomSheetDrawer>>(null)

  const openBottomSheet = () => {
    bottomSheetRef.current?.expand()
  }

  const closeBottomSheet = () => {
    bottomSheetRef.current?.close()
  }

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Pressable onPress={openBottomSheet}>
        <Text>Open Bottom Sheet</Text>
      </Pressable>

      <BottomSheetDrawer
        ref={bottomSheetRef}
        snapPoints={["25%", "50%", "90%"]}
        onClose={() => console.log("Bottom sheet closed")}
      >
        <View style={{ padding: 20 }}>
          <Text>Bottom Sheet Content</Text>
          <Pressable onPress={closeBottomSheet}>
            <Text>Close</Text>
          </Pressable>
        </View>
      </BottomSheetDrawer>
    </View>
  )
}
