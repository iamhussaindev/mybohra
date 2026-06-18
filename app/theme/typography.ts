// TODO: write documentation about fonts and typography along with guides on how to add custom fonts in own
// markdown file and add links from here

import {
  Sora_300Light as soraLight,
  Sora_400Regular as soraRegular,
  Sora_500Medium as soraMedium,
  Sora_600SemiBold as soraSemiBold,
  Sora_700Bold as soraBold,
  Sora_800ExtraBold as soraExtraBold,
} from "@expo-google-fonts/sora"
import {
  SpaceGrotesk_300Light as spaceGroteskLight,
  SpaceGrotesk_400Regular as spaceGroteskRegular,
  SpaceGrotesk_500Medium as spaceGroteskMedium,
  SpaceGrotesk_600SemiBold as spaceGroteskSemiBold,
  SpaceGrotesk_700Bold as spaceGroteskBold,
} from "@expo-google-fonts/space-grotesk"
import { Platform } from "react-native"

export const customFontsToLoad = {
  spaceGroteskLight,
  spaceGroteskRegular,
  spaceGroteskMedium,
  spaceGroteskSemiBold,
  spaceGroteskBold,
  arabicKanz: require("../../assets/fonts/mJ.ttf"),
  amiriRegular: require("../../assets/fonts/regularamiri.ttf"),

  soraLight,
  soraRegular,
  soraMedium,
  soraSemiBold,
  soraBold,
  soraExtraBold,

  muminoBold: require("../../assets/fonts/UberMoveText-Bold.otf"),
  muminoRegular: require("../../assets/fonts/UberMoveText-Regular.otf"),
  muminoMedium: require("../../assets/fonts/UberMoveText-Medium.otf"),
  muminoLight: require("../../assets/fonts/UberMoveText-Light.otf"),

  muminoHeaderBold: require("../../assets/fonts/UberMove-Bold.otf"),
  muminoHeaderRegular: require("../../assets/fonts/UberMove-Medium.otf"),
}

const fonts = {
  spaceGrotesk: {
    // Cross-platform Google font.
    light: "spaceGroteskLight",
    normal: "spaceGroteskRegular",
    medium: "spaceGroteskMedium",
    semiBold: "spaceGroteskSemiBold",
    bold: "spaceGroteskBold",
  },
  sora: {
    light: "soraLight",
    normal: "soraRegular",
    medium: "soraMedium",
    semiBold: "soraSemiBold",
    bold: "soraBold",
    extraBold: "soraExtraBold",
    black: "soraExtraBold",
  },
  mumino: {
    // Custom font.
    bold: "muminoHeaderBold",
    normal: "muminoHeaderRegular",
    medium: "muminoMedium",
    light: "muminoLight",
    header: "muminoHeaderBold",
    subtitle: "muminoHeaderRegular",
  },
  arabic: {
    kanz: "arabicKanz",
    amiri: "amiriRegular",
  },
  helveticaNeue: {
    // iOS only font.
    thin: "HelveticaNeue-Thin",
    light: "HelveticaNeue-Light",
    normal: "Helvetica Neue",
    medium: "HelveticaNeue-Medium",
  },
  courier: {
    // iOS only font.
    normal: "Courier",
  },
  sansSerif: {
    // Android only font.
    thin: "sans-serif-thin",
    light: "sans-serif-light",
    normal: "sans-serif",
    medium: "sans-serif-medium",
  },
  monospace: {
    // Android only font.
    normal: "monospace",
  },
}

/**
 * Letter spacing configuration for the entire app.
 * This controls the spacing between letters/characters.
 * Adjust this value to change letter spacing app-wide.
 */
export const letterSpacing = {
  /**
   * Default letter spacing for most text.
   */
  default: -0.2,
  /**
   * Tighter letter spacing for headings.
   */
  tight: 0,
  /**
   * Normal letter spacing.
   */
  normal: 0,
  /**
   * Wider letter spacing for emphasis.
   */
  wide: 0.5,
  /**
   * Extra wide letter spacing.
   */
  wider: 1,
}

export const typography = {
  /**
   * The fonts are available to use, but prefer using the semantic name.
   */
  fonts,
  /**
   * The primary font. Used in most places.
   */
  primary: fonts.sora,
  /**
   * An alternate font used for perhaps titles and stuff.
   */
  secondary: fonts.sora,
  /**
   * Lets get fancy with a monospace font!
   */
  code: Platform.select({ ios: fonts.courier, android: fonts.monospace }),

  number: fonts.sora,

  arabic: fonts.arabic,

  /**
   * Letter spacing values for consistent spacing throughout the app.
   */
  letterSpacing,
}
