import { useFocusEffect } from "@react-navigation/native"
import { Button, Icon, Screen, Text } from "app/components"
import Header from "app/components/Header"
import type { AppStackScreenProps } from "app/navigators"
import type { MyRsvpEvent } from "app/services/rsvp/fetchMyRsvps"
import { fetchMyRsvps } from "app/services/rsvp/fetchMyRsvps"
import { colors, spacing } from "app/theme"
import { observer } from "mobx-react-lite"
import React, { FC, useCallback, useState } from "react"
import { ActivityIndicator, Pressable, TextStyle, View, ViewStyle } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

type Props = AppStackScreenProps<"Rsvp">

export const RsvpScreen: FC<Props> = observer(function RsvpScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets()
  const [events, setEvents] = useState<MyRsvpEvent[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetchMyRsvps()
      setEvents(res.ok ? res.events : [])
    } finally {
      setLoading(false)
    }
  }, [])

  useFocusEffect(
    useCallback(() => {
      load()
    }, [load]),
  )

  return (
    <Screen
      preset="fixed"
      backgroundColor={colors.accentBackground}
      safeAreaEdges={["top"]}
      contentContainerStyle={$content}
    >
      <View style={$layout}>
        <Header
          title="RSVP & Jaman"
          showBackButton
          rightActions={
            <Pressable
              onPress={() => {
                console.log("search")
              }}
            >
              <Icon icon="search" size={20} color={colors.palette.primary500} />
            </Pressable>
          }
        />
        <View style={$body}>
          {loading ? (
            <View style={$emptyWrap}>
              <ActivityIndicator size="large" color={colors.palette.primary500} />
            </View>
          ) : events.length === 0 ? (
            <View style={$emptyWrap}>
              <Text
                text="Currently you are not having any RSVP."
                style={$emptyMessage}
                preset="formLabel"
              />
            </View>
          ) : null}
        </View>
        <View style={[$footer, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
          <Button
            text="Create RSVP"
            preset="reversed"
            onPress={() => navigation.navigate("RsvpCreate")}
            style={$createButton}
          />
        </View>
      </View>
    </Screen>
  )
})

const $content: ViewStyle = {
  flex: 1,
  backgroundColor: colors.accentBackground,
}

const $layout: ViewStyle = {
  flex: 1,
}

const $body: ViewStyle = {
  flex: 1,
}

const $emptyWrap: ViewStyle = {
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  paddingHorizontal: spacing.lg,
}

const $emptyMessage: TextStyle = {
  textAlign: "center",
  color: colors.palette.neutral500,
}

const $footer: ViewStyle = {
  paddingHorizontal: spacing.lg,
  paddingTop: spacing.md,
  borderTopColor: colors.palette.neutral400,
  backgroundColor: colors.accentBackground,
}

const $createButton: ViewStyle = {
  alignSelf: "stretch",
  borderRadius: 100,
}
