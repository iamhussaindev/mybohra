import React, { useRef, useCallback, forwardRef, useImperativeHandle } from "react"
import { ViewStyle } from "react-native"
import { colors } from "app/theme"
import BottomSheetModal, { BottomSheetView } from "@gorhom/bottom-sheet"
import { LocationList } from "./LocationList"

export interface LocationBottomSheetRef {
  open: () => void
  close: () => void
}

interface LocationBottomSheetProps {
  onLocationSelect?: (location: any) => void
}

export const LocationBottomSheet = forwardRef<LocationBottomSheetRef, LocationBottomSheetProps>(
  function LocationBottomSheet({ onLocationSelect }, ref) {
    const bottomSheetModalRef = useRef<BottomSheetModal>(null)

    const open = useCallback(() => {
      bottomSheetModalRef.current?.expand()
    }, [])

    const close = useCallback(() => {
      bottomSheetModalRef.current?.close()
    }, [])

    useImperativeHandle(ref, () => ({
      open,
      close,
    }))

    const handleLocationSelect = useCallback(
      (location: any) => {
        onLocationSelect?.(location)
        close()
      },
      [onLocationSelect, close],
    )

    return (
      <BottomSheetModal
        ref={bottomSheetModalRef}
        index={-1}
        snapPoints={["1%", "100%"]}
        backgroundStyle={$bottomSheetBackground}
        handleIndicatorStyle={$bottomSheetIndicator}
        enablePanDownToClose={true}
        enableDynamicSizing={false}
        enableOverDrag={false}
      >
        <BottomSheetView style={$bottomSheetContent}>
          <LocationList onLocationSelect={handleLocationSelect} onClose={close} />
        </BottomSheetView>
      </BottomSheetModal>
    )
  },
)

const $bottomSheetBackground: ViewStyle = {
  backgroundColor: colors.background,
}

const $bottomSheetIndicator: ViewStyle = {
  backgroundColor: colors.border,
}

const $bottomSheetContent: ViewStyle = {
  flex: 1,
}
