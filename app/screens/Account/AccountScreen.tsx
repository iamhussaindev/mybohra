import {
  IconBell,
  IconCalendarEvent,
  IconChevronRight,
  IconLogout,
  IconSettings,
  IconUser,
} from "@tabler/icons-react-native"
import { Screen, Text } from "app/components"
import Header from "app/components/Header"
import type { TabScreenProps } from "app/navigators/NavigationTab"
import { useAuthStore } from "app/store"
import { spacing } from "app/theme"
import { useColors } from "app/theme/useColors"
import React, { useCallback } from "react"
import { Alert, Pressable, ScrollView, View, ViewStyle } from "react-native"

type AccountScreenProps = TabScreenProps<"Account">

type MenuItem = {
  id: string
  label: string
  subtitle?: string
  icon: React.ReactNode
  onPress: () => void
  destructive?: boolean
}

export function AccountScreen({ navigation }: AccountScreenProps) {
  const colors = useColors()
  const user = useAuthStore((s) => s.user)
  const signOut = useAuthStore((s) => s.signOut)

  const handleSignOut = useCallback(() => {
    Alert.alert("Sign out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign out",
        style: "destructive",
        onPress: () => void signOut(),
      },
    ])
  }, [signOut])

  const menuItems: MenuItem[] = [
    {
      id: "rsvp",
      label: "My RSVPs",
      subtitle: "Events you created or responded to",
      icon: <IconCalendarEvent size={22} color={colors.text} />,
      onPress: () => navigation.navigate("RsvpMyList"),
    },
    {
      id: "reminders",
      label: "Prayer reminders",
      subtitle: "Namaz notification settings",
      icon: <IconBell size={22} color={colors.text} />,
      onPress: () => navigation.navigate("ReminderSettings"),
    },
    {
      id: "settings",
      label: "Settings",
      subtitle: "Theme, language, cache",
      icon: <IconSettings size={22} color={colors.text} />,
      onPress: () => navigation.navigate("Settings"),
    },
  ]

  if (user) {
    menuItems.push({
      id: "signout",
      label: "Sign out",
      icon: <IconLogout size={22} color={colors.error} />,
      onPress: handleSignOut,
      destructive: true,
    })
  } else {
    menuItems.unshift({
      id: "signin",
      label: "Sign in",
      subtitle: "Access RSVP and saved preferences",
      icon: <IconUser size={22} color={colors.tint} />,
      onPress: () => navigation.navigate("AuthEmail", undefined),
    })
  }

  return (
    <Screen preset="fixed" safeAreaEdges={["top"]} backgroundColor={colors.background}>
      <Header title="Account" />
      <ScrollView contentContainerStyle={$content}>
        <View style={[$profileCard, { backgroundColor: colors.palette.neutral200 }]}>
          <View style={[$avatar, { backgroundColor: colors.tint }]}>
            <IconUser size={28} color="#fff" />
          </View>
          <View style={$profileText}>
            <Text weight="bold" size="md" style={{ color: colors.text }}>
              {user?.email ?? "Guest"}
            </Text>
            <Text size="sm" style={{ color: colors.textDim }}>
              {user ? "Signed in" : "Sign in to sync RSVPs"}
            </Text>
          </View>
        </View>

        <View style={$menu}>
          {menuItems.map((item) => (
            <Pressable
              key={item.id}
              onPress={item.onPress}
              style={[$menuRow, { borderBottomColor: colors.palette.neutral300 }]}
            >
              {item.icon}
              <View style={$menuBody}>
                <Text
                  weight="medium"
                  style={{ color: item.destructive ? colors.error : colors.text }}
                >
                  {item.label}
                </Text>
                {item.subtitle ? (
                  <Text size="xs" style={{ color: colors.textDim }}>
                    {item.subtitle}
                  </Text>
                ) : null}
              </View>
              <IconChevronRight size={18} color={colors.textDim} />
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </Screen>
  )
}

const $content: ViewStyle = {
  padding: spacing.md,
  paddingBottom: spacing.xxl,
}

const $profileCard: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  padding: spacing.md,
  borderRadius: spacing.md,
  marginBottom: spacing.lg,
  gap: spacing.md,
}

const $avatar: ViewStyle = {
  width: 52,
  height: 52,
  borderRadius: 26,
  alignItems: "center",
  justifyContent: "center",
}

const $profileText: ViewStyle = {
  flex: 1,
  gap: spacing.xxs,
}

const $menu: ViewStyle = {
  borderRadius: spacing.md,
  overflow: "hidden",
}

const $menuRow: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  paddingVertical: spacing.md,
  paddingHorizontal: spacing.sm,
  gap: spacing.md,
  borderBottomWidth: 1,
}

const $menuBody: ViewStyle = {
  flex: 1,
  gap: 2,
}
