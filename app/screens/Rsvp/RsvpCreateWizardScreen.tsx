import { Button, Icon, Screen, Text, TextField } from "app/components"
import Header from "app/components/Header"
import { useStores } from "app/models"
import type { AppStackScreenProps } from "app/navigators"
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
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
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

const WIZARD_STEP_TITLES = ["Purpose", "Host", "When", "Message", "Review"] as const

function getStepSubtitle(step: number, eventType: EventType): string {
  switch (step) {
    case 0:
      return "Choose the purpose of the event"
    case 1:
      return eventType === "miqaat"
        ? "Jamaat or society hosting this jaman"
        : "Name shown to guests on the invite"
    case 2:
      return "Date and time for your event"
    case 3:
      return "Write or refine your invitation"
    case 4:
      return "Confirm details before sharing your link"
    default:
      return ""
  }
}

function eventTypeLabel(id: EventType): string {
  return EVENT_TYPES.find((t) => t.id === id)?.label ?? id
}

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

  const linkedMiqaatName = useMemo(() => {
    if (linkedMiqaatId == null) return null
    return miqaatStore.list.find((m) => m.id === linkedMiqaatId)?.name ?? null
  }, [linkedMiqaatId, miqaatStore.list])

  const $card = useMemo((): ViewStyle => {
    return {
      backgroundColor: colors.background,
      borderRadius: 16,
      padding: spacing.lg,
      borderWidth: 1,
      borderColor: colors.border,
      ...(Platform.OS === "ios"
        ? {
            shadowColor: "#000",
            shadowOpacity: 0.07,
            shadowRadius: 14,
            shadowOffset: { width: 0, height: 6 },
          }
        : { elevation: 2 }),
    }
  }, [colors.background, colors.border])

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

  const $typeRow = (active: boolean): ViewStyle => ({
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: active ? colors.palette.brown1000 : colors.border,
    backgroundColor: active ? colors.palette.brown100 : colors.background,
    marginBottom: spacing.sm,
  })

  const $miqaatRow = (active: boolean): ViewStyle => ({
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: 10,
    marginBottom: spacing.xs,
    borderWidth: 1,
    borderColor: active ? colors.palette.primary400 : "transparent",
    backgroundColor: active ? colors.palette.primary10 : colors.background,
  })

  return (
    <Screen preset="scroll" safeAreaEdges={["top"]} backgroundColor={colors.accentBackground}>
      <Header title={WIZARD_STEP_TITLES[step]} showBackButton />
      <ScrollView contentContainerStyle={$scroll} keyboardShouldPersistTaps="handled">
        <View style={$progressWrap}>
          <View style={$progressTrack}>
            {WIZARD_STEP_TITLES.map((_, i) => (
              <View
                key={i}
                style={[
                  $progressSegment,
                  {
                    backgroundColor: i <= step ? colors.palette.brown1000 : colors.border,
                  },
                ]}
              />
            ))}
          </View>
        </View>

        <Text
          preset="formHelper"
          color={colors.textDim}
          text={getStepSubtitle(step, eventType)}
          style={$stepSubtitle}
        />

        {step === 0 && (
          <View style={$cardBlock}>
            {EVENT_TYPES.map((t) => {
              const active = eventType === t.id
              return (
                <Pressable
                  key={t.id}
                  onPress={() => onPickType(t.id)}
                  style={$typeRow(active)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                >
                  <View
                    style={[
                      $typeLetter,
                      {
                        borderColor: active ? colors.palette.brown1000 : colors.border,
                        backgroundColor: active ? colors.palette.brown1000 : colors.background,
                      },
                    ]}
                  >
                    <Text
                      weight="bold"
                      style={{ color: active ? colors.palette.primary600 : colors.text }}
                      text={t.label.slice(0, 1)}
                    />
                  </View>
                  <Text
                    style={$typeLabel}
                    weight={active ? "bold" : "medium"}
                    color={colors.text}
                    text={t.label}
                  />
                  {active ? (
                    <Icon icon="check" size={20} color={colors.palette.primary500} />
                  ) : (
                    <View style={$typeChevronSpacer} />
                  )}
                </Pressable>
              )
            })}
            <Button text="Continue" preset="reversed" style={$navBtn} onPress={() => setStep(1)} />
          </View>
        )}

        {step === 1 && (
          <View style={[$card, $cardBlock]}>
            <TextField
              label={eventType === "miqaat" ? "Jamaat / society name" : "Host name"}
              value={hostLabel}
              onChangeText={setHostLabel}
              containerStyle={$fieldTight}
            />
            {eventType === "miqaat" && (
              <View style={$miqaatSection}>
                <Text preset="formLabel" weight="medium" text="Link calendar miqaat (optional)" />
                <Text
                  preset="formHelper"
                  color={colors.textDim}
                  text="Search and tap a miqaat to attach it to this invite."
                  style={$helperBelowLabel}
                />
                <TextField
                  value={miqaatQuery}
                  onChangeText={setMiqaatQuery}
                  placeholder="Search miqaats"
                  containerStyle={$fieldTight}
                />
                <FlatList
                  data={filteredMiqaats}
                  keyExtractor={(item) => String(item.id)}
                  scrollEnabled={false}
                  renderItem={({ item }) => {
                    const on = linkedMiqaatId === item.id
                    return (
                      <Pressable
                        style={$miqaatRow(on)}
                        onPress={() =>
                          setLinkedMiqaatId(item.id === linkedMiqaatId ? null : item.id)
                        }
                      >
                        <Text text={item.name} numberOfLines={2} color={colors.text} />
                      </Pressable>
                    )
                  }}
                />
              </View>
            )}
            <View style={$navRow}>
              <Button text="Back" preset="filled" onPress={() => setStep(0)} style={$navBtn} />
              <Button
                text="Continue"
                preset="reversed"
                onPress={() => setStep(2)}
                style={$navBtn}
              />
            </View>
          </View>
        )}

        {step === 2 && (
          <View style={[$card, $cardBlock]}>
            <View style={$whenRow}>
              <View style={$whenField}>
                <TextField
                  label="Date"
                  value={dateStr}
                  onChangeText={setDateStr}
                  placeholder="YYYY-MM-DD"
                />
              </View>
              <View style={$whenField}>
                <TextField
                  label="Time"
                  value={timeStr}
                  onChangeText={setTimeStr}
                  placeholder="HH:mm"
                />
              </View>
            </View>
            <Text preset="formHelper" color={colors.textDim} text="Use 24-hour time, e.g. 18:30" />
            <View style={$navRow}>
              <Button text="Back" preset="filled" onPress={() => setStep(1)} style={$navBtn} />
              <Button
                text="Continue"
                preset="reversed"
                onPress={() => setStep(3)}
                style={$navBtn}
              />
            </View>
          </View>
        )}

        {step === 3 && (
          <View style={[$card, $cardBlock]}>
            <TextField label="Short title (optional)" value={title} onChangeText={setTitle} />
            <TextField
              label="Invitation text"
              value={message}
              onChangeText={setMessage}
              multiline={true}
              containerStyle={$multiline}
            />
            <View
              style={[
                $aiRow,
                { backgroundColor: colors.palette.neutral200, borderColor: colors.border },
              ]}
            >
              {aiLoading ? (
                <ActivityIndicator color={colors.palette.primary500} style={$aiSpinner} />
              ) : null}
              <Button
                text={aiLoading ? "Working…" : "Improve with AI"}
                preset="reversed"
                onPress={onAiSuggest}
                disabled={aiLoading}
                style={$aiButton}
              />
            </View>
            <View style={$navRow}>
              <Button text="Back" preset="filled" onPress={() => setStep(2)} style={$navBtn} />
              <Button
                text="Continue"
                preset="reversed"
                onPress={() => setStep(4)}
                style={$navBtn}
              />
            </View>
          </View>
        )}

        {step === 4 && (
          <View style={[$card, $cardBlock]}>
            {(
              [
                { label: "Event", value: eventTypeLabel(eventType) },
                {
                  label: eventType === "miqaat" ? "Jamaat / host" : "Host",
                  value: hostLabel || "—",
                },
                { label: "When", value: `${dateStr} · ${timeStr}` },
                ...(title.trim()
                  ? ([{ label: "Title", value: title.trim() }] as {
                      label: string
                      value: string
                    }[])
                  : []),
                ...(eventType === "miqaat" && linkedMiqaatName
                  ? ([{ label: "Linked miqaat", value: linkedMiqaatName }] as {
                      label: string
                      value: string
                    }[])
                  : []),
              ] as { label: string; value: string }[]
            ).map((row, idx, arr) => (
              <View
                key={row.label}
                style={[
                  $reviewRow,
                  idx < arr.length - 1 && {
                    borderBottomWidth: StyleSheet.hairlineWidth,
                    borderBottomColor: colors.border,
                  },
                ]}
              >
                <Text preset="formHelper" color={colors.textDim} text={row.label} />
                <Text
                  preset="formLabel"
                  weight="bold"
                  color={colors.text}
                  text={row.value}
                  style={$reviewValue}
                />
              </View>
            ))}
            <View
              style={[
                $messagePreview,
                { borderColor: colors.border, backgroundColor: colors.accentBackground },
              ]}
            >
              <Text
                preset="formHelper"
                color={colors.textDim}
                text="Message preview"
                style={$previewLabel}
              />
              <Text
                color={colors.textDim}
                text={message.slice(0, 280) + (message.length > 280 ? "…" : "")}
                size="sm"
              />
            </View>
            <Button
              text={submitLoading ? "Creating…" : "Create & share link"}
              preset="reversed"
              onPress={onSubmit}
              disabled={submitLoading}
            />
            <Button text="Back" preset="filled" onPress={() => setStep(3)} />
          </View>
        )}
      </ScrollView>
    </Screen>
  )
})

