import { useFocusEffect } from "@react-navigation/native"
import { IconArrowLeft, IconBellRinging, IconShare } from "@tabler/icons-react-native"
import { Button, Text } from "app/components"
import { AppStackScreenProps } from "app/navigators"
import type { MyRsvpEvent } from "app/services/rsvp/fetchMyRsvps"
import { fetchMyRsvps } from "app/services/rsvp/fetchMyRsvps"
import { spacing } from "app/theme"
import { rsvpAppUrl, rsvpWebUrl } from "app/utils/rsvpLinks"
import { StatusBar } from "expo-status-bar"
import { observer } from "mobx-react-lite"
import moment from "moment"
import React, { FC, useCallback, useMemo, useState } from "react"
import {
  ActivityIndicator,
  Dimensions,
  ImageBackground,
  Pressable,
  ScrollView,
  Share,
  View,
  ViewStyle,
  TextStyle,
  ImageStyle,
} from "react-native"
import { LinearGradient } from "react-native-linear-gradient"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import Toast from "react-native-toast-message"

const { height: SCREEN_H } = Dimensions.get("window")

const FOOD_MESSAGE =
  "When every thaal is counted, nothing goes to waste. RSVP so your host can prepare with care—no embarrassment from empty seats, and no guilt from food left behind."

type Props = AppStackScreenProps<"Rsvp">

/** Replace `assets/images/rsvp-thaal-bg.jpg` with your Dawoodi Bohra thaal lineup photo for best results. */
const THAAL_BG = require("../../../assets/images/rsvp-thaal-bg.jpg")

async function copyToClipboard(text: string): Promise<void> {
  try {
    // Require inside the handler so missing native `ExpoClipboard` (stale dev client) does not
    // crash the screen on first paint; falls back to Share below.
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const Clipboard = require("expo-clipboard") as typeof import("expo-clipboard")
    await Clipboard.setStringAsync(text)
    Toast.show({ type: "success", text1: "Link copied", text2: "Paste to share with guests." })
  } catch {
    await Share.share({ message: text })
  }
}

function pickActiveEvent(events: MyRsvpEvent[]): MyRsvpEvent | null {
  if (!events.length) return null
  const open = events.filter((e) => !e.closed_at)
  const pool = open.length ? open : events
  return [...pool].sort(
    (a, b) => new Date(b.scheduled_at).getTime() - new Date(a.scheduled_at).getTime(),
  )[0]
}

export const RsvpScreen: FC<Props> = observer(function RsvpScreen({ navigation }) {
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

  const active = useMemo(() => pickActiveEvent(events), [events])
  const showMyList = events.length > 1

  const shareUrl = active ? rsvpWebUrl(active.slug) || rsvpAppUrl(active.slug) : ""

  const onSendReminder = async () => {
    if (!active) return
    const web = rsvpWebUrl(active.slug)
    const app = rsvpAppUrl(active.slug)
    const when = moment(active.scheduled_at).format("ddd D MMM, h:mm a")
    const title = active.title || active.event_type
    try {
      await Share.share({
        message: `Reminder: ${title} on ${when}. Please RSVP so we can plan thaals.\n${web || app}`,
        url: web || app,
      })
    } catch {
      /* dismissed */
    }
  }

  return (
    <View style={$root}>
      <StatusBar style="light" />
      <ImageBackground source={THAAL_BG} style={$bg} resizeMode="cover">
        <LinearGradient
          colors={["rgba(0,0,0,0.35)", "rgba(15,8,6,0.55)", "rgba(25,12,8,0.92)"]}
          locations={[0, 0.45, 1]}
          style={$gradient}
        >
          <Pressable
            onPress={() => navigation.goBack()}
            style={[$backBtn, { top: insets.top + 8 }]}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <IconArrowLeft size={22} color="#fff" />
          </Pressable>

          <ScrollView
            contentContainerStyle={[
              $scroll,
              { paddingTop: insets.top + 52, paddingBottom: 120 + insets.bottom },
            ]}
            showsVerticalScrollIndicator={false}
          >
            <Text style={$heroTitle} text="RSVP & Jaman" />
            <Text style={$heroSub} text="Dawoodi Bohra gatherings" />

            <View style={$glass}>
              <Text style={$msg} text={FOOD_MESSAGE} />
            </View>

            {loading ? (
              <View style={$loading}>
                <ActivityIndicator color="#fff" size="large" />
              </View>
            ) : active ? (
              <View style={$glass}>
                <Text style={$cardLabel} text="Active RSVP" />
                <Text
                  style={$cardTitle}
                  text={active.title || active.event_type}
                  numberOfLines={2}
                />
                <Text
                  style={$cardMeta}
                  text={`${moment(active.scheduled_at).format("ddd D MMM YYYY · h:mm a")} · ${
                    active.host_label
                  }`}
                />
                <View style={$statsRow}>
                  <View style={$statBox}>
                    <Text style={$statNum} text={String(active.totals.responses)} />
                    <Text style={$statLab} text="Responses" />
                  </View>
                  <View style={$statBox}>
                    <Text style={$statNum} text={String(active.totals.yes)} />
                    <Text style={$statLab} text="Thaal (Yes)" />
                  </View>
                  <View style={$statBox}>
                    <Text style={$statNum} text={String(active.totals.maybe)} />
                    <Text style={$statLab} text="Maybe" />
                  </View>
                </View>
                <Pressable
                  style={$copyRow}
                  onPress={() => copyToClipboard(shareUrl)}
                  accessibilityRole="button"
                >
                  <IconShare size={20} color="#fff" />
                  <Text style={$copyText} text="Copy RSVP link" numberOfLines={1} />
                </Pressable>
                <Pressable style={$remindBtn} onPress={onSendReminder} accessibilityRole="button">
                  <IconBellRinging size={20} color="#1a0a06" />
                  <Text style={$remindText} text="Send reminder" />
                </Pressable>
              </View>
            ) : (
              <View style={$glass}>
                <Text
                  style={$empty}
                  text="No active RSVP yet. Tap Create below to start your first jaman count."
                />
              </View>
            )}
          </ScrollView>

          <View style={[$bottomBar, { paddingBottom: Math.max(insets.bottom, 12) + 8 }]}>
            <View style={$bottomRow}>
              {showMyList ? (
                <Button
                  text="My list"
                  preset="reversed"
                  style={$btnList}
                  textStyle={$btnListText}
                  onPress={() => navigation.navigate("RsvpMyList")}
                />
              ) : null}
              <Button
                text="Create RSVP"
                preset="filled"
                style={[$btnCreate, !showMyList && $btnCreateFull]}
                onPress={() => navigation.navigate("RsvpCreate")}
              />
            </View>
          </View>
        </LinearGradient>
      </ImageBackground>
    </View>
  )
})

