import { IconBookFilled } from "@tabler/icons-react-native"
import { Text } from "app/components"
import { shadowProps } from "app/helpers/shadow.helper"
import { colors, spacing } from "app/theme"
import React from "react"
import { Dimensions, Pressable, TextStyle, View, ViewStyle } from "react-native"

const screenWidth = Dimensions.get("window").width
const columns = 3
const gutter = spacing.md
const horizontalPadding = spacing.lg
const cardWidth = (screenWidth - horizontalPadding * 2 - gutter * (columns - 1)) / columns

export interface AlbumCategory {
  id: string
  title: string
  description: string
  count: number
  icon: React.ReactNode
  highlight?: boolean
}

interface AlbumListProps {
  title?: string
  onSelectAlbum?: (album: AlbumCategory) => void
  categories: AlbumCategory[]
}

const hiddenCategories = [
  "sunday",
  "friday",
  "thursday",
  "wednesday",
  "tuesday",
  "monday",
  "saturday",
  "joshan",
  "daily-dua",
]

export default function AlbumList({
  title = "Categories",
  onSelectAlbum,
  categories,
}: AlbumListProps) {
  const handleAlbumPress = (album: AlbumCategory) => {
    if (onSelectAlbum) {
      onSelectAlbum(album)
    }
  }

  return (
    <View style={$container}>
      <Text style={$header} text={title} weight="bold" preset="subheading" />

      <View style={$grid}>
        {categories

          .filter((album) => !hiddenCategories.includes(album.id))
          .map((album) => {
            return (
              <Pressable
                key={album.id}
                style={[
                  $albumCard,
                  { width: cardWidth },
                  album.highlight ? $albumCardHighlight : {},
                ]}
                onPress={() => handleAlbumPress(album)}
              >
                <View style={$albumEmojiContainer}>
                  <IconBookFilled size={24} color={colors.palette.neutral100} />
                </View>
                <Text style={$albumTitle} text={album.title} numberOfLines={2} weight="medium" />
              </Pressable>
            )
          })}
      </View>
    </View>
  )
}

const $albumCardHighlight: ViewStyle = {
  ...shadowProps,

  borderRadius: 14,
}

const $container: ViewStyle = {
  flexDirection: "column",
  marginTop: 10,
  overflow: "visible",
  marginBottom: 16,
}

const $header: TextStyle = {
  marginStart: spacing.lg,
  marginBottom: spacing.sm,
}

const $grid: ViewStyle = {
  flexDirection: "row",
  flexWrap: "wrap",
  gap: gutter,
  paddingHorizontal: horizontalPadding,
}

const $albumCard: ViewStyle = {
  backgroundColor: colors.white,
  borderRadius: 14,
  padding: spacing.sm,
  borderWidth: 1,
  borderColor: colors.border,
  minHeight: 100,
  justifyContent: "space-between",
  shadowColor: colors.palette.neutral900,
  shadowOpacity: 0.05,
  shadowOffset: { width: 0, height: 6 },
  shadowRadius: 12,
  elevation: 2,
}

const $albumEmojiContainer: ViewStyle = {
  width: 42,
  height: 42,
  borderRadius: 21,
  backgroundColor: colors.palette.primary500,
  alignItems: "center",
  justifyContent: "center",
  marginBottom: spacing.xs,
}

const $albumTitle: TextStyle = {
  fontSize: 14,
  fontWeight: "600",
  color: colors.palette.neutral900,
  textTransform: "capitalize",
  marginBottom: spacing.xxs,
}
