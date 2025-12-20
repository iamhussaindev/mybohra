import { SBox, Text } from "app/components"
import { spacing } from "app/theme"
import { useColors } from "app/theme/useColors"
import React from "react"
import { Dimensions, Image, ImageStyle, TextStyle, View, ViewStyle } from "react-native"

const screenWidth = Dimensions.get("window").width

function HeroCard(props: { onNavigation: () => void; icon?: any; text?: string }) {
  const colors = useColors()
  const $heroTitle: TextStyle = {
    color: colors.text,
    marginBottom: spacing.xxs,
  }

  const $heroImage: ImageStyle = {
    width: screenWidth / 3 - 64,
    height: screenWidth / 3 - 64,
    objectFit: "contain",
    borderWidth: 2,
    borderColor: "white",
    alignItems: "center",
    borderRadius: 100,
  }

  const $heroCard: ViewStyle = {
    width: screenWidth / 3 - 25,
    height: screenWidth / 3 - 25,
    justifyContent: "center",
    paddingTop: spacing.xxs,
    flexDirection: "column",
  }

  return (
    <SBox
      backgroundColor={colors.palette.neutral100}
      borderColor={colors.border}
      borderRadius={8}
      cornerRadius={0.75}
      height={screenWidth / 3 - 25}
      width={screenWidth / 3 - 25}
      onPress={() => {
        props.onNavigation()
      }}
      style={$heroCard}
    >
      <Text style={$heroTitle} weight="bold" text={props.text} />
      <Image source={props.icon} style={$heroImage} />
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
