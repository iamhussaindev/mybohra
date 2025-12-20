import { colors } from "app/theme"
import React from "react"
import { View, StyleSheet, StyleProp, ViewStyle, Pressable } from "react-native"
import Svg, { Path } from "react-native-svg"

interface SBoxProps {
  size?: number
  width?: number
  height?: number
  minHeight?: number
  children?: React.ReactNode
  backgroundColor?: string
  borderColor?: string
  borderRadius?: number
  cornerRadius?: number
  cornerRadiusX?: number
  cornerRadiusY?: number
  style?: StyleProp<ViewStyle>
  innerStyle?: StyleProp<ViewStyle>
  shadowProps?: ViewStyle
  onPress?: () => void
}
const SBox = ({
  size = 100,
  width,
  height,
  minHeight,
  children,
  backgroundColor = colors.white,
  borderColor = colors.gray,
  borderRadius = 16,
  cornerRadius = 0.6, // 0.5-0.8 recommended
  cornerRadiusX,
  cornerRadiusY,
  style,
  shadowProps,
  innerStyle,
  onPress,
}: SBoxProps) => {
  const boxWidth = width ?? size
  const boxHeight = minHeight ?? height ?? size
  const innerWidth = Math.max(boxWidth - 2, 0)
  const innerHeight = Math.max(boxHeight - 2, 0)
  const hasInner = innerWidth > 0 && innerHeight > 0
  const generateSquirclePath = (
    width: number,
    height: number,
    radiusX: number,
    radiusY: number,
  ) => {
    const adjustedRadiusX = Math.max(radiusX, 0.01)
    const adjustedRadiusY = Math.max(radiusY, 0.01)
    const nX = 4 / adjustedRadiusX
    const nY = 4 / adjustedRadiusY
    const points: string[] = []
    const steps = 100

    for (let i = 0; i <= steps; i++) {
      const angle = (i / steps) * 2 * Math.PI
      const cosAngle = Math.cos(angle)
      const sinAngle = Math.sin(angle)

      const x = width / 2 + (width / 2) * Math.sign(cosAngle) * Math.pow(Math.abs(cosAngle), 2 / nX)
      const y =
        height / 2 + (height / 2) * Math.sign(sinAngle) * Math.pow(Math.abs(sinAngle), 2 / nY)

      points.push(`${i === 0 ? "M" : "L"} ${x} ${y}`)
    }

    points.push("Z")
    return points.join(" ")
  }

  const resolvedCornerRadiusX = cornerRadiusX ?? cornerRadius
  const resolvedCornerRadiusY = cornerRadiusY ?? cornerRadius
  const outerPath = generateSquirclePath(
    boxWidth,
    boxHeight,
    resolvedCornerRadiusX,
    resolvedCornerRadiusY,
  )
  const innerPath = hasInner
    ? generateSquirclePath(innerWidth, innerHeight, resolvedCornerRadiusX, resolvedCornerRadiusY)
    : ""

  return (
    <Pressable
      onPress={onPress}
      style={[styles.container, { width: boxWidth, height: boxHeight, borderRadius }, style]}
    >
      <View
        pointerEvents="none"
        style={[styles.border, { width: boxWidth, height: boxHeight, borderRadius }, shadowProps]}
      >
        <Svg width={boxWidth} height={boxHeight}>
          <Path d={outerPath} fill={borderColor} />
        </Svg>
      </View>
      {hasInner && (
        <View
          pointerEvents="none"
          style={[styles.inner, { width: innerWidth, height: innerHeight, borderRadius }]}
        >
          <Svg width={innerWidth} height={innerHeight}>
            <Path d={innerPath} fill={backgroundColor} />
          </Svg>
        </View>
      )}

      {children && <View style={[styles.children, innerStyle]}>{children}</View>}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  border: {
    left: 0,
    position: "absolute",
    top: 0,
  },
  children: {
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
  },
  container: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  inner: {
    left: 1,
    position: "absolute",
    top: 1,
  },
})

export default SBox
