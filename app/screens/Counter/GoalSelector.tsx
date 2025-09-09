import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetFlatList,
  SCREEN_WIDTH,
} from "@gorhom/bottom-sheet"
import { Text } from "app/components"
import React from "react"
import { Pressable, TextStyle, ViewStyle } from "react-native"



const GoalSelector = ({
  setGoal,
  sheetRef,
}: {
  setGoal: (goal: number) => void
  sheetRef: React.RefObject<BottomSheet>
}) => {
  const handleCloseBottomSheet = () => {
    sheetRef.current?.close()
  }

  const handleGoalPress = (goal: number) => {
    setGoal(goal)
    sheetRef.current?.close()
  }

  return (
    <BottomSheet
      backdropComponent={(backdropProps) => (
        <BottomSheetBackdrop {...backdropProps} enableTouchThrough={true} opacity={0.5} />
      )}
      onClose={handleCloseBottomSheet}
      ref={sheetRef}
      handleStyle={$handleIndicatorStyle}
      enablePanDownToClose
      index={-1}
      snapPoints={["25%", "50%"]}
    >
      <BottomSheetFlatList
        contentContainerStyle={$contentStyle}
        style={$contentStyle}
        initialScrollIndex={0}
        data={[20, 33, 40, 53, 100, 200, 500, 1000, 10000]}
        renderItem={({ item, index }) => {
          return (
            <Pressable onPress={() => handleGoalPress(item)} style={$tasbeehGoalItem} key={index}>
              <Text style={$tasbeehGoalText}>{item}</Text>
            </Pressable>
          )
        }}
        getItemLayout={(data, index) => ({
          length: SCREEN_WIDTH / 3,
          offset: (SCREEN_WIDTH / 3) * index,
          index,
        })}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
      />
    </BottomSheet>
  )
}

export const $handleIndicatorStyle: ViewStyle = {
  backgroundColor: "rgb(254, 244, 227)",
  borderTopLeftRadius: 10,
  borderTopRightRadius: 10,
}

const $contentStyle: ViewStyle = {
  backgroundColor: "rgb(254, 244, 227)",
}

const $tasbeehGoalItem: ViewStyle = {
  padding: 15,
  justifyContent: "center",
  alignItems: "center",
  display: "flex",
}

const $tasbeehGoalText: TextStyle = {
  fontSize: 40,
  lineHeight: 40,
}

export default GoalSelector
