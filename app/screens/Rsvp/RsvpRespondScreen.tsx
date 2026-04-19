import { Button, Screen, Text, TextField } from "app/components"
import Header from "app/components/Header"
import { fetchRsvpBySlug, submitRsvpResponse } from "app/services/rsvp"
import { AppStackScreenProps } from "app/navigators"
import { spacing } from "app/theme"
import { useColors } from "app/theme/useColors"
import { observer } from "mobx-react-lite"
import moment from "moment"
import React, { FC, useCallback, useState } from "react"
import { ActivityIndicator, Alert, Pressable, View, ViewStyle, TextStyle } from "react-native"

type Props = AppStackScreenProps<"RsvpRespond">

export const RsvpRespondScreen: FC<Props> = observer(function RsvpRespondScreen({ navigation, route }) {
  const colors = useColors()
  const { slug } = route.params
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [event, setEvent] = useState<{
    event_type: string
    host_label: string
    scheduled_at: string
    message: string | null
    title: string | null
    closed_at: string | null
  } | null>(null)
  const [totals, setTotals] = useState({ yes: 0, no: 0, maybe: 0, responses: 0 })
  const [status, setStatus] = useState<"yes" | "no" | "maybe" | null>(null)
  const [headcount, setHeadcount] = useState("1")
  const [guestName, setGuestName] = useState("")

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetchRsvpBySlug(slug)
      if (!res.ok) {
        Alert.alert("RSVP", res.error)
        navigation.goBack()
        return
      }
      setEvent(res.event)
      setTotals(res.totals)
    } finally {
      setLoading(false)
    }
  }, [navigation, slug])

  React.useEffect(() => {
    load()
  }, [load])

  const onSubmit = async () => {
    if (!status) {
      Alert.alert("RSVP", "Choose Yes, No, or Maybe.")
      return
    }
    const n = Math.min(50, Math.max(1, parseInt(headcount, 10) || 1))
    setSubmitting(true)
    try {
      const res = await submitRsvpResponse({
        slug,
        status,
        headcount: n,
        guestName: guestName.trim() || null,
      })
      if (!res.ok) {
        Alert.alert("RSVP", res.error)
        return
      }
      setTotals(res.totals)
      Alert.alert("Thank you", "Your RSVP was recorded.", [
        { text: "OK", onPress: () => navigation.goBack() },
      ])
    } finally {
      setSubmitting(false)
    }
  }

  const $pill = (active: boolean): ViewStyle => ({
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: active ? colors.palette.primary500 : colors.border,
    backgroundColor: active ? colors.palette.primary100 : colors.background,
    alignItems: "center",
  })

  const $pillText = (active: boolean): TextStyle => ({
    fontWeight: active ? "700" : "500",
    color: active ? colors.palette.primary500 : colors.text,
  })

  if (loading || !event) {
    return (
      <Screen preset="fixed" safeAreaEdges={["top"]} backgroundColor={colors.accentBackground}>
        <Header title="RSVP" showBackButton />
        <View style={$center}>
          <ActivityIndicator size="large" color={colors.palette.primary500} />
        </View>
      </Screen>
    )
  }

  if (event.closed_at) {
    return (
      <Screen preset="fixed" safeAreaEdges={["top"]} backgroundColor={colors.accentBackground}>
        <Header title="RSVP" showBackButton />
        <View style={$body}>
          <Text text="This RSVP is closed." color={colors.text} />
        </View>
      </Screen>
    )
  }

  return (
    <Screen preset="scroll" safeAreaEdges={["top"]} backgroundColor={colors.accentBackground}>
      <Header title="RSVP" showBackButton />
      <View style={$body}>
        <Text preset="subheading" weight="bold" text={event.title || `${event.event_type} jaman`} />
        <Text color={colors.textDim} text={`Host: ${event.host_label}`} />
        <Text color={colors.textDim} text={moment(event.scheduled_at).format("ddd D MMM YYYY, h:mm a")} />
        {event.message ? <Text style={$msg} color={colors.text} text={event.message} /> : null}

        <Text preset="formLabel" text="Current responses (people-count)" style={$mt} />
        <Text text={`Yes: ${totals.yes} · No: ${totals.no} · Maybe: ${totals.maybe}`} color={colors.textDim} />

        <Text preset="subheading" weight="bold" text="Your RSVP" style={$mt} />
        <View style={$row}>
          {(["yes", "no", "maybe"] as const).map((s) => (
            <Pressable key={s} style={$pill(status === s)} onPress={() => setStatus(s)}>
              <Text style={$pillText(status === s)} text={s.toUpperCase()} />
            </Pressable>
          ))}
        </View>

        <TextField
          label="How many people (including you)?"
          value={headcount}
          onChangeText={setHeadcount}
          keyboardType="number-pad"
        />
        <TextField label="Your name (optional)" value={guestName} onChangeText={setGuestName} />

        <Button text={submitting ? "Sending…" : "Submit RSVP"} preset="filled" onPress={onSubmit} disabled={submitting} />
      </View>
    </Screen>
  )
})

const $body: ViewStyle = {
  padding: spacing.lg,
  gap: spacing.md,
}

const $center: ViewStyle = {
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
}

const $msg: ViewStyle = {
  marginTop: spacing.sm,
}

const $mt: ViewStyle = {
  marginTop: spacing.md,
}

const $row: ViewStyle = {
  flexDirection: "row",
  gap: spacing.xs,
}
