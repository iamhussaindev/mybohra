import BottomSheet, { BottomSheetBackdrop, BottomSheetView } from "@gorhom/bottom-sheet"
import { colors } from "app/theme"
import React, { forwardRef, ReactNode } from "react"
import { ViewStyle } from "react-native"

interface BottomSheetDrawerProps {
  children: ReactNode
  snapPoints?: string[]
  enablePanDownToClose?: boolean
  onClose?: () => void
  handleStyle?: ViewStyle
  contentContainerStyle?: ViewStyle
}

export const BottomSheetDrawer = forwardRef<BottomSheet, BottomSheetDrawerProps>(
  function BottomSheetDrawer(
    {
      children,
      snapPoints = ["25%", "50%", "90%"],
      enablePanDownToClose = true,
      onClose,
      handleStyle = $defaultHandleStyle,
      contentContainerStyle = $defaultContentStyle,
    },
    ref,
  ) {
    const handleCloseBottomSheet = () => {
      if (onClose) {
        onClose()
      }
    }

    return (
      <BottomSheet
        ref={ref}
        backdropComponent={(backdropProps) => (
          <BottomSheetBackdrop {...backdropProps} enableTouchThrough={true} opacity={0.5} />
        )}
        onClose={handleCloseBottomSheet}
        handleStyle={handleStyle}
        enablePanDownToClose={enablePanDownToClose}
        index={-1}
        snapPoints={snapPoints}
      >
        <BottomSheetView style={contentContainerStyle}>{children}</BottomSheetView>
      </BottomSheet>
    )
  },
)

const $defaultHandleStyle: ViewStyle = {
  backgroundColor: colors.background,
  borderTopLeftRadius: 16,
  borderTopRightRadius: 16,
}

const $defaultContentStyle: ViewStyle = {
  backgroundColor: colors.background,
  flex: 1,
}

export default BottomSheetDrawer
