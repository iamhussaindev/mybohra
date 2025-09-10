import {
  IconBell,
  IconBellOff,
  IconCurrentLocationFilled,
  IconEdit,
} from "@tabler/icons-react-native"
import { Button, Icon, IconTypes, ListView, Screen, Text } from "app/components"
import Header from "app/components/Header"
import { useLocationBottomSheet } from "app/contexts/LocationBottomSheetContext"
import { ITimes, CurrentGhari } from "app/helpers/namaz.helper"
import { useNextNamaz } from "app/hooks/useNextNamaz"
import { usePrayerTimesWithDate } from "app/hooks/usePrayerTimesWithDate"
import { useReminders } from "app/hooks/useReminders"
import { useStores } from "app/models"
import { AppStackScreenProps } from "app/navigators"
import { colors, spacing } from "app/theme"
import { getFormattedTime } from "app/utils/common"
import { momentTime } from "app/utils/currentTime"
import { observer } from "mobx-react-lite"
import { Moment } from "moment"
import React, { FC, useState } from "react"
import { ImageStyle, Pressable, SectionList, TextStyle, View, ViewStyle } from "react-native"

import { TestReminderButton } from "./components/TestReminderButton"

const timesToShow = {
  morning: {
    sihori: "Sihori End",
    fajr: "Fajr",
    sunrise_safe: "Fajr End",
  },
  noon: {
    zawaal: "Zawaal",
    zohr_end: "Zohr End",
    asr_end: "Asr End",
  },
  evening: {
    maghrib_safe: "Maghrib",
    nisful_layl: "Nisful Layl",
    nisful_layl_end: "Nisful Layl End",
  },
}

function NamazItem({
  value,
  name,
  group,
  isLast,
  onPress,
  isReminderEnabled,
}: {
  isLast: boolean
  currentGhari?: CurrentGhari
  nextNamazKey?: string
  value: string
  name: string
  times: ITimes
  group: string
  onPress: () => void
  isReminderEnabled: boolean
}) {
  // @ts-ignore
  const label = timesToShow[group as keyof typeof timesToShow][name]

  return (
    <View style={[$itemContainer, isLast && $lastItem]}>
      <View style={$labelStyle}>
        <Icon style={$labelIcon} size={28} icon={name as IconTypes} />
        <View>
          <Text style={$itemTextName}>{label}</Text>
        </View>
      </View>
      <View style={$itemTextContainer}>
        <Text weight="bold" style={$itemText}>
          {getFormattedTime(value)}
        </Text>
        <Pressable style={$reminderButton} onPress={onPress}>
          {isReminderEnabled ? (
            <IconBell size={20} color={colors.palette.primary500} />
          ) : (
            <IconBellOff size={20} color={colors.palette.neutral800} />
          )}
        </Pressable>
      </View>
    </View>
  )
}

const $reminderButton: ViewStyle = {
  padding: spacing.xs,
  marginLeft: spacing.sm,
  borderRadius: spacing.xxxl,
  backgroundColor: colors.palette.neutral100,
  borderWidth: 1,
  borderColor: colors.gray,
  shadowColor: colors.gray,
  shadowOffset: { width: 0, height: 5 },
  shadowOpacity: 1,
  shadowRadius: 10,
  elevation: 5,
}

const $itemTextContainer: ViewStyle = {
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
}

const $labelStyle: ViewStyle = {
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
}

const $labelIcon: ImageStyle = {
  marginRight: spacing.sm,
}

const $lastItem: ViewStyle = {
  borderBottomColor: colors.palette.neutral100,
}

const $itemContainer: ViewStyle = {
  padding: spacing.md,
  borderBottomWidth: 1,
  borderBottomColor: colors.gray,
  display: "flex",
  justifyContent: "space-between",
  flexDirection: "row",
  alignItems: "center",
}

const $itemTextName: TextStyle = {
  fontSize: 18,
}

const $itemText: TextStyle = {
  fontSize: 20,
  fontFamily: "spaceGroteskBold",
}

interface NamazScreenProps extends AppStackScreenProps<"Namaz"> {}

