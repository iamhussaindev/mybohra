import { IconPlayerPlayFilled } from "@tabler/icons-react-native"
import { Text } from "app/components"
import { ILibrary } from "app/models/LibraryStore"
import { spacing } from "app/theme"
import { useColors } from "app/theme/useColors"
import LottieView from "lottie-react-native"
import React from "react"
import { Pressable, TextStyle, View, ViewStyle } from "react-native"
import { LinearGradient } from "react-native-linear-gradient"
import { State, Track } from "react-native-track-player"

export interface AudioItemProps {
  item: ILibrary
  currentSound?: Track
  state?: State
  onPress: (item: ILibrary, index?: number) => void
  index?: number
  subtitle?: string // Optional subtitle to override default (album or duration)
  isActive?: boolean // Optional override for active state
}

/**
 * AudioItem component for displaying audio library items with play state
 */
export const AudioItem: React.FC<AudioItemProps> = ({
  item,
  currentSound,
  state,
  onPress,
  index,
  subtitle,
  isActive: isActiveOverride,
}) => {
  const colors = useColors()
  const isActive = isActiveOverride ?? currentSound?.id.toString() === item.id.toString()
  const isPlaying = isActive && state === State.Playing
  const displaySubtitle = subtitle ?? item.album

  const handlePress = () => {
    onPress(item, index)
  }

  return (
    <Pressable style={$audioItem(colors, isActive)} onPress={handlePress}>
      <View style={$audioItemContent}>
        <LinearGradient
          colors={[colors.palette.primary500, colors.palette.primary600]}
          style={$audioItemIconContainer(colors)}
        >
          {isActive ? (
            <View>
              {isPlaying ? (
                <LottieView
                  style={$lottieIcon}
                  source={require("../../assets/animation/music_white.json")}
                  autoPlay
                  loop
                />
              ) : (
                <IconPlayerPlayFilled size={20} color={colors.white} />
              )}
            </View>
          ) : (
            <IconPlayerPlayFilled size={20} color={colors.white} />
          )}
        </LinearGradient>
        <View style={$audioItemTextContainer}>
          <Text style={$audioItemTitle(colors)} weight="medium" numberOfLines={2}>
            {item.name}
          </Text>
          {displaySubtitle && (
            <Text style={$audioItemSubtitle(colors)} numberOfLines={1} size="xs">
              {displaySubtitle}
            </Text>
          )}
        </View>
      </View>
    </Pressable>
  )
}

const $audioItem = (colors: any, isActive: boolean): ViewStyle => ({
  backgroundColor: isActive ? "#f4f5f9" : colors.background,
  paddingVertical: spacing.md,
  paddingHorizontal: spacing.md,
})

const $audioItemContent: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
}

const $audioItemIconContainer = (colors: any): ViewStyle => ({
  width: 40,
  height: 40,
  backgroundColor: colors.palette.primary500,
  justifyContent: "center",
  borderRadius: 12,
  alignItems: "center",
  marginRight: spacing.md,
})

const $lottieIcon: ViewStyle = {
  width: 20,
  height: 20,
}

const $audioItemTextContainer: ViewStyle = {
  flex: 1,
}

const $audioItemTitle = (colors: any): TextStyle => ({
  fontSize: 16,
  color: colors.text,
})

const $audioItemSubtitle = (colors: any): TextStyle => ({
  fontSize: 12,
  color: colors.palette.neutral600,
})
