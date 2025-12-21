import { Skeleton } from "app/components"
import { spacing } from "app/theme"
import { useColors } from "app/theme/useColors"
import React from "react"
import { View, ViewStyle } from "react-native"

export function PdfItemCardSkeleton() {
  const colors = useColors()

  return (
    <View style={$pdfCard(colors)}>
      <View style={$pdfCardContent}>
        {/* Icon skeleton */}
        <View style={$pdfIconContainer}>
          <Skeleton style={$iconSkeleton(colors)} width={24} height={24} borderRadius={4} />
        </View>
        {/* Text container skeleton */}
        <View style={$pdfTextContainer}>
          {/* Title skeleton */}
          <Skeleton style={$titleSkeleton(colors)} width="90%" height={15} borderRadius={4} />
          <Skeleton style={$descriptionSkeleton(colors)} width="40%" height={13} borderRadius={4} />

          {/* Timestamp skeleton */}
        </View>
        {/* Options button skeleton */}
        <View style={$bookmarkButtonContainer}>
          {/* <Skeleton width={20} height={20} borderRadius={10} /> */}
        </View>
      </View>
    </View>
  )
}

const $iconSkeleton = (colors: any): ViewStyle => ({
  backgroundColor: colors.palette.neutral300,
})

const $pdfCard = (colors: any): ViewStyle => ({
  marginBottom: spacing.sm,
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.xxs,
  borderColor: colors.border,
})

const $pdfCardContent: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
}

const $pdfIconContainer: ViewStyle = {
  width: 40,
  height: 40,
  justifyContent: "center",
  alignItems: "center",
  marginRight: spacing.md,
}

const $pdfTextContainer: ViewStyle = {
  flex: 1,
  justifyContent: "center",
}

const $titleSkeleton = (colors: any): ViewStyle => ({
  backgroundColor: colors.palette.neutral300,
  marginBottom: spacing.xxs,
})

const $bookmarkButtonContainer: ViewStyle = {
  padding: spacing.xs,
  justifyContent: "center",
  alignItems: "center",
}

const $descriptionSkeleton = (colors: any): ViewStyle => ({
  backgroundColor: colors.palette.neutral300,
  marginVertical: spacing.xxs,
})
