import React from "react"
import { Card, ListView, Text } from "app/components"
import { IMiqaat } from "app/models/MiqaatStore"
import { colors, spacing } from "app/theme"
import { View, ViewStyle, Image, ImageStyle, TextStyle } from "react-native"
import HijriDate from "app/libs/HijriDate"

export function MiqaatCard({
  item,
  style,
  showCount,
}: {
  showCount?: boolean
  item: IMiqaat
  style?: ViewStyle
}) {
  return (
    <Card style={[$cardContainer, style]}>
      <View style={$cardContent}>
        <View style={$cardImageContainer}>
          <Image
            style={[$cardImage, showCount && { borderColor: colors.transparent }]}
            source={require("../../../assets/images/event_icon.png")}
          />
        </View>
        {showCount && (
          <View style={$countDownContainer}>
            <Text style={$countDownText}>
              {HijriDate.fromMiqaat(item).toMoment().fromNow(true)}
            </Text>
          </View>
        )}
        <View style={$cardDescription}>
          <Text weight="regular" style={$cardTitle} text={item.name} />
          {item.description ? (
            <Text
              weight="regular"
              style={$cardDescriptionText}
              text={`${item.description ?? ""} ${item.location ? ` - ${item.location}` : ``}`}
            />
          ) : null}
        </View>
      </View>
    </Card>
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
  bottom: -5,
  paddingHorizontal: spacing.xs,
  backgroundColor: colors.palette.neutral100,
  opacity: 0.9,
  shadowColor: colors.palette.neutral300,
  shadowOffset: { width: 2, height: 2 },
  shadowOpacity: 0.5,
  shadowRadius: 5,
  borderRadius: 5,
  borderColor: colors.palette.primary500,
  borderWidth: 0.5,
}

const $cardDescriptionText: TextStyle = {
  fontSize: 13,
  color: colors.palette.neutral600,
}

const $cardDescription: ViewStyle = {
  width: "100%",
}

const $cardTitle: TextStyle = {
  fontSize: 15,
  width: "60%",
  lineHeight: 20,
  flexWrap: "wrap",
}

const $cardContent: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  flexGrow: 1,
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
  marginBottom: spacing.sm,
  paddingHorizontal: spacing.lg,
}

const $cardContainer: ViewStyle = {
  marginBottom: spacing.sm,
  shadowOpacity: 0,
  paddingTop: 10,
  paddingBottom: 10,
  minHeight: 10,
  borderColor: colors.border,
  borderWidth: 1,
  borderRadius: 12,
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
