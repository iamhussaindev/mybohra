import { Text } from "app/components"
import { spacing } from "app/theme"
import { useColors } from "app/theme/useColors"
import React from "react"
import { TextStyle, View, ViewStyle } from "react-native"

export default function CurrentQiyam(props: { qiyam?: string }) {
  const colors = useColors()
  return (
    <View style={getContainer()}>
      <View style={getBorderLeft(colors)}></View>
      <Text style={getTextStyle(colors)} tx="qiyam.label" />
      <Text weight="bold" style={getValueColor(colors)} size="lg" text={props.qiyam} />
    </View>
  )
}

const getTextStyle = (colors: any): TextStyle => ({
  color: colors.text,
})

const getValueColor = (colors: any): TextStyle => ({
  color: colors.palette.primary500,
})

const getBorderLeft = (colors: any): ViewStyle => ({
  width: 5,
  marginStart: spacing.lg,
  backgroundColor: colors.palette.primary500,
  borderTopEndRadius: 10,
  borderBottomEndRadius: 10,
  height: 80,
  position: "absolute",
})

const getContainer = (): ViewStyle => ({
  height: 80,
  marginTop: spacing.xs,
  paddingStart: spacing.xxl,
  paddingEnd: spacing.lg,
  justifyContent: "center",
  marginBottom: spacing.xl,
})
