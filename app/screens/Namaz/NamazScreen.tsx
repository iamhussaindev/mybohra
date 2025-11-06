import {
  IconBell,
  IconBellCog,
  IconBellOff,
  IconChevronRight,
  IconCurrentLocationFilled,
} from "@tabler/icons-react-native"
import {
  BottomSheetDrawer,
  Icon,
  IconTypes,
  ListView,
  Screen,
  Switch,
  Text,
  Skeleton,
} from "app/components"
import Header from "app/components/Header"
import { useLocationBottomSheet } from "app/contexts/LocationBottomSheetContext"
import { ITimes, CurrentGhari } from "app/helpers/namaz.helper"
import { useNextNamaz } from "app/hooks/useNextNamaz"
import { usePrayerTimesWithDate } from "app/hooks/usePrayerTimesWithDate"
import { useReminders } from "app/hooks/useReminders"
import { useStores } from "app/models"
import { AppStackScreenProps } from "app/navigators"
import { colors, spacing, typography } from "app/theme"
import { getFormattedTime } from "app/utils/common"
import { momentTime } from "app/utils/currentTime"
import { observer } from "mobx-react-lite"
import { Moment } from "moment"
import React, { FC, useRef, useState } from "react"
import { ImageStyle, Pressable, SectionList, TextStyle, View, ViewStyle } from "react-native"

import ReminderOffsetSelector from "../Reminders/ReminderOffsetSelector"

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

const alarmKeys = ["fajr", "zawaal", "maghrib_safe", "nisful_layl", "sihori"]

function NamazItem({
  value,
  name,
  group,
  isLast,
  onPress,
  onLongPress,
  isReminderEnabled,
}: {
  isLast: boolean
  currentGhari?: CurrentGhari
  nextNamazKey?: string
  value: string
  name: string
  times: ITimes
  group: string
  onPress: (value: boolean) => void
  onLongPress?: () => void
  isReminderEnabled: boolean
}) {
  // @ts-ignore
  const label = timesToShow[group as keyof typeof timesToShow][name]

  return (
    <Pressable onLongPress={onLongPress} style={[$itemContainer, isLast && $lastItem]}>
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
        <View style={[$reminderButton, !alarmKeys.includes(name) && $disabledReminderButton]}>
          {isReminderEnabled ? (
            <IconBell size={22} style={$reminderIcon} color={colors.palette.neutral800} />
          ) : (
            <IconBellOff
              disabled={!alarmKeys.includes(name)}
              size={22}
              style={$reminderIcon}
              color={
                !alarmKeys.includes(name) ? colors.palette.neutral400 : colors.palette.neutral800
              }
            />
          )}
          <Switch
            value={isReminderEnabled}
            onValueChange={(value) => onPress(value)}
            disabled={!alarmKeys.includes(name)}
          />
        </View>
      </View>
    </Pressable>
  )
}

const $reminderIcon: ImageStyle = {
  marginRight: spacing.sm,
}

const $reminderButton: ViewStyle = {
  marginLeft: spacing.sm,
  backgroundColor: colors.palette.neutral100,
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
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
  fontFamily: typography.primary.bold,
}

interface NamazScreenProps extends AppStackScreenProps<"Namaz"> {}

