import { Screen } from "app/components"
import { Calendar, CalendarDay } from "app/libs/Calendar"
import { useStores } from "app/models"
import { AppStackScreenProps } from "app/navigators"
import { observer } from "mobx-react-lite"
import React, { FC, useEffect, useMemo, useState } from "react"
import { ViewStyle } from "react-native"

import CalendarHeader from "./component/CalendarHeader"
import CalendarView from "./component/CalendarView"

interface CalendarScreenProps extends AppStackScreenProps<"Calendar"> {}

export const CalendarScreen: FC<CalendarScreenProps> = observer(function CalendarScreen(props) {
  const { navigation, route } = props
  const [calendar, setCalendar] = useState<Calendar>()
  const [selectedDate, setSelectedDate] = useState<CalendarDay>()
  const [highlightedDate, setHighlightedDate] = useState<{ key: string; trigger: number } | null>(null)

  const { miqaatStore } = useStores()

  useEffect(() => {
    if (miqaatStore.list.length === 0) {
      miqaatStore.fetchMiqaats()
    }
  }, [miqaatStore])

  useEffect(() => {
    if (miqaatStore.miqaats.length === 0) return
    const nextCalendar = new Calendar({ miqaats: miqaatStore.miqaats })
    setCalendar(nextCalendar)
    setSelectedDate(nextCalendar.getToday)
  }, [miqaatStore.miqaats])

  const createHighlightKey = useMemo(
    () => (date: CalendarDay["date"]) => `${date.year}-${date.month}-${date.day}`,
    [],
  )

  useEffect(() => {
    if (!calendar) return
    const highlight = route.params?.highlight
    if (!highlight) return

    const { year, month, day } = highlight
    const nextCalendar = new Calendar({
      year,
      month,
      miqaats: miqaatStore.miqaats,
    })

    setCalendar(nextCalendar)

    const targetDay = nextCalendar
      .getDays()
      .find((d) => d.date.year === year && d.date.month === month && d.date.day === day)

    if (targetDay) {
      setSelectedDate(targetDay)
      setHighlightedDate({ key: createHighlightKey(targetDay.date), trigger: Date.now() })
    }

    navigation.setParams({ highlight: undefined })
  }, [calendar, route.params?.highlight, miqaatStore.miqaats, navigation, createHighlightKey])

  return (
    <Screen preset="fixed" safeAreaEdges={["top"]} contentContainerStyle={$screenContainer}>
      {calendar ? (
        <CalendarHeader
          setSelectedDate={setSelectedDate}
          calendar={calendar}
          setCalendar={setCalendar}
        />
      ) : null}
      {calendar ? (
        <CalendarView
          setSelectedDate={setSelectedDate}
          selectedDate={selectedDate}
          calendar={calendar}
          setCalendar={setCalendar}
          highlight={highlightedDate}
        />
      ) : null}
    </Screen>
  )
})

const $screenContainer: ViewStyle = {
  flex: 1,
}
