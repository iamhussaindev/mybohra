import { ILibrary, useStores } from "app/models"
import { AppStackScreenProps } from "app/navigators"
import { useCallback, useRef, useState } from "react"
import { Alert } from "react-native"
import ReactNativeHapticFeedback from "react-native-haptic-feedback"

interface UsePdfOptionsBottomSheetProps {
  navigation: AppStackScreenProps<any>["navigation"]
}

/**
 * Custom hook for managing PDF options bottom sheet
 * Provides all handlers and state needed for the bottom sheet functionality
 */
export function usePdfOptionsBottomSheet({ navigation }: UsePdfOptionsBottomSheetProps) {
  const { dataStore } = useStores()
  const [selectedItem, setSelectedItem] = useState<ILibrary | null>(null)
  const bottomSheetRef = useRef<any>(null)

  const handleItemLongPress = useCallback((item: ILibrary) => {
    if (item.pdf_url) {
      // Trigger haptic feedback
      ReactNativeHapticFeedback.trigger("impactLight", {
        enableVibrateFallback: true,
        ignoreAndroidSystemSettings: false,
      })

      console.log("Long press detected, opening bottom sheet for:", item.name)
      setSelectedItem(item)
      // Small delay to ensure state is updated
      console.log("Attempting to open bottom sheet, ref:", !!bottomSheetRef.current)
      // Try to expand the bottom sheet
      try {
        bottomSheetRef.current?.expand()
      } catch (error) {
        console.log("Error expanding bottom sheet:", error)
        // Fallback to snapToIndex - use index 1 for the expanded state
        bottomSheetRef.current?.snapToIndex(1)
      }
    }
  }, [])

  const handlePinToHomeScreen = useCallback(
    (item: ILibrary) => {
      ReactNativeHapticFeedback.trigger("impactLight", {
        enableVibrateFallback: true,
        ignoreAndroidSystemSettings: false,
      })

      if (dataStore.isPdfPinned(item.id)) {
        dataStore.unpinPdf(item.id)
        Alert.alert("Unpinned", `"${item.name}" has been unpinned from your home screen.`, [
          { text: "OK" },
        ])
      } else {
        dataStore.pinPdf(item)
        Alert.alert("Pinned", `"${item.name}" has been pinned to your home screen.`, [
          { text: "OK" },
        ])
      }
    },
    [dataStore],
  )

  const handleCloseBottomSheet = useCallback(() => {
    console.log("Closing bottom sheet")
    setSelectedItem(null)
    bottomSheetRef.current?.close()
  }, [])

  const handleOpenPDF = useCallback(
    (item: ILibrary) => {
      return navigation.navigate("PdfViewer", {
        id: item.id,
        name: item.name,
        description: item.description,
        audio_url: item.audio_url ?? "",
        pdf_url: item.pdf_url ?? "",
        youtube_url: item.youtube_url ?? "",
        metadata: item.metadata,
        tags: item.tags ?? [],
        categories: item.categories ?? [],
      })
    },
    [navigation],
  )

  const handleReportPDF = useCallback((item: ILibrary) => {
    Alert.alert("Report PDF", `Report issues with "${item.name}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Report",
        style: "destructive",
        onPress: () => {
          // TODO: Implement report functionality
          Alert.alert("Thank you", "Your report has been submitted.")
        },
      },
    ])
  }, [])

  const isPinned = selectedItem ? dataStore.isPdfPinned(selectedItem.id) : false

  return {
    bottomSheetRef,
    selectedItem,
    handleItemLongPress,
    handlePinToHomeScreen,
    handleCloseBottomSheet,
    handleOpenPDF,
    handleReportPDF,
    isPinned,
  }
}
