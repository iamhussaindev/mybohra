import { Button, Icon, ListView, Text, Skeleton } from "app/components"
import { shadowProps } from "app/helpers/shadow.helper"
import { Calendar, CalendarDay, WEEKDAYS } from "app/libs/Calendar"
import { useStores } from "app/models"
import { MiqaatCard } from "app/screens/components/MiqaatList"
import { DailyDuaWithLibrary } from "app/services/supabase"
import { colors, spacing, typography } from "app/theme"
import React from "react"
import {
  Dimensions,
  ImageStyle,
  Image,
  Pressable,
  SectionList,
  TextStyle,
  View,
  ViewStyle,
  Text as RNText,
  FlatList,
} from "react-native"

import { WeekView } from "./WeekView"

const screenWidth = Dimensions.get("window").width
const DAILY_DUA_CARD_HEIGHT = 32
const pdfIconSource = require("../../../../assets/images/pdf.png")

export default function CalendarView({
  calendar,
  setCalendar,
  selectedDate,
  setSelectedDate,
  highlight,
  dailyDuas,
  dailyDuasLoading,
  dailyDuasError,
  onDailyDuaPress,
}: {
  calendar: Calendar
  setCalendar: any
  selectedDate?: CalendarDay
  setSelectedDate: any
  highlight?: { key: string; trigger: number } | null
  dailyDuas?: DailyDuaWithLibrary[]
  dailyDuasLoading?: boolean
  dailyDuasError?: string | null
  onDailyDuaPress?: (dua: DailyDuaWithLibrary) => void
}) {
  function handlePrevious() {
    setCalendar(calendar?.previousMonth())
    setSelectedDate(null)
  }

  function handleNext() {
    setCalendar(calendar?.nextMonth())
    setSelectedDate(null)
  }

  const { miqaatStore } = useStores()
  const miqaats = miqaatStore?.miqaatsOnDay(selectedDate?.date)

  const selectedDateString = `${selectedDate?.gregorian?.format("dddd,")} ${
    selectedDate?.date?.day
  } ${selectedDate?.date?.getMonthName()} ${selectedDate?.date?.year}`

  return (
    <SectionList
      stickySectionHeadersEnabled={true}
      keyExtractor={(_, index) => `${index}`}
      renderItem={({ item }) => item}
      stickyHeaderIndices={[0, 1, 2]}
      contentContainerStyle={$contentContainer}
      sections={[
        {
          name: "HeaderControl",
          description: "HeaderControl",
          data: [
            <View key={1} style={$headerControl}>
              <Button preset="tinted" onPress={handlePrevious} style={$headerControlButton}>
                <Icon
                  style={$iconStyle}
                  size={24}
                  color={colors.palette.primary500}
                  icon="arrowLeft"
                />
              </Button>
              <View style={$headerCenter}>
                <RNText style={$headerText}>
                  {calendar?.monthName} {calendar?.year}
                </RNText>
                <Text>{calendar?.gregMonth}</Text>
              </View>
              <Button preset="tinted" onPress={handleNext} style={$headerControlButton}>
                <Icon
                  style={$iconStyle}
                  size={24}
                  color={colors.palette.primary500}
                  icon="arrowRight"
                />
              </Button>
            </View>,
            <View key={2} style={$weekContainer}>
              {Array.from({ length: 7 }).map((_, index) => {
                return (
                  <View style={$weekHeader} key={index}>
                    <Text weight="medium" style={$weekHeaderText}>
                      {WEEKDAYS[index]}
                    </Text>
                  </View>
                )
              })}
            </View>,
          ],
        },
        {
          name: "Weeks",
          description: "Weeks",
          data: calendar
            .getWeeks()
            .map((week) => (
              <WeekView
                key={week[0].date.toString()}
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
                week={week}
                highlight={highlight}
              />
            )),
        },
        {
          name: "Miqaats",
          description: "Miqaats",
          data: [
            selectedDate && miqaats && miqaats.length > 0 ? (
              <View style={$miqaatsListContainer}>
                <ListView
                  ListHeaderComponent={
                    <View style={$miqaatHeader}>
                      <View style={$miqaatHeaderContainer}>
                        <Text weight="bold" style={$miqaatHeaderDescription}>
                          {selectedDateString}
                        </Text>
                      </View>
                    </View>
                  }
                  scrollEnabled={false}
                  estimatedItemSize={100}
                  contentContainerStyle={$miqaatsList}
                  data={miqaats}
                  renderItem={(item) => <MiqaatCard isCalendar={true} item={item.item} />}
                />
              </View>
            ) : selectedDate && dailyDuas && dailyDuas.length === 0 ? (
              <View style={$emptyContainer}>
                <Text style={$emptyContainerText}>No miqaats on this day</Text>
              </View>
            ) : null,
          ],
        },
        {
          name: "DailyDuas",
          description: "Daily Duas",
          data: [
            selectedDate && dailyDuas && dailyDuas.length > 0 ? (
              <DailyDuasSection
                key="daily-duas-section"
                dailyDuas={dailyDuas ?? []}
                isLoading={!!dailyDuasLoading}
                error={dailyDuasError}
                onPressItem={onDailyDuaPress}
              />
            ) : null,
          ],
        },
      ]}
    />
  )
}