export const NamazScreen: FC<NamazScreenProps> = observer(function NamazScreen({ navigation }) {
  const [date, _setDate] = useState<Moment>(momentTime())
  const { dataStore } = useStores()
  const { openLocationBottomSheet } = useLocationBottomSheet()
  const { createReminder, deleteReminder, reminders } = useReminders()
  const [prayerTime, setPrayerTime] = useState<keyof ITimes | null>(null)

  const handleQuickReminder = async (prayerTime: keyof ITimes, value: boolean) => {
    // Check if any reminder exists for this prayer time (enabled or disabled)
    const existingReminders = reminders.filter((reminder) => reminder.prayerTime === prayerTime)

    if (value) {
      if (existingReminders.length > 0) {
        // Store IDs before deletion to avoid MobX errors
        const reminderIds = existingReminders.map((r) => r.id)

        // Delete existing reminders
        for (const id of reminderIds) {
          await deleteReminder(id)
        }
      }
      // Create new reminder using settings
      try {
        // Get custom offset for this prayer time, or use default
        const customOffset = dataStore.reminderSettings.customOffsets.get(prayerTime)
        const offsetMinutes =
          customOffset !== undefined
            ? customOffset
            : -dataStore.reminderSettings.triggerBeforeMinutes

        const reminderData = {
          name: `${prayerTime} Reminder`,
          prayerTime: prayerTime as any,
          offsetMinutes,
          repeatType: "daily" as const,
          notificationType: dataStore.reminderSettings.notificationType as "short" | "long",
        }

        await createReminder(reminderData)
      } catch (error) {
        console.error("Error creating reminder:", error)
      }
    } else {
      for (const reminder of existingReminders) {
        await deleteReminder(reminder.id)
      }
    }
  }

  const handleLongPressReminder = (prayerTime: keyof ITimes) => {
    setPrayerTime(prayerTime)
    $bottomSheetRefGoal.current?.expand()
  }

  const handleOffsetSelect = (offset: number) => {
    dataStore.setCustomOffset(prayerTime as string, offset)
    $bottomSheetRefGoal.current?.close()
  }

  // Get prayer times for the selected date
  const { times } = usePrayerTimesWithDate(
    dataStore.currentLocation.latitude,
    dataStore.currentLocation.longitude,
    date,
  )

  // Get next namaz information with automatic updates
  const { nextNamazKey, currentGhari } = useNextNamaz(times, 1000 * 60 * 60)

  const groups = ["morning", "noon", "evening"]

  const $bottomSheetRefGoal = useRef<React.ElementRef<typeof BottomSheetDrawer>>(null)

  return (
    <Screen preset="fixed" safeAreaEdges={["top"]} contentContainerStyle={$screenContainer}>
      <SectionList
        ListHeaderComponent={
          <Header
            rightActions={[
              <Pressable
                style={$settingsButton}
                key="settings"
                onPress={() => navigation.navigate("ReminderSettings")}
              >
                <IconBellCog size={24} color={colors.palette.neutral800} />
              </Pressable>,
            ]}
            title="Namaz Timings"
            showBackButton
          />
        }
        contentContainerStyle={$sectionListContentContainer}
        stickySectionHeadersEnabled={true}
        scrollEnabled={true}
        bounces={false}
        renderItem={({ item }) => item}
        sections={[
          {
            name: "location",
            data: [
              <Pressable
                onPress={openLocationBottomSheet}
                style={$locationContainerButton}
                key="locationContainer"
              >
                <View style={$locationContainer}>
                  <View style={$locationIconContainer}>
                    <IconCurrentLocationFilled
                      style={$locationIcon}
                      color={colors.palette.neutral800}
                      size={24}
                    />
                    {dataStore.currentLocationLoaded ? (
                      <Text size="md" key="location" color={colors.palette.neutral800}>
                        {dataStore.currentLocation.city}
                      </Text>
                    ) : (
                      <Skeleton width={100} height={16} borderRadius={4} />
                    )}
                  </View>

                  <View style={$editButton}>
                    <IconChevronRight color={colors.palette.neutral800} size={24} />
                  </View>
                </View>
              </Pressable>,
            ],
          },
          // {
          //   name: "testReminders",
          //   data: [
          //     <View key="testReminderButton" style={$testReminderContainer}>
          //       <TestReminderButton />
          //     </View>,
          //   ],
          // },
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
                          onLongPress={() => handleLongPressReminder(key.item as keyof ITimes)}
                          onPress={(value) => handleQuickReminder(key.item as keyof ITimes, value)}
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

      <BottomSheetDrawer ref={$bottomSheetRefGoal} snapPoints={["40%", "70%"]}>
        <ReminderOffsetSelector setOffset={(offset) => handleOffsetSelect(offset)} />
      </BottomSheetDrawer>
    </Screen>
  )
})

const $locationIcon: ImageStyle = {
  marginRight: spacing.sm,
  marginLeft: spacing.xs,
}

const $editButton: ViewStyle = {
  width: 40,
  height: 40,
  backgroundColor: colors.white,
  alignItems: "center",
  justifyContent: "center",
}

const $locationIconContainer: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  backgroundColor: colors.white,
}

const $locationContainerButton: ViewStyle = {
  marginHorizontal: spacing.md,
}

const $locationContainer: ViewStyle = {
  flex: 1,
  flexDirection: "row",
  justifyContent: "space-between", // this is not working
  width: "100%",
  backgroundColor: colors.white,
  paddingHorizontal: spacing.sm,
  paddingVertical: spacing.xs,
  shadowColor: colors.gray,
  shadowOffset: { width: 0, height: 5 },
  shadowOpacity: 1,
  shadowRadius: 10,
  borderRadius: 10,
  elevation: 5,
  borderColor: colors.gray,
  borderWidth: 1,
}

const $disabledReminderButton: ViewStyle = {
  opacity: 0.5,
}

const $settingsButton: ViewStyle = {
  borderRadius: 10,
  backgroundColor: colors.palette.neutral100,
  padding: spacing.sm,
  borderWidth: 1,
  borderColor: colors.palette.neutral100,
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
