import { IconSend } from "@tabler/icons-react-native"
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

  return (
    <View style={[getHeader(colors), props.showBorder && getBorder(colors)]}>
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
      <View style={$headerRightIcons}>
        <TouchableOpacity>
          <IconSend size={26} color={colors.text} />
        </TouchableOpacity>
        {/* <TouchableOpacity>
          <IconSettings size={28} color={colors.text} />
        </TouchableOpacity> */}
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

const $headerRightIcons: ViewStyle = {
  flexDirection: "row",
  gap: spacing.lg,
  alignItems: "center",
  justifyContent: "center",
  marginEnd: spacing.lg,
}

const $headerLocation: ViewStyle = {
  alignItems: "flex-start",
  paddingStart: spacing.lg,
}

const getHeader = (colors: any): ViewStyle => ({
  flexDirection: "row",
  justifyContent: "space-between",
  backgroundColor: colors.background,
  alignItems: "center",
  paddingVertical: spacing.xs,
})
