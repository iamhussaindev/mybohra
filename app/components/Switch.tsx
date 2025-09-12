import React from "react"
import { Switch as RNSwitch, SwitchProps, ViewStyle, TextStyle, View } from "react-native"

import { colors, spacing } from "../theme"

import { Text } from "./Text"

export interface SwitchComponentProps extends Omit<SwitchProps, "onValueChange"> {
  /**
   * The value of the switch. If true the switch will be turned on.
   */
  value?: boolean
  /**
   * Invoked with the new value when the value changes.
   */
  onValueChange?: (value: boolean) => void
  /**
   * The label text to display.
   */
  label?: string
  /**
   * Style overrides for the container
   */
  containerStyle?: ViewStyle
  /**
   * Style overrides for the label
   */
  labelStyle?: TextStyle
  /**
   * The position of the label relative to the switch.
   * Default: left
   */
  labelPosition?: "left" | "right"
}

/**
 * A simple switch component that wraps React Native's Switch.
 */
export function Switch(props: SwitchComponentProps) {
  const {
    value = false,
    onValueChange,
    label,

    containerStyle,
    labelStyle,
    labelPosition = "left",
    ...rest
  } = props

  const content = (
    <>
      {label && labelPosition === "left" && <Text style={[$label, labelStyle]}>{label}</Text>}
      <View style={$switchContainer}>
        <RNSwitch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: colors.palette.neutral300, true: colors.switchGreen }}
          thumbColor={value ? colors.white : colors.white}
          ios_backgroundColor={colors.switchBackground}
          {...rest}
        />
      </View>
      {label && labelPosition === "right" && <Text style={[$label, labelStyle]}>{label}</Text>}
    </>
  )

  return <View style={[$container, containerStyle]}>{content}</View>
}

const $container: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  paddingVertical: spacing.xs,
}

const $switchContainer: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
}

const $label: TextStyle = {
  fontSize: 16,
  color: colors.palette.neutral900,
}
