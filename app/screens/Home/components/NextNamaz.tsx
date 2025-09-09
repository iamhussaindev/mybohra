import { Text } from "app/components"
import {
  getNamazTimeDifference,
  namazEndDescription,
  namazLabels,
  NamazTimes,
} from "app/helpers/namaz.helper"
import { colors, spacing } from "app/theme"
import { getFormattedTime } from "app/utils/common"
import { observer } from "mobx-react-lite"
import React, { useCallback, useEffect, useState } from "react"
import { View, ViewStyle } from "react-native"

interface NextNamazProps {
  times: NamazTimes
  nextTimeKey: keyof NamazTimes
}

export default observer(function NextNamaz(props: NextNamazProps) {
  const nextNamazTime = props.times[props.nextTimeKey]

  const getCurrentTime = useCallback(() => {
    return getNamazTimeDifference(nextNamazTime)
  }, [nextNamazTime])

  const [timeDiffString, setTimeDiffString] = useState(() => getCurrentTime().name)

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeDiffString(getCurrentTime().name)
    }, 1000)
    setTimeDiffString(getCurrentTime().name)
    return () => clearInterval(timer)
  }, [nextNamazTime])

  return props.nextTimeKey !== undefined ? (
    <View style={$container}>
      <View style={$borderLeft}></View>
      <View style={$nextNamazLabel}>
        <Text text={props.nextTimeKey === "sihori" ? "" : `Next Namaz `} />
        <Text weight="bold" text={namazLabels[props.nextTimeKey as keyof typeof namazLabels]} />
        <Text text={` ${namazEndDescription[props.nextTimeKey]} `} />
      </View>
      <View style={$timeText}>
        <Text weight="bold" style={$valueColor} size="md" text={timeDiffString} />
        <Text text={`(${getFormattedTime(nextNamazTime)})`} />
      </View>
    </View>
  ) : null
})

const $timeText: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
}

const $valueColor = {
  color: colors.palette.primary500,
  marginEnd: spacing.xs,
}

const $nextNamazLabel: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
}

const $borderLeft: ViewStyle = {
  width: 5,
  marginStart: spacing.lg,
  backgroundColor: colors.palette.primary500,
  borderTopEndRadius: 10,
  borderBottomEndRadius: 10,
  height: 60,
  position: "absolute",
}

const $container: ViewStyle = {
  height: 60,
  marginTop: spacing.lg,
  paddingStart: spacing.xxl,
  paddingEnd: spacing.lg,
  justifyContent: "center",
}
