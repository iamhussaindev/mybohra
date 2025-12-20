import { Icon, Text, Skeleton } from "app/components"
import { ILocation } from "app/models/DataStore"
import { spacing } from "app/theme"
import { useColors } from "app/theme/useColors"
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
  onLongPress?: () => void
}

export const Header = observer(function Header(props: HeaderProps) {
  const colors = useColors()
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
    <View
      style={[
        getHeader(colors),
        props.showBorder && getBorder(colors),
        props.showBorder && $shadow,
      ]}
    >
      <View style={$headerLocation}>
        <TouchableOpacity
          style={$headerLocationContainer}
          onPress={props.onLocationPress}
          onLongPress={props.onLongPress}
        >
          {props.loaded ? (
            <Text
              style={getHeaderLocationText(colors)}
              weight="bold"
              size="md"
              text={`${props.currentLocation.city}`}
            />
          ) : (
            <Skeleton width={120} height={18} borderRadius={4} />
          )}
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

// These styles need to be functions or inline since they depend on colors
const getHeaderLocationText = (colors: any): TextStyle => ({
  color: colors.text,
  fontSize: 18,
})

const getBorder = (colors: any): ViewStyle => ({
  borderBottomWidth: 1,
  borderBottomColor: colors.border,
})

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

const getHeader = (colors: any): ViewStyle => ({
  flexDirection: "row",
  justifyContent: "space-between",
  backgroundColor: colors.background,
  alignItems: "center",
  paddingVertical: spacing.xs,
})
