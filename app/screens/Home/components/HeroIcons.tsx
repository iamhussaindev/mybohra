import React from "react"
import { Card, Text } from "app/components"
import { Dimensions, Image, ImageStyle, TextStyle, View, ViewStyle } from "react-native"
import { colors, spacing } from "app/theme"

const screenWidth = Dimensions.get("window").width

function HeroCard(props: { onNavigation: () => void; icon?: any; text?: string }) {
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
  return (
    <View style={$heroIconContainer}>
      <HeroCard
        onNavigation={() => onNavigation("Calendar")}
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

const $heroTitle: TextStyle = {
  color: colors.palette.neutral800,
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
}

const $heroIconContainer: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-between",
  marginHorizontal: spacing.lg,
  marginTop: 20,
}
