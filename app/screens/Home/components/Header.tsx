import { Icon, Text } from "app/components"
import { ILocation } from "app/models/DataStore"
import { colors, spacing } from "app/theme"
import { observer } from "mobx-react-lite"
import React from "react"
import { ImageStyle, TextStyle, View, ViewStyle, TouchableOpacity } from "react-native"

import { CurrentTime } from "./atoms/CurrentTime"

interface HeaderProps {
  open: boolean
  setOpen: (open: boolean) => void
  currentLocation: ILocation
  loaded: boolean
  showBorder?: boolean
  shadowOffset?: number
  onLocationPress?: () => void
}

export const Header = observer(function Header(props: HeaderProps) {
  const $shadow: ViewStyle = {
    shadowColor: colors.border,
    shadowOffset: {
      width: 0,
      height: props.shadowOffset ?? 0,
    },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  }

  return (
    <View style={[$header, props.showBorder && $border, props.showBorder && $shadow]}>
      <View style={$headerLocation}>
        <TouchableOpacity style={$headerLocationContainer} onPress={props.onLocationPress}>
          {props.loaded ? (
            <Text
              style={$headerLocationText}
              weight="bold"
              size="md"
              text={`${props.currentLocation.city}`}
            />
          ) : null}
          <View style={$headerLocationIcon}>
            <Icon style={$headerLocationIconStyle} size={18} icon="caretLeft" />
          </View>
        </TouchableOpacity>
        <CurrentTime />
      </View>
      <View style={$headerRightIcon}>
        <Icon size={20} icon="settings" />
      </View>
    </View>
  )
})

const $headerLocationIconStyle: ImageStyle = {
  transform: [{ rotate: "-90deg" }],
}

const $headerLocationContainer: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
}

const $headerLocationIcon: ViewStyle = {
  marginStart: spacing.xxs,
  flexDirection: "row",
  marginTop: 2,
}

const $headerLocationText: TextStyle = {
  color: colors.text,
  fontSize: 18,
}

const $border: ViewStyle = {
  borderBottomWidth: 1,
  borderBottomColor: colors.border,
}

const $headerRightIcon: ViewStyle = {
  alignItems: "center",
  justifyContent: "center",
  marginEnd: spacing.lg,
}

const $headerLocation: ViewStyle = {
  alignItems: "flex-start",
  paddingStart: spacing.lg,
  // paddingEnd: spacing.lg,
}

const $header: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-between",
  backgroundColor: colors.background,
  alignItems: "center",
}