function DailyDuasSection({
  dailyDuas,
  isLoading,
  error = null,
  onPressItem,
}: {
  dailyDuas: DailyDuaWithLibrary[]
  isLoading: boolean
  error?: string | null
  onPressItem?: (dua: DailyDuaWithLibrary) => void
}) {
  return (
    <View style={$dailyDuaContainer}>
      <Text weight="bold" style={$dailyDuaHeader}>
        Daily Duas & Hafti
      </Text>

      {isLoading ? (
        <FlatList
          horizontal
          data={Array.from({ length: 2 })}
          keyExtractor={(_, index) => `daily-dua-skeleton-${index}`}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={$dailyDuaListContent}
          renderItem={({ index }) => (
            <View style={$dailyDuaSkeletonCard} key={`daily-dua-skeleton-${index}`}>
              <Skeleton width={18} height={18} borderRadius={4} />
              <Skeleton width={80} height={12} borderRadius={4} style={$dailyDuaSkeletonTitle} />
            </View>
          )}
        />
      ) : error ? (
        <View style={$dailyDuaStateContainer}>
          <Text style={$dailyDuaStateText}>{error}</Text>
        </View>
      ) : dailyDuas.length === 0 ? (
        <View style={$dailyDuaStateContainer}>
          <Text style={$dailyDuaStateText}>No daily duas found for this date.</Text>
        </View>
      ) : (
        <FlatList
          horizontal
          data={dailyDuas}
          keyExtractor={(item) => `daily-dua-${item.id}`}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={$dailyDuaListContent}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => onPressItem?.(item)}
              style={$dailyDuaCard}
              accessibilityRole="button"
            >
              <View style={$dailyDuaIconWrapper}>
                <Image source={pdfIconSource} style={$dailyDuaIcon} resizeMode="contain" />
              </View>
              <Text
                style={$dailyDuaCardTitle}
                numberOfLines={2}
                ellipsizeMode="tail"
                weight="medium"
              >
                {item.library?.name ?? "Daily Dua"}
              </Text>
            </Pressable>
          )}
        />
      )}
    </View>
  )
}

const $miqaatHeaderContainer: ViewStyle = {
  flex: 1,
  justifyContent: "center",
}

const $miqaatsListContainer: ViewStyle = {
  flex: 1,
}

const $emptyContainerText: TextStyle = {
  color: colors.palette.neutral700,
  textAlign: "center",
  paddingHorizontal: spacing.lg,
}

const $emptyContainer: ViewStyle = {
  backgroundColor: colors.white,
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  height: 200,
}

