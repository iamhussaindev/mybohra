import { Card, Text } from "app/components"
import { colors, spacing } from "app/theme"
import React from "react"
import { Dimensions, Image, ImageStyle, TextStyle, View, ViewStyle } from "react-native"

const screenWidth = Dimensions.get("window").width

function HeroCard(props: { onNavigation: () => void; icon?: any; text?: string }) {
  const $heroTitle: TextStyle = {
    color: colors.text,
    marginBottom: spacing.xs,
  }

  const $heroImage: ImageStyle = {
    width: "80%",
    height: "80%",
    objectFit: "cover",
  }

  const $heroCard: ViewStyle = {
    width: screenWidth / 3 - 25,
    height: screenWidth / 3 - 25,
    justifyContent: "center",
    flexDirection: "column",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 5 },
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  }
  return (
    <Card
      onPress={() => {
        props.onNavigation()
      }}
      style={$heroCard}
    >
      <Text style={$heroTitle} weight="bold" text={props.text} />
      <Image source={props.icon} style={$heroImage} />
    </Card>
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
        onNavigation={() => onNavigation("DuaList")}
        text="Duas"
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
