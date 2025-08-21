import { Screen } from "app/components"
import { AppStackScreenProps } from "app/navigators"
import { observer } from "mobx-react-lite"
import React, { FC, useEffect, useState } from "react"
import { ViewStyle } from "react-native"
import CalendarHeader from "./component/CalendarHeader"
import { Calendar, CalendarDay } from "app/libs/Calendar"
import CalendarView from "./component/CalendarView"
import { useStores } from "app/models"

interface CalendarScreenProps extends AppStackScreenProps<"Calendar"> {}

export const CalendarScreen: FC<CalendarScreenProps> = observer(function CalendarScreen() {
  const [calendar, setCalendar] = useState<Calendar>()
  const [selectedDate, setSelectedDate] = useState<CalendarDay>()

  const { miqaatStore } = useStores()

  useEffect(() => {
    const calendar = new Calendar({ miqaats: miqaatStore.miqaats })
    setCalendar(calendar)
    setSelectedDate(calendar.getToday)
  }, [])

  return (
    <Screen preset="fixed" safeAreaEdges={["top"]} contentContainerStyle={$screenContainer}>
      {calendar ? <CalendarHeader calendar={calendar} setCalendar={setCalendar} /> : null}
      {calendar ? (
        <CalendarView
          setSelectedDate={setSelectedDate}
          selectedDate={selectedDate}
          calendar={calendar}
          setCalendar={setCalendar}
        />
      ) : null}
    </Screen>
  )
})

const $screenContainer: ViewStyle = {
  flex: 1,
}