const $headerCenter: ViewStyle = {
  alignItems: "center",
}

const $miqaatHeader: ViewStyle = {
  paddingBottom: spacing.md,
  width: "100%",
  flex: 1,
  flexDirection: "row",
  justifyContent: "center",
  alignItems: "center",
}

const $miqaatHeaderDescription: TextStyle = {
  borderLeftColor: colors.palette.primary500,
  borderLeftWidth: 4,
  color: colors.palette.neutral800,
  fontSize: 18,
}

const $miqaatsList: ViewStyle = {
  paddingTop: spacing.md,
  paddingHorizontal: spacing.md,
}

const $weekHeader: ViewStyle = {
  height: 40,
  width: (screenWidth - spacing.xs * 2) / 7,
  justifyContent: "center",
  alignItems: "center",
}

const $iconStyle: ImageStyle = {
  height: 20,
  width: 20,
  position: "relative",
  top: -5,
}

const $weekHeaderText: TextStyle = {
  fontSize: 14,
  color: colors.palette.neutral900,
  letterSpacing: 1,
}

const $weekContainer: ViewStyle = {
  flexDirection: "row",
  backgroundColor: colors.white,
  paddingHorizontal: spacing.xs,
}

const $headerControlButton: ViewStyle = {
  maxHeight: 30,
  height: 30,
  minHeight: 30,
  borderColor: colors.transparent,
  borderRadius: 20,
}

const $headerText: TextStyle = {
  fontSize: 20,
  fontWeight: "bold",
  fontFamily: typography.fonts.dmSans.bold,
  letterSpacing: -0.5,
}

const $headerControl: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-between",
  width: "100%",
  paddingVertical: 15,
  paddingHorizontal: 15,
  alignItems: "center",
  backgroundColor: colors.palette.neutral100,
  borderBottomColor: colors.palette.neutral200,
  borderBottomWidth: 1,
  borderTopColor: colors.palette.neutral200,
  borderTopWidth: 1,
}

const $contentContainer: ViewStyle = {
  backgroundColor: colors.white,
  flexGrow: 1,
  paddingBottom: 50,
}

const $dailyDuaContainer: ViewStyle = {
  paddingHorizontal: spacing.lg,
  paddingBottom: spacing.xxl,
}

const $dailyDuaHeader: TextStyle = {
  fontSize: 16,
  fontWeight: "bold",
  fontFamily: typography.fonts.dmSans.bold,
  letterSpacing: -0.5,
}

const $dailyDuaStateContainer: ViewStyle = {
  paddingVertical: spacing.lg,
  alignItems: "center",
  justifyContent: "center",
}

const $dailyDuaStateText: TextStyle = {
  color: colors.palette.neutral700,
  textAlign: "center",
}

const $dailyDuaListContent: ViewStyle = {
  paddingVertical: spacing.xs,
  gap: spacing.sm,
}

const $dailyDuaCard: ViewStyle = {
  height: DAILY_DUA_CARD_HEIGHT,
  backgroundColor: colors.error,
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  paddingHorizontal: spacing.sm,
  ...shadowProps,
  borderRadius: 8,
}

const $dailyDuaIconWrapper: ViewStyle = {}

const $dailyDuaIcon: ImageStyle = {
  width: 18,
  height: 18,
}

const $dailyDuaCardTitle: TextStyle = {
  marginLeft: spacing.xxxs,
  fontSize: 13,
  lineHeight: 18,
  color: colors.palette.neutral900,
}

const $dailyDuaSkeletonCard: ViewStyle = {
  height: DAILY_DUA_CARD_HEIGHT,
  backgroundColor: colors.palette.neutral100,
  flexDirection: "row",
  alignItems: "center",
  paddingHorizontal: spacing.sm,
  borderRadius: 8,
  marginRight: spacing.sm,
  gap: spacing.xs,
}

const $dailyDuaSkeletonTitle: ViewStyle = {
  marginLeft: spacing.xxxs,
}
