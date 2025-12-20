import { colors, spacing } from "app/theme"
import { ViewStyle } from "react-native"

export const shadowProps: ViewStyle = {
  shadowOpacity: 0.05,
  shadowRadius: 4,
  shadowOffset: { width: 0, height: 5 },
  backgroundColor: colors.white,
  borderRadius: spacing.lg,
  borderWidth: 1,
  borderCurve: "continuous",
  borderColor: colors.border,
}
