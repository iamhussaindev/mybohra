import { BackButton } from "app/appComponents/BackButton"
import { Text } from "app/components"
import { colors } from "app/theme"
import React from "react"
import { TextStyle, View, ViewStyle } from "react-native"

export default function Header({
  title,
  showBackButton,
  rightActions,
}: {
  title: React.ReactNode | string
  showBackButton: boolean
  rightActions?: React.ReactNode
}) {
  return (
    <View style={$header}>
      <View style={$headerRight}>{showBackButton && <BackButton style={$headerButton} />}</View>
      {typeof title === "string" ? (
        <View style={$titleContainer}>
          <Text style={$title} size="md" weight="bold">
            {title}
          </Text>
        </View>
      ) : (
        title
      )}

      {<View style={$headerLeft}>{rightActions ?? null}</View>}
    </View>
  )
}

const $headerRight: ViewStyle = {
  display: "flex",
  flexDirection: "row",
  justifyContent: "space-between",
  width: 100,
  height: 60,
}

const $headerLeft: ViewStyle = {
  display: "flex",
  flexDirection: "row",
  justifyContent: "flex-end",
  alignItems: "center",
  width: 100,
  paddingEnd: 15,
}

const $title: TextStyle = {
  marginBottom: 0,
  color: colors.palette.neutral800,
}

const $headerButton: ViewStyle = {
  borderWidth: 0,
  alignItems: "center",
  justifyContent: "center",
  display: "flex",
}

const $titleContainer: ViewStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
}

const $header: ViewStyle = {
  justifyContent: "space-between",
  alignItems: "center",
  flexDirection: "row",
  width: "100%",
  paddingVertical: 10,
  height: 60,
}
