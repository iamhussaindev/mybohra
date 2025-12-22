import { SBox, Text } from "app/components"
import { spacing } from "app/theme"
import { useColors } from "app/theme/useColors"
import React from "react"
import { Dimensions, Image, ImageStyle, TextStyle, View, ViewStyle } from "react-native"

const screenWidth = Dimensions.get("window").width

function HeroCard(props: { onNavigation: () => void; icon?: any; text?: string }) {
  const colors = useColors()
  const $heroTitle: TextStyle = {
    color: colors.darkHighlight,
    fontWeight: "600",
    zIndex: 10,
  }

  const $heroImage: ImageStyle = {
    width: screenWidth / 3 - 72,
    height: screenWidth / 3 - 72,
    objectFit: "contain",
    alignItems: "center",
  }

  const $heroCard: ViewStyle = {
    width: screenWidth / 3 - 25,
    height: screenWidth / 3 - 25,
    justifyContent: "center",
    position: "relative",
    paddingTop: spacing.xxs,
    flexDirection: "column",
  }

  return (
    <SBox
      backgroundColor={colors.palette.primary10}
      borderRadius={8}
      borderColor={colors.palette.primary100}
      cornerRadius={0.75}
      height={screenWidth / 3 - 25}
      width={screenWidth / 3 - 25}
      onPress={() => {
        props.onNavigation()
      }}
      style={$heroCard}
    >
      <Image source={props.icon} style={$heroImage} />
      <Text style={$heroTitle} weight="bold" text={props.text} />
    </SBox>
  )
}

export default function HeroIcons({ onNavigation }: { onNavigation: (screen: any) => void }) {
  const $heroIconContainer: ViewStyle = {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: spacing.lg,
    marginTop: 20,
    marginBottom: spacing.lg,
  }

  return (
    <View style={$heroIconContainer}>
      <HeroCard
        onNavigation={() => onNavigation("DuaHome")}
        text="PDFs"
        icon={require("../../../../assets/images/duas.png")}
      />
      <HeroCard
        onNavigation={() => onNavigation("Calendar")}
        text="Calendar"
        icon={require("../../../../assets/images/calendar.png")}
      />
      <HeroCard
        onNavigation={() => onNavigation("Namaz")}
        text="Namaz"
        icon={require("../../../../assets/images/namaz.png")}
      />
    </View>
  )
}
