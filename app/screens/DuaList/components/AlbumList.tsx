import { IconFolderCheck } from "@tabler/icons-react-native"
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

export default function AlbumList({ onSelectAlbum, categories }: AlbumListProps) {
  const handleAlbumPress = (album: AlbumCategory) => {
    if (onSelectAlbum) {
      onSelectAlbum(album)
    }
  }

  return (
    <View style={$container}>
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
                  <IconFolderCheck size={24} color={colors.palette.primary800} />
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
  overflow: "visible",
  marginBottom: 16,
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
}

const $albumEmojiContainer: ViewStyle = {
  width: 42,
  height: 42,
  borderRadius: 21,
  backgroundColor: colors.palette.primary100,
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
