import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet"
import { IconMapPin } from "@tabler/icons-react-native"
import { Text } from "app/components"
import { navigationRef } from "app/navigators/navigationUtilities"
import { spacing } from "app/theme"
import { useColors } from "app/theme/useColors"
import { useMazaarStore } from "app/store"
import React, { useCallback, useMemo, useRef } from "react"
import { Pressable, TextStyle, View, ViewStyle } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

export function MazaarContextualSheet() {
  const colors = useColors()
  const insets = useSafeAreaInsets()
  const sheetRef = useRef<BottomSheet>(null)
  const { currentMazaar, isInsideMazaar } = useMazaarStore()

  const snapPoints = useMemo(() => ["12%", "28%", "55%"], [])

  const openDetail = useCallback(() => {
    if (!currentMazaar?.lat || !currentMazaar?.lng) return
    if (!navigationRef.isReady()) return

    navigationRef.navigate("MazarDetail", {
      id: currentMazaar.id,
      name: currentMazaar.name,
      imageUri: currentMazaar.photos?.[0] ?? null,
      latitude: currentMazaar.lat,
      longitude: currentMazaar.lng,
    })
  }, [currentMazaar])

  if (!isInsideMazaar || !currentMazaar) return null

  return (
    <BottomSheet
      ref={sheetRef}
      index={1}
      snapPoints={snapPoints}
      enablePanDownToClose={false}
      backgroundStyle={{ backgroundColor: colors.background }}
      handleIndicatorStyle={{ backgroundColor: colors.palette.neutral400 }}
    >
      <BottomSheetScrollView
        contentContainerStyle={[$content, { paddingBottom: insets.bottom + spacing.md }]}
      >
        <View style={$header}>
          <IconMapPin size={20} color={colors.tint} />
          <Text weight="bold" size="md" style={[$title, { color: colors.text }]}>
            You are near {currentMazaar.name}
          </Text>
        </View>
        <Text size="sm" style={{ color: colors.textDim }}>
          View ziyarats, nearby musafirkhanas, halal food, and shops for this mazaar.
        </Text>
        <Pressable onPress={openDetail} style={[$cta, { backgroundColor: colors.tint }]}>
          <Text weight="bold" style={$ctaText}>
            Open mazaar guide
          </Text>
        </Pressable>
      </BottomSheetScrollView>
    </BottomSheet>
  )
}

const $content: ViewStyle = {
  paddingHorizontal: spacing.lg,
  gap: spacing.sm,
}

const $header: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  gap: spacing.xs,
}

const $title: TextStyle = {
  flex: 1,
}

const $cta: ViewStyle = {
  marginTop: spacing.sm,
  borderRadius: spacing.sm,
  paddingVertical: spacing.sm,
  alignItems: "center",
}

const $ctaText: TextStyle = {
  color: "#fff",
}