const $root: ViewStyle = {
  flex: 1,
  minHeight: SCREEN_H,
  backgroundColor: "#1a0a06",
}

const $bg: ImageStyle = {
  flex: 1,
  width: "100%",
  minHeight: SCREEN_H,
}

const $gradient: ViewStyle = {
  flex: 1,
  minHeight: SCREEN_H,
}

const $backBtn: ViewStyle = {
  position: "absolute",
  left: spacing.md,
  zIndex: 20,
  width: 44,
  height: 44,
  borderRadius: 22,
  backgroundColor: "rgba(0,0,0,0.35)",
  alignItems: "center",
  justifyContent: "center",
  borderWidth: 1,
  borderColor: "rgba(255,255,255,0.2)",
}

const $scroll: ViewStyle = {
  paddingHorizontal: spacing.lg,
}

const $heroTitle: TextStyle = {
  fontSize: 32,
  fontWeight: "800",
  color: "#fff",
  letterSpacing: 0.5,
  marginBottom: spacing.xxs,
}

const $heroSub: TextStyle = {
  fontSize: 15,
  color: "rgba(255,255,255,0.85)",
  marginBottom: spacing.lg,
}

const $glass: ViewStyle = {
  backgroundColor: "rgba(255,255,255,0.1)",
  borderRadius: 16,
  borderWidth: 1,
  borderColor: "rgba(255,255,255,0.22)",
  padding: spacing.lg,
  marginBottom: spacing.md,
}

const $msg: TextStyle = {
  color: "rgba(255,255,255,0.95)",
  fontSize: 15,
  lineHeight: 22,
}

const $loading: ViewStyle = {
  paddingVertical: spacing.xl,
  alignItems: "center",
}

const $cardLabel: TextStyle = {
  color: "rgba(255,255,255,0.65)",
  fontSize: 12,
  textTransform: "uppercase",
  letterSpacing: 1,
  marginBottom: spacing.xs,
}

const $cardTitle: TextStyle = {
  color: "#fff",
  fontSize: 22,
  fontWeight: "700",
  marginBottom: spacing.xs,
}

const $cardMeta: TextStyle = {
  color: "rgba(255,255,255,0.8)",
  fontSize: 14,
  marginBottom: spacing.md,
}

const $statsRow: ViewStyle = {
  flexDirection: "row",
  gap: spacing.sm,
  marginBottom: spacing.md,
}

const $statBox: ViewStyle = {
  flex: 1,
  backgroundColor: "rgba(0,0,0,0.25)",
  borderRadius: 12,
  paddingVertical: spacing.sm,
  alignItems: "center",
}

const $statNum: TextStyle = {
  color: "#fff",
  fontSize: 22,
  fontWeight: "800",
}

const $statLab: TextStyle = {
  color: "rgba(255,255,255,0.7)",
  fontSize: 11,
  marginTop: 2,
}

const $copyRow: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  gap: spacing.sm,
  backgroundColor: "rgba(255,255,255,0.15)",
  paddingVertical: spacing.md,
  paddingHorizontal: spacing.md,
  borderRadius: 12,
  marginBottom: spacing.sm,
}

const $copyText: TextStyle = {
  color: "#fff",
  fontWeight: "600",
  flex: 1,
}

const $remindBtn: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  gap: spacing.sm,
  backgroundColor: "rgba(255,230,200,0.95)",
  paddingVertical: spacing.md,
  borderRadius: 12,
}

const $remindText: TextStyle = {
  color: "#1a0a06",
  fontWeight: "700",
  fontSize: 16,
}

const $empty: TextStyle = {
  color: "rgba(255,255,255,0.9)",
  fontSize: 15,
  lineHeight: 22,
}

const $bottomBar: ViewStyle = {
  position: "absolute",
  left: 0,
  right: 0,
  bottom: 0,
  paddingHorizontal: spacing.lg,
  paddingTop: spacing.md,
  backgroundColor: "rgba(0,0,0,0.72)",
  borderTopWidth: 1,
  borderTopColor: "rgba(255,255,255,0.12)",
}

const $bottomRow: ViewStyle = {
  flexDirection: "row",
  gap: spacing.sm,
  alignItems: "stretch",
}

const $btnList: ViewStyle = {
  minWidth: 108,
  backgroundColor: "rgba(255,255,255,0.2)",
  borderWidth: 1,
  borderColor: "rgba(255,255,255,0.35)",
}

const $btnListText: TextStyle = {
  color: "#fff",
}

const $btnCreate: ViewStyle = {
  flex: 1,
}

const $btnCreateFull: ViewStyle = {
  flexGrow: 1,
}
