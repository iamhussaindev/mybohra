import { Button, Screen, Text, TextField } from "app/components"
import Header from "app/components/Header"
import { useStores } from "app/models"
import { AppStackScreenProps } from "app/navigators"
import { invokeAiSuggest } from "app/services/ai"
import { getOrCreateDeviceId } from "app/services/deviceTracking"
import { createRsvpEvent } from "app/services/rsvp"
import type { Database } from "app/services/supabase/types"
import { spacing } from "app/theme"
import { useColors } from "app/theme/useColors"
import { rsvpAppUrl, rsvpWebUrl } from "app/utils/rsvpLinks"
import { observer } from "mobx-react-lite"
import moment from "moment"
import React, { FC, useMemo, useState } from "react"
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  ScrollView,
  Share,
  View,
  ViewStyle,
  TextStyle,
} from "react-native"

type RsvpEventRow = Database["public"]["Tables"]["rsvp_events"]["Row"]

type EventType = RsvpEventRow["event_type"]
type Props = AppStackScreenProps<"RsvpCreate">

const EVENT_TYPES: { id: EventType; label: string }[] = [
  { id: "miqaat", label: "Miqaat" },
  { id: "darees", label: "Darees" },
  { id: "majlis", label: "Majlis" },
  { id: "shadi", label: "Shadi" },
  { id: "birthday", label: "Birthday" },
]

function defaultMessage(type: EventType): string {
  switch (type) {
    case "miqaat":
      return "You are warmly invited to join us for jaman after miqaat. Please RSVP so we can plan food."
    case "darees":
      return "You are invited to our darees jaman. Kindly RSVP with the number attending."
    case "majlis":
      return "Please join us for majlis followed by jaman. RSVP helps us prepare enough."
    case "shadi":
      return "We invite you to celebrate with us. Please RSVP with guest count."
    case "birthday":
      return "Join us for a birthday jaman gathering. RSVP appreciated."
    default:
      return "Please RSVP for our community jaman."
  }
}

