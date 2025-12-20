import { useTheme } from "app/contexts/ThemeContext"

import { colors } from "./colors"
import { darkColors } from "./colors.dark"

export function useColors() {
  const { isDark } = useTheme()
  return isDark ? darkColors : colors
}
