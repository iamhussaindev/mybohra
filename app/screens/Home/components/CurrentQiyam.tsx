import { Text } from "app/components"
import { colors, spacing } from "app/theme"
import React from "react"
import { View, ViewStyle } from "react-native"


export default function CurrentQiyam(props: { qiyam?: string }) {
  return (
    <View style={$container}>
      <View style={$borderLeft}></View>
      <Text tx="qiyam.label" />
      <Text weight="bold" style={$valueColor} size="lg" text={props.qiyam} />
    </View>
  )
}

const $valueColor = {
  color: colors.palette.primary500,
}

const $borderLeft: ViewStyle = {
  width: 5,
  marginStart: spacing.lg,
  backgroundColor: colors.palette.primary500,
  borderTopEndRadius: 10,
  borderBottomEndRadius: 10,
  height: 80,
  position: "absolute",
}

const $container: ViewStyle = {
  height: 80,
  marginTop: spacing.xs,
  paddingStart: spacing.xxl,
  paddingEnd: spacing.lg,
  justifyContent: "center",
  marginBottom: spacing.xl,
}
