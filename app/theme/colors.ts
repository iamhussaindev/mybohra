// TODO: write documentation for colors and palette in own markdown file and add links from here

const palette = {
  neutral100: "#FFFFFF",
  neutral200: "#F4F2F1",
  neutral300: "#D7CEC9",
  neutral400: "#B6ACA6",
  neutral500: "#978F8A",
  neutral600: "#564E4A",
  neutral700: "#3C3836",
  neutral800: "#191015",
  neutral900: "#000000",

  primary10: "#fff7f2",
  primary20: "#fff4ef",
  primary30: "#fff2eb",
  primary40: "#fff0e7",
  primary50: "#ffede4",
  primary100: "#ffe2d2",
  primary200: "#ffcbae",
  primary300: "#ffb38a",
  primary400: "#ff9c66",
  primary500: "#ff5a00",
  primary600: "#d94d00",
  primary700: "#ad3d00",
  primary800: "#812e00",
  primary900: "#561e00",
  primary950: "#401700",

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
  textDim: palette.neutral600,
  /**
   * The default color of the screen background.
   */
  background: palette.neutral100,
  /**
   * The default border color.
   */
  border: "#E9E9E9",
  /**
   * The main tinting color.
   */
  tint: palette.primary500,
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
}
