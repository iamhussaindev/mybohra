// TODO: write documentation about fonts and typography along with guides on how to add custom fonts in own
// markdown file and add links from here

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

  muminoBold: require("../../assets/fonts/UberMoveText-Bold.otf"),
  muminoRegular: require("../../assets/fonts/UberMoveText-Regular.otf"),
  muminoMedium: require("../../assets/fonts/UberMoveText-Medium.otf"),
  muminoLight: require("../../assets/fonts/UberMoveText-Light.otf"),

  muminoHeaderBold: require("../../assets/fonts/UberMove-Bold.otf"),
  muminoHeaderRegular: require("../../assets/fonts/UberMove-Medium.otf"),

  satoshiLight: require("../../assets/fonts/Satoshi-Light.otf"),
  satoshiRegular: require("../../assets/fonts/Satoshi-Regular.otf"),
  satoshiMedium: require("../../assets/fonts/Satoshi-Medium.otf"),
  satoshiBold: require("../../assets/fonts/Satoshi-Bold.otf"),
  satoshiBlack: require("../../assets/fonts/Satoshi-Black.otf"),
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
  satoshi: {
    light: "satoshiLight",
    normal: "satoshiRegular",
    medium: "satoshiMedium",
    bold: "satoshiBold",
    black: "satoshiBlack",
  },
}

export const typography = {
  /**
   * The fonts are available to use, but prefer using the semantic name.
   */
  fonts,
  /**
   * The primary font. Used in most places.
   */
  primary: fonts.satoshi,
  /**
   * An alternate font used for perhaps titles and stuff.
   */
  secondary: Platform.select({ ios: fonts.helveticaNeue, android: fonts.sansSerif }),
  /**
   * Lets get fancy with a monospace font!
   */
  code: Platform.select({ ios: fonts.courier, android: fonts.monospace }),

  number: fonts.spaceGrotesk,

  arabic: fonts.arabic,
}
