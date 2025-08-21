import * as React from "react"
import { ComponentType } from "react"
import {
  Image,
  ImageStyle,
  StyleProp,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
  ViewProps,
  ViewStyle,
} from "react-native"

export type IconTypes = keyof typeof iconRegistry

interface IconProps extends TouchableOpacityProps {
  /**
   * The name of the icon
   */
  icon: IconTypes

  /**
   * An optional tint color for the icon
   */
  color?: string

  /**
   * An optional size for the icon. If not provided, the icon will be sized to the icon's resolution.
   */
  size?: number

  /**
   * Style overrides for the icon image
   */
  style?: StyleProp<ImageStyle>

  /**
   * Style overrides for the icon container
   */
  containerStyle?: StyleProp<ViewStyle>

  /**
   * An optional function to be called when the icon is pressed
   */
  onPress?: TouchableOpacityProps["onPress"]
}

/**
 * A component to render a registered icon.
 * It is wrapped in a <TouchableOpacity /> if `onPress` is provided, otherwise a <View />.
 * @see [Documentation and Examples]{@link https://docs.infinite.red/ignite-cli/boilerplate/components/Icon/}
 * @param {IconProps} props - The props for the `Icon` component.
 * @returns {JSX.Element} The rendered `Icon` component.
 */
export function Icon(props: IconProps) {
  const {
    icon,
    color,
    size,
    style: $imageStyleOverride,
    containerStyle: $containerStyleOverride,
    ...WrapperProps
  } = props

  const isPressable = !!WrapperProps.onPress
  const Wrapper = (WrapperProps?.onPress ? TouchableOpacity : View) as ComponentType<
    TouchableOpacityProps | ViewProps
  >

  const $imageStyle: StyleProp<ImageStyle> = [
    $imageStyleBase,
    color !== undefined && { tintColor: color },
    size !== undefined && { width: size, height: size },
    $imageStyleOverride,
  ]

  return (
    <Wrapper
      accessibilityRole={isPressable ? "imagebutton" : undefined}
      {...WrapperProps}
      style={$containerStyleOverride}
    >
      <Image style={$imageStyle} source={iconRegistry[icon]} />
    </Wrapper>
  )
}

export const iconRegistry = {
  calendar: require("../../assets/icons/calendar-silhouette.png"),
  alarm: require("../../assets/icons/alarm-clock.png"),
  shop: require("../../assets/icons/shop.png"),
  home: require("../../assets/icons/home.png"),
  heart: require("../../assets/icons/heart.png"),
  search: require("../../assets/icons/search.png"),
  user: require("../../assets/icons/user.png"),
  back: require("../../assets/icons/back.png"),
  bell: require("../../assets/icons/bell.png"),
  caretLeft: require("../../assets/icons/caretLeft.png"),
  caretRight: require("../../assets/icons/caretRight.png"),
  check: require("../../assets/icons/check.png"),
  community: require("../../assets/icons/community.png"),
  hidden: require("../../assets/icons/hidden.png"),
  ladybug: require("../../assets/icons/ladybug.png"),
  lock: require("../../assets/icons/lock.png"),
  menu: require("../../assets/icons/menu.png"),
  more: require("../../assets/icons/more.png"),
  settings: require("../../assets/icons/setting.png"),
  view: require("../../assets/icons/view.png"),
  x: require("../../assets/icons/x.png"),
  arrowLeft: require("../../assets/icons/arrow-left.png"),
  arrowRight: require("../../assets/icons/arrow-right.png"),
  goto: require("../../assets/icons/goto.png"),
  document: require("../../assets/icons/document.png"),
  bookmark: require("../../assets/icons/bookmark.png"),
  bookmarkOutline: require("../../assets/icons/bookmark-outline.png"),
  play: require("../../assets/icons/play.png"),
  pause: require("../../assets/icons/pause.png"),
  timeForward: require("../../assets/icons/time-forward-ten.png"),
  timeBackward: require("../../assets/icons/replay-10.png"),
  stop: require("../../assets/icons/stop.png"),
  touch: require("../../assets/icons/touch.png"),
  minusCircle: require("../../assets/icons/minus-circle.png"),
  undo: require("../../assets/icons/undo.png"),
  volume: require("../../assets/icons/volume.png"),
  volumeMute: require("../../assets/icons/volume-slash.png"),
  save: require("../../assets/icons/save.png"),

  // Namaz icons
  fajr: require("../../assets/images/fajr.png"),
  sihori: require("../../assets/images/sihori.png"),
  sunrise_safe: require("../../assets/images/fajr-end.png"),
  zawaal: require("../../assets/images/zawaal.png"),
  zohr_end: require("../../assets/images/zohr_end.png"),
  asr_end: require("../../assets/images/asr_end.png"),
  maghrib_safe: require("../../assets/images/maghrib.png"),
  nisful_layl: require("../../assets/images/nisful_layl.png"),
  nisful_layl_end: require("../../assets/images/nisful_layl_end.png"),
}

const $imageStyleBase: ImageStyle = {
  resizeMode: "contain",
}