export const RsvpCreateWizardScreen: FC<Props> = observer(function RsvpCreateWizardScreen({
  navigation,
}) {
  const colors = useColors()
  const { miqaatStore } = useStores()
  const [step, setStep] = useState(0)
  const [eventType, setEventType] = useState<EventType>("darees")
  const [hostLabel, setHostLabel] = useState("")
  const [linkedMiqaatId, setLinkedMiqaatId] = useState<number | null>(null)
  const [dateStr, setDateStr] = useState(moment().format("YYYY-MM-DD"))
  const [timeStr, setTimeStr] = useState("18:30")
  const [title, setTitle] = useState("")
  const [message, setMessage] = useState(defaultMessage("darees"))
  const [miqaatQuery, setMiqaatQuery] = useState("")
  const [aiLoading, setAiLoading] = useState(false)
  const [submitLoading, setSubmitLoading] = useState(false)

  const hostMode: RsvpEventRow["host_mode"] = eventType === "miqaat" ? "jamaat" : "individual"

  const scheduledIso = useMemo(() => {
    const m = moment(`${dateStr} ${timeStr}`, "YYYY-MM-DD HH:mm", true)
    if (!m.isValid()) return null
    return m.toISOString()
  }, [dateStr, timeStr])

  const filteredMiqaats = useMemo(() => {
    const q = miqaatQuery.trim().toLowerCase()
    const list = miqaatStore.list.slice().sort((a, b) => a.name.localeCompare(b.name))
    if (!q) return list.slice(0, 40)
    return list.filter((m) => m.name.toLowerCase().includes(q)).slice(0, 40)
  }, [miqaatQuery, miqaatStore.list])

  const onPickType = (t: EventType) => {
    setEventType(t)
    setMessage(defaultMessage(t))
    if (t !== "miqaat") {
      setLinkedMiqaatId(null)
    }
  }

  const onAiSuggest = async () => {
    if (!scheduledIso) {
      Alert.alert("Date & time", "Fix date and time before using AI.")
      return
    }
    setAiLoading(true)
    try {
      const deviceId = await getOrCreateDeviceId()
      const res = await invokeAiSuggest({
        purpose: "rsvp_message",
        deviceId,
        context: {
          event_type: eventType,
          host_mode: hostMode,
          host_label: hostLabel,
          scheduled_at: scheduledIso,
          title,
          draft: message,
        },
      })
      if (!res.ok) {
        Alert.alert("AI", res.error)
        return
      }
      setMessage(res.suggestions[0] ?? message)
    } finally {
      setAiLoading(false)
    }
  }

  const onSubmit = async () => {
    if (!scheduledIso) {
      Alert.alert("Date & time", "Enter a valid date (YYYY-MM-DD) and time (HH:mm).")
      return
    }
    if (!hostLabel.trim()) {
      Alert.alert(
        "Host",
        eventType === "miqaat" ? "Enter jamaat / society name." : "Enter host name.",
      )
      return
    }
    setSubmitLoading(true)
    try {
      const res = await createRsvpEvent({
        event_type: eventType,
        host_mode: hostMode,
        scheduled_at: scheduledIso,
        message: message.trim() || null,
        title: title.trim() || null,
        host_label: hostLabel.trim(),
        linked_miqaat_id: eventType === "miqaat" ? linkedMiqaatId : null,
      })
      if (!res.ok) {
        Alert.alert("RSVP", res.error)
        return
      }
      const web = rsvpWebUrl(res.slug)
      const appUrl = rsvpAppUrl(res.slug)
      const shareLines = [
        "RSVP for our jaman — tap to respond:",
        web || appUrl,
        web ? `(App: ${appUrl})` : "",
      ].filter(Boolean)
      await Share.share({ message: shareLines.join("\n") })
      navigation.pop()
    } finally {
      setSubmitLoading(false)
    }
  }

  const $chip = (active: boolean): ViewStyle => ({
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: active ? colors.palette.primary500 : colors.border,
    backgroundColor: active ? colors.palette.primary100 : colors.background,
    marginRight: spacing.xs,
    marginBottom: spacing.xs,
  })

  const $chipText = (active: boolean): TextStyle => ({
    color: active ? colors.palette.primary500 : colors.text,
    fontWeight: active ? "700" : "500",
  })

  return (
    <Screen preset="scroll" safeAreaEdges={["top"]} backgroundColor={colors.accentBackground}>
      <Header title="New RSVP" showBackButton />
      <ScrollView contentContainerStyle={$scroll} keyboardShouldPersistTaps="handled">
        <Text preset="formHelper" color={colors.textDim} text={`Step ${step + 1} of 5`} />

        {step === 0 && (
          <View style={$block}>
            <Text preset="subheading" weight="bold" text="Purpose" />
            <View style={$rowWrap}>
              {EVENT_TYPES.map((t) => (
                <Pressable
                  key={t.id}
                  onPress={() => onPickType(t.id)}
                  style={$chip(eventType === t.id)}
                >
                  <Text style={$chipText(eventType === t.id)} text={t.label} />
                </Pressable>
              ))}
            </View>
            <Button text="Next" preset="filled" onPress={() => setStep(1)} />
          </View>
        )}

        {step === 1 && (
          <View style={$block}>
            <Text
              preset="subheading"
              weight="bold"
              text={eventType === "miqaat" ? "Jamaat" : "Host"}
            />
            <TextField
              label={eventType === "miqaat" ? "Jamaat / society name" : "Host name"}
              value={hostLabel}
              onChangeText={setHostLabel}
              containerStyle={$fieldGap}
            />
            {eventType === "miqaat" && (
              <View style={$fieldGap}>
                <Text preset="formLabel" text="Link calendar miqaat (optional)" />
                <TextField
                  value={miqaatQuery}
                  onChangeText={setMiqaatQuery}
                  placeholder="Search miqaats"
                />
                <FlatList
                  data={filteredMiqaats}
                  keyExtractor={(item) => String(item.id)}
                  scrollEnabled={false}
                  renderItem={({ item }) => (
                    <Pressable
                      style={[$miqaatRow, linkedMiqaatId === item.id && $miqaatRowActive]}
                      onPress={() => setLinkedMiqaatId(item.id === linkedMiqaatId ? null : item.id)}
                    >
                      <Text text={item.name} numberOfLines={2} />
                    </Pressable>
                  )}
                />
              </View>
            )}
            <View style={$navRow}>
              <Button text="Back" preset="reversed" onPress={() => setStep(0)} />
              <Button text="Next" preset="filled" onPress={() => setStep(2)} />
            </View>
          </View>
        )}

        {step === 2 && (
          <View style={$block}>
            <Text preset="subheading" weight="bold" text="When" />
            <TextField label="Date (YYYY-MM-DD)" value={dateStr} onChangeText={setDateStr} />
            <TextField label="Time (24h HH:mm)" value={timeStr} onChangeText={setTimeStr} />
            <View style={$navRow}>
              <Button text="Back" preset="reversed" onPress={() => setStep(1)} />
              <Button text="Next" preset="filled" onPress={() => setStep(3)} />
            </View>
          </View>
        )}

        {step === 3 && (
          <View style={$block}>
            <Text preset="subheading" weight="bold" text="Message" />
            <TextField label="Short title (optional)" value={title} onChangeText={setTitle} />
            <TextField
              label="Invitation text"
              value={message}
              onChangeText={setMessage}
              multiline={true}
              containerStyle={$multiline}
            />
            {aiLoading ? <ActivityIndicator color={colors.palette.primary500} /> : null}
            <Button
              text={aiLoading ? "Working…" : "Improve with AI"}
              preset="reversed"
              onPress={onAiSuggest}
              disabled={aiLoading}
            />
            <View style={$navRow}>
              <Button text="Back" preset="reversed" onPress={() => setStep(2)} />
              <Button text="Next" preset="filled" onPress={() => setStep(4)} />
            </View>
          </View>
        )}

        {step === 4 && (
          <View style={$block}>
            <Text preset="subheading" weight="bold" text="Review" />
            <Text color={colors.text} text={`Type: ${eventType}`} />
            <Text color={colors.text} text={`Host: ${hostLabel}`} />
            <Text color={colors.text} text={`When: ${dateStr} ${timeStr}`} />
            <Text
              color={colors.textDim}
              text={message.slice(0, 200) + (message.length > 200 ? "…" : "")}
            />
            <Button
              text={submitLoading ? "Creating…" : "Create & share link"}
              preset="filled"
              onPress={onSubmit}
              disabled={submitLoading}
            />
            <Button text="Back" preset="reversed" onPress={() => setStep(3)} />
          </View>
        )}
      </ScrollView>
    </Screen>
  )
})

const $scroll: ViewStyle = {
  padding: spacing.lg,
  paddingBottom: spacing.xxl,
}

const $block: ViewStyle = {
  marginTop: spacing.md,
  gap: spacing.md,
}

const $rowWrap: ViewStyle = {
  flexDirection: "row",
  flexWrap: "wrap",
  marginTop: spacing.sm,
}

const $fieldGap: ViewStyle = {
  marginTop: spacing.sm,
}

const $multiline: ViewStyle = {
  minHeight: 120,
}

const $navRow: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-between",
  gap: spacing.md,
  marginTop: spacing.md,
}

const $miqaatRow: ViewStyle = {
  paddingVertical: spacing.sm,
  borderBottomWidth: 1,
  borderBottomColor: "#00000014",
}

const $miqaatRowActive: ViewStyle = {
  backgroundColor: "#00000008",
}
