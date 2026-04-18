// TODO: write documentation for colors and palette in own markdown file and add links from here

const palette = {
  neutral100: "#FFFFFF",
  neutral200: "#F4F2F1",
  neutral300: "#f4f5f9",
  neutral400: "#B6ACA6",
  neutral500: "#978F8A",
  neutral600: "#564E4A",
  neutral700: "#3C3836",
  neutral800: "#191015",
  neutral900: "#000000",

  primary10: "#fdf2f7",
  primary20: "#fce8f1",
  primary30: "#fbdbeb",
  primary40: "#f8cfe3",
  primary50: "#f5c2db",
  primary100: "#eda5cb",
  primary200: "#e07fb0",
  primary300: "#d15596",
  primary400: "#c02b7b",
  primary500: "#AB0256",
  primary600: "#8a0145",
  primary700: "#690135",
  primary800: "#480124",
  primary900: "#270012",
  primary950: "#1a000c",

  secondary100: "#f7eee3",
  secondary200: "#BCC0D6",
  secondary300: "#9196B9",
  secondary400: "#626894",
  secondary500: "#f4ede3",

  accent100: "#fde9dc",
  accent200: "#F9E9BF",
  accent300: "#F5DB99",
  accent400: "#F1CE72",
  accent500: "#471515",

  accent600: "#D6A946",
  accent700: "#B28B3B",
  accent800: "#8E6D30",
  accent900: "#755A28",
  accent950: "#5B471E",

  angry100: "#F2D6CD",
  angry500: "#C03403",

  overlay20: "rgba(25, 16, 21, 0.2)",
  overlay50: "rgba(25, 16, 21, 0.5)",
} as const

export const colors = {
  // tab colors
  tabBorder: "#eff2f6",
  tabBackground: "#ffffff",
  tabBackgroundActive: "#eff2f6",

  absoluteWhite: "#ffffff",
  accentBackground: "rgb(254, 244, 227)",
  /**
   * The palette is available to use, but prefer using the name.
   * This is only included for rare, one-off cases. Try to use
   * semantic names as much as possible.
   */
  palette,

  white: "#FFFFFF",

  gray: "#f4f5f9",

  yellow: "#f0932b", // rgba(240, 147, 43, 1)

  lightgray: "#edf0f6",
  /**
   * A helper for making something see-thru.
   */
  transparent: "rgba(0, 0, 0, 0)",
  /**
   * The default text color in many components.
   */
  text: palette.neutral800,
  /**
   * Secondary text information.
   */
  textDim: palette.neutral700,
  /**
   * The default color of the screen background.
   */
  background: palette.neutral100,

  /**
   * The background color of the highlighted item.
   */
  backgroundHighlight: "#f3eae1",
  /**
   * The default border color.
   */

  darkHighlight: "#ffffff",

  border: "#ced0e5",
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
