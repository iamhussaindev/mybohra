import { useFocusEffect } from "@react-navigation/native"
import { Screen, Text } from "app/components"
import Header from "app/components/Header"
import { AppStackScreenProps } from "app/navigators"
import type { MyRsvpEvent } from "app/services/rsvp/fetchMyRsvps"
import { fetchMyRsvps } from "app/services/rsvp/fetchMyRsvps"
import { spacing } from "app/theme"
import { useColors } from "app/theme/useColors"
import { rsvpAppUrl, rsvpWebUrl } from "app/utils/rsvpLinks"
import { observer } from "mobx-react-lite"
import moment from "moment"
import React, { FC, useCallback, useState } from "react"
import { ActivityIndicator, FlatList, View, ViewStyle } from "react-native"

type Props = AppStackScreenProps<"RsvpMyList">

export const RsvpMyListScreen: FC<Props> = observer(function RsvpMyListScreen() {
  const colors = useColors()
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

  const renderItem = ({ item }: { item: MyRsvpEvent }) => {
    const web = rsvpWebUrl(item.slug)
    const line = web || rsvpAppUrl(item.slug)
    return (
      <View style={[$card, { borderColor: colors.border, backgroundColor: colors.background }]}>
        <Text weight="bold" text={item.title || item.event_type} numberOfLines={2} />
        <Text
          preset="formHelper"
          color={colors.textDim}
          text={moment(item.scheduled_at).format("ddd D MMM YYYY, h:mm a")}
        />
        <Text
          preset="formHelper"
          color={colors.textDim}
          text={`Yes (thaal): ${item.totals.yes} · Responses: ${item.totals.responses}`}
        />
        <Text preset="formHelper" color={colors.palette.primary500} numberOfLines={1} text={line} />
      </View>
    )
  }

  return (
    <Screen preset="fixed" safeAreaEdges={["top"]} backgroundColor={colors.background}>
      <Header title="My RSVPs" showBackButton />
      {loading ? (
        <View style={$center}>
          <ActivityIndicator color={colors.palette.primary500} />
        </View>
      ) : (
        <FlatList
          data={events}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={$list}
          ListEmptyComponent={
            <Text
              preset="formLabel"
              color={colors.textDim}
              text="No RSVPs yet. Create one from the RSVP home screen."
            />
          }
        />
      )}
    </Screen>
  )
})

const $list: ViewStyle = {
  padding: spacing.lg,
  gap: spacing.md,
}

const $card: ViewStyle = {
  padding: spacing.md,
  borderRadius: 12,
  borderWidth: 1,
  marginBottom: spacing.sm,
}

const $center: ViewStyle = {
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
}