export const NamazScreen: FC<NamazScreenProps> = observer(function NamazScreen() {
  const [date, _setDate] = useState<Moment>(momentTime())
  const { dataStore } = useStores()
  const { openLocationBottomSheet } = useLocationBottomSheet()
  const { createReminder, deleteReminder, getRemindersForPrayerTime } = useReminders()

  const handleQuickReminder = async (prayerTime: keyof ITimes) => {
    // if any reminder exists for this prayer time, show a toast
    if (reminders.some((reminder) => reminder.prayerTime === prayerTime)) {
      // delete the reminder

      const reminders = getRemindersForPrayerTime(prayerTime as any)
      if (reminders.length > 0) {
        reminders.forEach(async (reminder) => {
          await deleteReminder(reminder.id)
        })
      }
    }

    try {
      await createReminder({
        name: `${prayerTime} Reminder`,
        prayerTime: prayerTime as any,
        offsetMinutes: -5, // 5 minutes before
        repeatType: "daily",
      })
    } catch (error) {
      console.error("Error creating reminder:", error)
    }
  }

  // log all reminders
  const { reminders } = useReminders()

  // Get prayer times for the selected date
  const { times } = usePrayerTimesWithDate(
    dataStore.currentLocation.latitude,
    dataStore.currentLocation.longitude,
    date,
  )

  // Get next namaz information with automatic updates
  const { nextNamazKey, currentGhari } = useNextNamaz(times)

  const groups = ["morning", "noon", "evening"]

  return (
    <Screen preset="fixed" safeAreaEdges={["top"]} contentContainerStyle={$screenContainer}>
      <SectionList
        ListHeaderComponent={
          <Header
            rightActions={[
              <Pressable style={$todayButton} key="today" onPress={() => _setDate(momentTime())}>
                <Text weight="bold">Today</Text>
              </Pressable>,
            ]}
            title="Namaz Timings"
            showBackButton
          />
        }
        contentContainerStyle={$sectionListContentContainer}
        stickySectionHeadersEnabled={true}
        scrollEnabled={false}
        renderItem={({ item }) => item}
        sections={[
          {
            name: "location",
            data: [
              <Button
                onPress={openLocationBottomSheet}
                style={$locationContainer}
                key="locationContainer"
              >
                <IconCurrentLocationFilled
                  style={$locationIcon}
                  color={colors.palette.neutral800}
                  size={18}
                />
                <Text size="sm" key="location" color={colors.palette.neutral800}>
                  {dataStore.currentLocation.city}
                </Text>
                <View style={$editButton}>
                  <IconEdit color={colors.palette.neutral800} size={24} />
                </View>
              </Button>,
            ],
          },
          {
            name: "testReminders",
            data: [
              <View key="testReminderButton" style={$testReminderContainer}>
                <TestReminderButton />
              </View>,
            ],
          },
          {
            name: "",
            description: "",
            data: groups.map((group) => {
              const activeGroup = currentGhari?.group === group
              return (
                <View style={[$listContainer, activeGroup && $activeGroupContainer]} key={group}>
                  <ListView
                    scrollEnabled={false}
                    estimatedItemSize={100}
                    data={Object.keys(timesToShow[group as keyof typeof timesToShow])}
                    renderItem={(key) => {
                      return (
                        <NamazItem
                          onPress={() => handleQuickReminder(key.item as keyof ITimes)}
                          isReminderEnabled={reminders.some(
                            (reminder) => reminder.prayerTime === key.item && reminder.isEnabled,
                          )}
                          isLast={
                            key.index ===
                            Object.keys(timesToShow[group as keyof typeof timesToShow]).length - 1
                          }
                          group={group}
                          currentGhari={currentGhari}
                          nextNamazKey={nextNamazKey}
                          name={key.item}
                          value={times[key.item as keyof typeof times]}
                          times={times}
                        />
                      )
                    }}
                  />
                </View>
              )
            }),
          },
        ]}
      />
    </Screen>
  )
})

const $locationIcon: ImageStyle = {
  marginRight: spacing.xs,
  marginTop: -2,
}

const $editButton: ViewStyle = {
  marginRight: spacing.sm,
  marginTop: -6,
}

const $locationContainer: ViewStyle = {
  backgroundColor: colors.palette.neutral100,
  borderRadius: 8,
  paddingHorizontal: spacing.md,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  marginBottom: spacing.md,
  marginHorizontal: spacing.md,
  height: 40,
  borderWidth: 1,
  borderColor: colors.palette.neutral300,
  shadowColor: colors.gray,
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 2,
}

const $testReminderContainer: ViewStyle = {
  marginHorizontal: spacing.md,
  marginTop: spacing.md,
  backgroundColor: colors.palette.neutral100,
  borderRadius: 10,
  borderWidth: 1,
  borderColor: colors.palette.neutral300,
  padding: spacing.md,
  shadowColor: colors.gray,
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 2,
}

const $todayButton: ViewStyle = {
  borderRadius: 10,
  backgroundColor: colors.palette.neutral100,
  marginEnd: spacing.sm,
}

const $activeGroupContainer: ViewStyle = {
  backgroundColor: colors.palette.neutral100,
  borderWidth: 1,
}

const $sectionListContentContainer: ViewStyle = {
  backgroundColor: colors.palette.neutral100,
}

const $listContainer: ViewStyle = {
  minHeight: 50,
  marginTop: spacing.sm,
  margin: spacing.md,
  marginBottom: spacing.sm,
  padding: spacing.xxs,
  shadowColor: colors.gray,
  shadowOffset: { width: 0, height: 5 },
  shadowOpacity: 1,
  shadowRadius: 10,
  borderRadius: 10,
  backgroundColor: colors.palette.neutral100,
  elevation: 5,
  borderColor: colors.gray,
  borderWidth: 1,
}

const $screenContainer: ViewStyle = {
  flex: 1,
}
