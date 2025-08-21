import { Button, Icon, ListView, Text } from "app/components"
import { Calendar, CalendarDay, WEEKDAYS } from "app/libs/Calendar"
import { colors, spacing } from "app/theme"
import { Dimensions, ImageStyle, SectionList, TextStyle, View, ViewStyle } from "react-native"
import React from "react"
import { useStores } from "app/models"
import { MiqaatCard } from "app/screens/components/MiqaatList"
import { WeekView } from "./WeekView"

const screenWidth = Dimensions.get("window").width

export default function CalendarView({
  calendar,
  setCalendar,
  selectedDate,
  setSelectedDate,
}: {
  calendar: Calendar
  setCalendar: any
  selectedDate?: CalendarDay
  setSelectedDate: any
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

  return (
    <SectionList
      stickySectionHeadersEnabled={true}
      keyExtractor={(_, index) => `${index}`}
      renderItem={({ item }) => item}
      stickyHeaderIndices={[0, 1, 2]}
      sections={[
        {
          name: "HeaderControl",
          description: "HeaderControl",
          data: [
            <View key={1} style={$headerControl}>
              <Button onPress={handlePrevious} style={$headerControlButton}>
                <Icon
                  style={$iconStyle}
                  size={24}
                  color={colors.palette.primary500}
                  icon="arrowLeft"
                />
              </Button>
              <View style={$headerCenter}>
                <Text weight="bold" style={$headerText}>
                  {calendar?.monthName} {calendar?.year}
                </Text>
                <Text>{calendar?.gregMonth}</Text>
              </View>
              <Button onPress={handleNext} style={$headerControlButton}>
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
                    <Text weight="bold" style={$weekHeaderText}>
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
              />
            )),
        },
        {
          name: "Miqaats",
          description: "Miqaats",
          data: [
            miqaats?.length > 0 ? (
              <View style={$miqaatsListContainer}>
                <ListView
                  ListHeaderComponent={
                    miqaats?.length > 0 ? (
                      <View style={$miqaatHeader}>
                        <Text weight="bold" style={$miqaatHeaderText}>
                          Events on {selectedDate?.date?.day} {selectedDate?.date?.getMonthName()}{" "}
                          {selectedDate?.date?.year}
                        </Text>
                        <Text style={$miqaatHeaderDescription}>
                          {selectedDate?.gregorian?.format("dddd, Do MMMM YYYY")}
                        </Text>
                      </View>
                    ) : null
                  }
                  scrollEnabled={false}
                  estimatedItemSize={100}
                  contentContainerStyle={$miqaatsList}
                  data={miqaats}
                  renderItem={(item) => <MiqaatCard item={item.item} />}
                />
              </View>
            ) : (
              <View style={$emptyContainer}>
                <Text size="xs">No events on this day</Text>
              </View>
            ),
          ],
        },
      ]}
    />
  )
}

const $miqaatsListContainer: ViewStyle = {
  flex: 1,
  minHeight: 200,
}

const $emptyContainer: ViewStyle = {
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
}

const $miqaatHeaderText: TextStyle = {
  borderLeftColor: colors.palette.primary500,
  borderLeftWidth: 4,
  color: colors.palette.neutral900,
  fontSize: 18,
}

const $miqaatHeaderDescription: TextStyle = {
  borderLeftColor: colors.palette.primary500,
  borderLeftWidth: 4,
  color: colors.palette.neutral900,
  fontSize: 13,
}

const $miqaatsList: ViewStyle = {
  paddingTop: spacing.lg,
  paddingHorizontal: spacing.lg,
}

const $weekHeader: ViewStyle = {
  height: 40,
  width: screenWidth / 7,
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
  backgroundColor: colors.palette.neutral100,
  borderBottomColor: colors.palette.neutral200,
  borderBottomWidth: 1,
}

const $headerControlButton: ViewStyle = {
  maxHeight: 30,
  height: 30,
  minHeight: 30,
  borderColor: colors.transparent,
  borderRadius: 20,
}

const $headerText: TextStyle = {
  fontSize: 18,
  fontWeight: "800",
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

// +1 647 897 0946
