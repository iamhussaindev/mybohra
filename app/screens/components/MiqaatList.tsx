import { ListView, SBox, Text } from "app/components"
import HijriDate from "app/libs/HijriDate"
import { IMiqaat } from "app/models/MiqaatStore"
import { colors, spacing } from "app/theme"
import React from "react"
import { View, ViewStyle, Image, ImageStyle, TextStyle, Dimensions } from "react-native"

const screenWidth = Dimensions.get("window").width

export function MiqaatCard({
  isCalendar,
  item,
  style,
  showCount,
}: {
  showCount?: boolean
  isCalendar?: boolean
  item: IMiqaat
  style?: ViewStyle
}) {
  return (
    <SBox
      width={!isCalendar ? screenWidth - spacing.lg * 2 : screenWidth - spacing.md * 2}
      minHeight={80}
      cornerRadius={0.5}
      borderRadius={8}
      cornerRadiusX={0.2}
      style={$cardStyle}
      cornerRadiusY={0.2}
      borderColor={colors.border}
      backgroundColor={colors.white}
      innerStyle={[$cardContainer, style]}
    >
      <View style={$cardContent}>
        <View style={$cardImageContainer}>
          <Image
            source={
              item.image ? { uri: item.image } : require("../../../assets/images/event_icon.png")
            }
            style={[$cardImage, showCount && { borderColor: colors.transparent }]}
            resizeMode="cover"
          />
        </View>
        {showCount && (
          <View style={$countDownContainer}>
            <Text weight="medium" style={$countDownText}>
              {HijriDate.fromMiqaat(item).toMoment().fromNow(true)}
            </Text>
          </View>
        )}
        <View style={$cardDescription}>
          <Text
            weight="medium"
            style={$cardTitle}
            text={item.name}
            numberOfLines={2}
            ellipsizeMode="tail"
          />
          {item.description ? (
            <Text
              weight="normal"
              style={$cardDescriptionText}
              text={`${item.description ?? ""} ${item.location ? ` - ${item.location}` : ``}`}
            />
          ) : null}
        </View>
      </View>
    </SBox>
  )
}

const $cardImage: ImageStyle = {
  width: 50,
  height: 50,
  borderWidth: 2,
  borderRadius: 25,
  borderColor: colors.white,
}

const $cardImageContainer: ViewStyle = {
  marginLeft: spacing.xxs,
  marginRight: spacing.sm,
  shadowColor: "rgba(0,0,0,0.3)",
  borderRadius: 25,
  width: 50,
  height: 50,
  backgroundColor: colors.white,
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.2,
  shadowRadius: 3,
  elevation: 3,
  borderWidth: 1,
  borderColor: colors.border,
}

const $countDownText: TextStyle = {
  fontSize: 10,
  color: colors.palette.primary500,
  margin: 0,
}

const $countDownContainer: ViewStyle = {
  position: "absolute",
  left: 8,
  top: -5,
  paddingHorizontal: spacing.xs,
  backgroundColor: colors.palette.neutral100,
  opacity: 1,
  shadowColor: colors.palette.neutral300,
  shadowOffset: { width: 2, height: 2 },
  shadowOpacity: 0.5,
  shadowRadius: 5,
  borderRadius: 5,
  borderColor: colors.border,
  borderWidth: 0.5,
}

const $cardDescriptionText: TextStyle = {
  fontSize: 14,
  color: colors.palette.neutral900,
  flexWrap: "wrap",
  flex: 1,
  lineHeight: 20,
  width: "100%",
}

const $cardDescription: ViewStyle = {
  width: "80%",
  flex: 1,
}

const $cardTitle: TextStyle = {
  fontSize: 16,
  width: "90%",
  lineHeight: 20,
  flexWrap: "wrap",
}

const $cardContent: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  flexGrow: 1,
  width: "100%",
}

export default function MiqaatList({
  list,
  title,
  showCount,
}: {
  showCount?: boolean
  title: string
  list: IMiqaat[]
}) {
  return (
    <View style={$listContainer}>
      <Text preset="subheading" style={$listHeader} text={title} weight="bold" />
      <ListView<IMiqaat>
        estimatedItemSize={50}
        contentContainerStyle={$listContentContainer}
        data={list}
        renderItem={({ item }) => <MiqaatCard showCount={showCount} item={item} />}
      />
    </View>
  )
}

const $listHeader: TextStyle = {
  marginBottom: spacing.md,
  width: "100%",
  paddingHorizontal: spacing.lg,
}

const $cardContainer: ViewStyle = {
  paddingTop: 10,
  paddingBottom: 10,
  minHeight: 10,
  paddingHorizontal: spacing.xs,
}

const $cardStyle: ViewStyle = {
  paddingTop: 10,
  paddingBottom: 20,
  minHeight: 10,
  marginBottom: spacing.md,
}

const $listContainer: ViewStyle = {
  minHeight: 80,
  flexDirection: "column",
  flexGrow: 1,
}

const $listContentContainer: ViewStyle = {
  paddingHorizontal: spacing.lg,
  paddingBottom: spacing.lg,
}
