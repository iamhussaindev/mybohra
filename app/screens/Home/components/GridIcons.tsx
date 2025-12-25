import { Text } from "app/components"
import { spacing } from "app/theme"
import { useColors } from "app/theme/useColors"
import React from "react"
import { Image, ImageStyle, Pressable, TextStyle, View, ViewStyle } from "react-native"

const data = [
  { key: "1", name: "Library", icon: require(`../../../../assets/images/audio.png`) },
  { key: "2", name: "Quran", icon: require(`../../../../assets/images/quran.png`) },
  { key: "3", name: "Qibla", icon: require(`../../../../assets/images/qibla.png`) },
  { key: "4", name: "Counter", icon: require(`../../../../assets/images/counter.png`) },
  { key: "5", name: "Tasbeeh", icon: require(`../../../../assets/images/tasbeeh.png`) },
  { key: "6", name: "Halal Food", icon: require(`../../../../assets/images/sadqah.png`) },
  { key: "7", name: "Miqaats", icon: require(`../../../../assets/images/miqaats.png`) },
  { key: "8", name: "Mazaar", icon: require(`../../../../assets/images/mazaar.png`) },
]

export default function GridIcons({ onNavigation }: { onNavigation: (screen: any) => void }) {
  const colors = useColors()
  return (
    <View style={$container}>
      {data?.map((item) => (
        <Pressable onPress={() => onNavigation(item.name)} key={item.key} style={$itemContainer}>
          <Image source={item.icon} style={getIcon()} />
          <Text size="xs" style={getTextStyle(colors)}>
            {item.name}
          </Text>
        </Pressable>
      ))}
    </View>
  )
}

const $container: ViewStyle = {
  marginHorizontal: spacing.xs, // Use the spacing from your theme
  display: "flex",
  flexDirection: "row",
  marginBottom: spacing.sm,
  flexWrap: "wrap",
}

const $itemContainer: ViewStyle = {
  justifyContent: "space-around",
  marginBottom: spacing.lg,
  width: "25%",
  alignItems: "center",
}

const getIcon = (): ImageStyle => ({
  width: 60,
  height: 60,
  marginBottom: spacing.sm,
  borderRadius: 100,
  borderWidth: 2,
  borderColor: "white",
  alignItems: "center",
})

const getTextStyle = (colors: any): TextStyle => ({
  color: colors.text,
})
