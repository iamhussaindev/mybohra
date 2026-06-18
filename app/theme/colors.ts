// Canonical brand palette — see mybohra.md
export const brandPalette = {
  primary: "#B0271A",
  gradientStart: "#B0271A",
  gradientEnd: "#7F0E03",
  background: "#F6EEDB",
  accent: "#B78034",
  text: "#0F0808",
} as const

const palette = {
  neutral100: "#FFFFFF",
  neutral200: "#FEF6D5",
  neutral300: "#F5EDD0",
  neutral400: "#C4B5A8",
  neutral500: "#978F8A",
  neutral600: "#6B5E5C",
  neutral700: "#3D2E2D",
  neutral800: "#0F0808",
  neutral900: "#000000",

  primary10: "#FDF0EF",
  primary20: "#FAD9D6",
  primary30: "#F5B8B3",
  primary40: "#EE948C",
  primary50: "#E57065",
  primary100: "#D9584B",
  primary200: "#CF4537",
  primary300: "#C73527",
  primary400: "#BC2E20",
  primary500: "#B0271A",
  primary600: "#9A2217",
  primary700: "#7F0E03",
  primary800: "#5C0A02",
  primary900: "#3D0701",
  primary950: "#260401",

  secondary100: "#F5EDE0",
  secondary200: "#EBD9BC",
  secondary300: "#DFC299",
  secondary400: "#D3AB76",
  secondary500: "#FEF6D5",

  accent100: "#F5EDE0",
  accent200: "#EBD9BC",
  accent300: "#DFC299",
  accent400: "#D3AB76",
  accent500: "#B78034",

  accent600: "#9A6D2D",
  accent700: "#7D5825",
  accent800: "#60441C",
  accent900: "#4A3516",
  accent950: "#352710",

  angry100: "#F2D6CD",
  angry500: "#C03403",

  overlay20: "rgba(25, 16, 21, 0.2)",
  overlay50: "rgba(25, 16, 21, 0.5)",

  brown100: "#FAE3BA",
  brown200: "#F5D9A5",
  brown300: "#F0CF90",
  brown400: "#EBCA8B",
  brown500: "#664100",
  brown600: "#E6B576",
  brown700: "#E1AF6C",
  brown800: "#B37400",
  brown900: "#DA9958",
  brown1000: "#E69600",
  brown1100: "#FFA700",
  brown1200: "#FFB800",
  brown1300: "#FFC900",
  brown1400: "#FFDA00",
} as const

export const colors = {
  brown: brandPalette.accent,
  // tab colors
  tabBorder: "#F5EDD0",
  tabBackground: "#ffffff",
  tabBackgroundActive: "#F5EDD0",

  absoluteWhite: "#ffffff",
  accentBackground: palette.accent100,
  /**
   * The palette is available to use, but prefer using the name.
   * This is only included for rare, one-off cases. Try to use
   * semantic names as much as possible.
   */
  palette,

  white: "#FFFFFF",

  gray: "#F5EDD0",

  yellow: "#f0932b", // rgba(240, 147, 43, 1)

  lightgray: "#edf0f6",
  /**
   * A helper for making something see-thru.
   */
  transparent: "rgba(0, 0, 0, 0)",
  /**
   * The default text color in many components.
   */
  text: brandPalette.text,
  /**
   * Secondary text information.
   */
  textDim: palette.neutral700,
  /**
   * The default color of the screen background.
   */
  background: brandPalette.background,

  /**
   * The background color of the highlighted item.
   */
  backgroundHighlight: palette.accent100,
  /**
   * The default border color.
   */

  darkHighlight: "#ffffff",

  border: "#E8D9B8",
  /**
   * The main tinting color.
   */
  tint: palette.primary500,

  tintText: palette.primary500,
  /**
   * A subtle color used for lines.
   */
  separator: palette.neutral300,
  /**
   * Error messages.
   */
  error: palette.angry500,
  /**
   * Error Background.
   *
   */
  errorBackground: palette.angry100,

  green: "#06954f",

  switchGreen: "#3ebd89",
  switchBackground: "#cdd1e2",

  audioPlayerBackground: "#131E3A",
}

// Export dark colors
export { darkColors } from "./colors.dark"
