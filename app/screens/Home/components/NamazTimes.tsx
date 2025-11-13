import { SBox, Text } from "app/components"
import { CurrentGhari } from "app/helpers/namaz.helper"
import { colors, spacing } from "app/theme"
import { getFormattedTime } from "app/utils/common"
import { observer } from "mobx-react-lite"
import React from "react"
import { Dimensions, FlatList, TextStyle, View, ViewStyle } from "react-native"

const namazTimes = [
  { key: "4", text: "Sehori End", time_key: "sihori" },
  { key: "1", text: "Fajr", time_key: "fajr" },
  { key: "2", text: "Zawwal", time_key: "zawaal" },
  { key: "3", text: "Maghrib/Isha", time_key: "maghrib" },
  { key: "5", text: "Nisf-ul-Layl", time_key: "nisful_layl" },
]

const screenWidth = Dimensions.get("window").width

export default observer(function NamazTimesList(props: {
  containerStyle?: any
  times?: any
  nextTimeKey?: string
  currentGhari?: CurrentGhari
  navigation: any
}) {
  const flatListRef = React.useRef<FlatList>(null)
  const activeItemIndex = namazTimes.findIndex((item) => item.time_key === props.currentGhari?.key)
  return (
    <View style={[$container, props.containerStyle]}>
      <FlatList
        style={$flatListStyle}
        ref={flatListRef}
        initialScrollIndex={activeItemIndex >= 0 ? activeItemIndex : 0}
        data={namazTimes}
        ItemSeparatorComponent={() => <View style={$gap} />}
        renderItem={({ item, index }) => {
          return (
            <NamazCard
              {...item}
              navigation={props.navigation}
              time={props.currentGhari?.time ?? props.times[item.time_key]}
              text={index === activeItemIndex ? props.currentGhari?.name : item.text}
              isNext={props.currentGhari?.isNext}
              index={index}
              activeIndex={activeItemIndex}
              timeKey={item.time_key}
            />
          )
        }}
        getItemLayout={(data, index) => ({
          length: screenWidth / 3,
          offset: (screenWidth / 3) * index,
          index,
        })}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
      />
    </View>
  )
})

function NamazCard(props: {
  index?: number
  value?: any
  text?: string
  activeIndex?: boolean
  time: string
  timeKey: string
  isNext?: boolean
  navigation: any
}) {
  return (
    <>
      <SBox
        height={75}
        width={screenWidth / 3 - 36}
        cornerRadius={0.5}
        borderRadius={8}
        backgroundColor={
          props.activeIndex === props.index ? colors.palette.primary10 : colors.palette.neutral100
        }
        borderColor={props.activeIndex === props.index ? colors.palette.primary200 : colors.border}
        onPress={() => {
          props.navigation.navigate("Namaz")
        }}
        style={[props.index === 0 && $firstNamazCard, props.index === 4 && $lastNamazCard]}
      >
        {props.activeIndex === props.index ? (
          <View style={$currentGhariContainer}>
            <Text color={colors.palette.neutral100} weight="medium" style={$currentGhariText}>
              {props.isNext ? "Next" : "Current"}
            </Text>
          </View>
        ) : null}
        <View style={[$grContainer, props.activeIndex === props.index && $activeNamazCard]}>
          <Text
            weight="normal"
            style={[$namazLabel, props.activeIndex === props.index && $activeNamazLabel]}
          >
            {props.text}
          </Text>
          <Text
            weight="bold"
            style={[$namazValue, props.activeIndex === props.index && $activeNamazValue]}
          >
            {getFormattedTime(props.time)}
          </Text>
        </View>
      </SBox>
    </>
  )
}

const $flatListStyle: ViewStyle = {
  overflow: "visible",
}

const $currentGhariContainer: ViewStyle = {
  position: "absolute",
  top: -10,
  height: 20,
  left: 15.8,
  paddingRight: 7,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  paddingLeft: 7,
  width: 75,
  backgroundColor: colors.palette.primary500,
  zIndex: 20,
  borderRadius: 8,
  borderWidth: 0,
  borderCurve: "continuous",
}

const $currentGhariText: TextStyle = {
  color: colors.white,
  fontSize: 12,
  lineHeight: 16,
  textAlign: "center",
}

const $grContainer: ViewStyle = {
  width: screenWidth / 3 - 36,
  height: 75,
  minHeight: 75,
  justifyContent: "center",
  flexDirection: "column",
  alignItems: "center",
  padding: 0,
  borderRadius: 8,
  borderCurve: "continuous",
  position: "relative",
}

const $activeNamazCard: ViewStyle = {
  // borderColor: colors.tint,
  // borderWidth: 0.5,
  // borderCurve: "continuous",
  // backgroundColor: colors.palette.primary10,
}

const $firstNamazCard: ViewStyle = {
  marginLeft: spacing.lg,
}

const $lastNamazCard: ViewStyle = {
  marginRight: spacing.lg,
}

const $namazLabel: TextStyle = {
  fontSize: 16,
  marginBottom: 0,
}

const $namazValue: TextStyle = {
  fontSize: 18,
  color: "#333",
}

const $activeNamazLabel: TextStyle = {
  color: colors.palette.primary500,
}

const $activeNamazValue: TextStyle = {
  color: colors.palette.primary500,
}

const $gap: ViewStyle = {
  width: 25,
}

const $container: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-between",
  marginTop: 30,
  marginBottom: spacing.lg,
  overflow: "visible",
}
