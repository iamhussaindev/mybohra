import React from "react"
import { Icon, Text } from "app/components"
import { View, ViewStyle } from "react-native"
import { colors, spacing } from "app/theme"
import { ILocation } from "app/models/DataStore"
import { CurrentTime } from "./atoms/CurrentTime"
import { DrawerIconButton } from "./atoms/DrawerIconButton"

interface HeaderProps {
  open: boolean
  setOpen: (open: boolean) => void
  currentLocation: ILocation
  loaded: boolean
  showBorder?: boolean
  shadowOffset?: number
}

export function Header(props: HeaderProps) {
  const toggleDrawer = () => {
    if (!props.open) {
      props.setOpen(true)
    } else {
      props.setOpen(false)
    }
  }

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
      <DrawerIconButton onPress={toggleDrawer} />
      <View style={$headerLocation}>
        {props.loaded ? <Text size="sm" text={`${props.currentLocation.city}`} /> : null}
        <CurrentTime />
      </View>
      <View style={$headerRightIcon}>
        <Icon size={20} icon="settings" />
      </View>
    </View>
  )
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
  alignItems: "center",
}

const $header: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-between",
  backgroundColor: colors.palette.neutral100,
  alignItems: "center",
}
