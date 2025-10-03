import { ILibrary } from "app/models/LibraryStore"
import { colors, spacing } from "app/theme"
import React, { forwardRef } from "react"
import { Pressable, TextStyle, View, ViewStyle } from "react-native"

import { BottomSheetDrawer } from "./BottomSheetDrawer"

import { Text } from "./"

interface PDFOptionsBottomSheetProps {
  item: ILibrary | null
  onPinToHomeScreen: (item: ILibrary) => void
  onOpen: (item: ILibrary) => void
  onReportPDF: (item: ILibrary) => void
  onClose: () => void
  isPinned?: boolean
}

export const PDFOptionsBottomSheet = forwardRef<any, PDFOptionsBottomSheetProps>(
  function PDFOptionsBottomSheet(
    { item, onPinToHomeScreen, onOpen, onReportPDF, onClose, isPinned = false },
    ref,
  ) {
    if (!item) return null

    const handlePinToHomeScreen = () => {
      onPinToHomeScreen(item)
      onClose()
    }

    const handleOpen = () => {
      onOpen(item)
      onClose()
    }

    const handleReportPDF = () => {
      onReportPDF(item)
      onClose()
    }

    return (
      <BottomSheetDrawer
        ref={ref}
        snapPoints={["25%", "35%"]}
        enablePanDownToClose={true}
        contentContainerStyle={$contentContainer}
      >
        <View style={$header}>
          <Text weight="bold" style={$title}>
            {item.name}
          </Text>
        </View>

        <View style={$optionsContainer}>
          <Pressable style={$optionItem} onPress={handleOpen}>
            <View style={$optionContent}>
              <Text weight="medium" style={$optionTitle}>
                Open
              </Text>
            </View>
          </Pressable>

          <Pressable style={$optionItem} onPress={handlePinToHomeScreen}>
            <View style={$optionContent}>
              <Text weight="medium" style={$optionTitle}>
                {isPinned ? "Unpin from Home Screen" : "Pin to Home Screen"}
              </Text>
            </View>
          </Pressable>

          <Pressable style={$optionItem} onPress={handleReportPDF}>
            <View style={$optionContent}>
              <Text weight="medium" style={$optionTitle}>
                Report This PDF
              </Text>
            </View>
          </Pressable>
        </View>
      </BottomSheetDrawer>
    )
  },
)

const $contentContainer: ViewStyle = {
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.lg,
}

const $header: ViewStyle = {
  marginBottom: spacing.sm,
  paddingBottom: spacing.xs,
  borderBottomWidth: 1,
  borderBottomColor: colors.gray,
  alignItems: "center",
  justifyContent: "center",
}

const $title: TextStyle = {
  fontSize: 18,
  color: colors.palette.neutral900,
  marginBottom: spacing.xs,
}

const $optionsContainer: ViewStyle = {
  gap: spacing.sm,
}

const $optionItem: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  paddingVertical: spacing.xs,
  paddingHorizontal: spacing.sm,
  borderRadius: 8,
  backgroundColor: colors.white,
}

const $optionContent: ViewStyle = {
  flex: 1,
}

const $optionTitle: TextStyle = {
  fontSize: 16,
  color: colors.palette.neutral900,
  marginBottom: 2,
}
