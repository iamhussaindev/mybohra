import { ListView, Text } from "app/components"
import HijriDate from "app/libs/HijriDate"
import { IMiqaat } from "app/models/MiqaatStore"
import { colors, spacing } from "app/theme"
import { useColors } from "app/theme/useColors"
import React from "react"
import { View, ViewStyle, Image, ImageStyle, TextStyle } from "react-native"

export function MiqaatCard({
  item,
  style,
  showCount,
}: {
  showCount?: boolean
  isCalendar?: boolean
  item: IMiqaat
  style?: ViewStyle
}) {
  const colors = useColors()
  return (
    <View style={[$cardContainer, style]}>
      <View style={$cardContent}>
        <View style={$cardImageContainer}>
          <Image
            source={
              item.image ? { uri: item.image } : require("../../../assets/images/event_icon.png")
            }
            style={$cardImage}
            resizeMode="cover"
          />
        </View>
        {showCount && (
          <View style={$countDownContainer}>
            <Text weight="medium" style={$countDownText} color={colors.tint}>
              {HijriDate.fromMiqaat(item).toMoment().fromNow(true)}
            </Text>
          </View>
        )}
        <View style={$cardDescription}>
          <Text
            weight="medium"
            style={$cardTitle}
            color={colors.text}
            text={item.name}
            numberOfLines={2}
            ellipsizeMode="tail"
          />
          {item.description ? (
            <Text
              color={colors.textDim}
              weight="normal"
              style={$cardDescriptionText}
              text={`${item.description ?? ""} ${item.location ? ` - ${item.location}` : ``}`}
            />
          ) : null}
        </View>
      </View>
    </View>
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
}

const $countDownText: TextStyle = {
  fontSize: 12,
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
  const colors = useColors()
  return (
    <View style={$listContainer}>
      <Text
        preset="subheading"
        style={$listHeader}
        color={colors.text}
        text={title}
        weight="bold"
      />
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
  marginBottom: spacing.xs,
  borderColor: colors.border,
  borderRadius: 8,
  borderCurve: "continuous",
}

const $listContainer: ViewStyle = {
  minHeight: 80,
  flexDirection: "column",
  flexGrow: 1,
}

const $listContentContainer: ViewStyle = {
  paddingHorizontal: spacing.md,
  paddingBottom: spacing.lg,
}
