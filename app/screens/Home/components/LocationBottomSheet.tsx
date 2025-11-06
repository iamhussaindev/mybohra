import BottomSheetModal, { BottomSheetBackdrop, BottomSheetView } from "@gorhom/bottom-sheet"
import { useStores } from "app/models"
import { colors } from "app/theme"
import { PlainLocation } from "app/types/location"
import React, { useRef, useCallback, forwardRef, useImperativeHandle } from "react"
import { ViewStyle } from "react-native"

import LocationList from "./LocationList"

export interface LocationBottomSheetRef {
  open: () => void
  close: () => void
}

interface LocationBottomSheetProps {
  onLocationSelect?: (location: PlainLocation) => void
}

export const LocationBottomSheet = forwardRef<LocationBottomSheetRef, LocationBottomSheetProps>(
  function LocationBottomSheet({ onLocationSelect }, ref) {
    const bottomSheetModalRef = useRef<BottomSheetModal>(null)
    const { dataStore } = useStores()
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

    const handleItemClick = useCallback(
      (location: PlainLocation) => {
        onLocationSelect?.(location)
        close()
      },
      [onLocationSelect, close],
    )

    return (
      <BottomSheetModal
        backdropComponent={(backdropProps) => (
          <BottomSheetBackdrop {...backdropProps} enableTouchThrough opacity={0.5} />
        )}
        ref={bottomSheetModalRef}
        index={-1}
        snapPoints={["1%", "100%"]}
        backgroundStyle={$bottomSheetBackground}
        handleIndicatorStyle={$bottomSheetIndicator}
        enablePanDownToClose={true}
        enableDynamicSizing={false}
        enableOverDrag={false}
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
        android_keyboardInputMode="adjustResize"
      >
        <BottomSheetView style={$bottomSheetContent}>
          <LocationList
            list={dataStore.locations}
            sheetRef={bottomSheetModalRef}
            handleItemClick={handleItemClick}
          />
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