const $scroll: ViewStyle = {
  padding: spacing.lg,
  paddingBottom: spacing.xxxl,
}

const $progressWrap: ViewStyle = {
  marginBottom: spacing.md,
}

const $progressTrack: ViewStyle = {
  flexDirection: "row",
  gap: spacing.xs,
}

const $progressSegment: ViewStyle = {
  flex: 1,
  height: 4,
  borderRadius: 2,
}

const $stepSubtitle: TextStyle = {
  marginBottom: spacing.lg,
  lineHeight: 20,
}

const $cardBlock: ViewStyle = {
  gap: spacing.md,
}

const $typeLetter: ViewStyle = {
  width: 40,
  height: 40,
  borderRadius: 12,
  borderWidth: 1,
  alignItems: "center",
  justifyContent: "center",
  marginRight: spacing.md,
}

const $typeLabel: TextStyle = {
  flex: 1,
  fontSize: 17,
}

const $typeChevronSpacer: ViewStyle = {
  width: 20,
}

const $fieldTight: ViewStyle = {
  marginBottom: 0,
}

const $miqaatSection: ViewStyle = {
  gap: spacing.xs,
}

const $helperBelowLabel: TextStyle = {
  marginTop: -spacing.xxs,
  marginBottom: spacing.xs,
}

const $multiline: ViewStyle = {
  minHeight: 140,
}

const $navRow: ViewStyle = {
  flexDirection: "row",
  gap: spacing.sm,
  marginTop: spacing.sm,
}

const $navBtn: ViewStyle = {
  flex: 1,
  borderRadius: 100,
}

const $whenRow: ViewStyle = {
  flexDirection: "row",
  gap: spacing.sm,
}

const $whenField: ViewStyle = {
  flex: 1,
}

const $aiRow: ViewStyle = {
  borderRadius: 12,
  borderWidth: 1,
  padding: spacing.sm,
  flexDirection: "row",
  alignItems: "center",
  gap: spacing.sm,
}

const $aiSpinner: ViewStyle = {
  marginLeft: spacing.sm,
}

const $aiButton: ViewStyle = {
  flex: 1,
}

const $reviewRow: ViewStyle = {
  paddingVertical: spacing.md,
}

const $reviewValue: TextStyle = {
  marginTop: spacing.xxs,
}

const $messagePreview: ViewStyle = {
  borderRadius: 12,
  borderWidth: 1,
  padding: spacing.md,
}

const $previewLabel: TextStyle = {
  marginBottom: spacing.xs,
}
