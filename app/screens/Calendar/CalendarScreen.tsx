import { Screen } from "app/components"
import { Calendar, CalendarDay } from "app/libs/Calendar"
import { useStores } from "app/models"
import { AppStackScreenProps } from "app/navigators"
import { DailyDuaWithLibrary, SupabaseFetcherService } from "app/services/supabase"
import { observer } from "mobx-react-lite"
import React, { FC, useCallback, useEffect, useMemo, useState } from "react"
import { ViewStyle } from "react-native"

import CalendarHeader from "./component/CalendarHeader"
import CalendarView from "./component/CalendarView"

interface CalendarScreenProps extends AppStackScreenProps<"Calendar"> {}

export const CalendarScreen: FC<CalendarScreenProps> = observer(function CalendarScreen(props) {
  const { navigation, route } = props
  const [calendar, setCalendar] = useState<Calendar>()
  const [selectedDate, setSelectedDate] = useState<CalendarDay>()
  const [highlightedDate, setHighlightedDate] = useState<{ key: string; trigger: number } | null>(
    null,
  )
  const [dailyDuas, setDailyDuas] = useState<DailyDuaWithLibrary[]>([])
  const [dailyDuasLoading, setDailyDuasLoading] = useState(false)
  const [dailyDuasError, setDailyDuasError] = useState<string | null>(null)

  const { miqaatStore } = useStores()
  const supabaseFetcher = useMemo(() => new SupabaseFetcherService(), [])

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

  useEffect(() => {
    if (!selectedDate) {
      setDailyDuas([])
      setDailyDuasError(null)
      return
    }

    let isMounted = true
    const fetchDailyDuas = async () => {
      try {
        setDailyDuasLoading(true)
        setDailyDuasError(null)

        const response = await supabaseFetcher.fetchDailyDuas({
          date: selectedDate.date.day,
          month: selectedDate.date.month,
        })

        if (!isMounted) return

        if (response.success && response.data) {
          setDailyDuas(response.data)
        } else {
          setDailyDuas([])
          setDailyDuasError(response.error ?? "Unable to load daily duas for this date.")
        }
      } catch (error) {
        if (!isMounted) return
        setDailyDuas([])
        setDailyDuasError(error instanceof Error ? error.message : "Unable to load daily duas.")
      } finally {
        setDailyDuasLoading(false)
      }
    }

    fetchDailyDuas()

    return () => {
      isMounted = false
    }
  }, [selectedDate, supabaseFetcher])

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

  const handleDailyDuaPress = useCallback(
    (dua: DailyDuaWithLibrary) => {
      if (!dua?.library) return
      navigation.navigate("PdfViewer", {
        id: dua.library.id,
        name: dua.library.name,
        description: dua.library.description,
        audio_url: dua.library.audio_url,
        pdf_url: dua.library.pdf_url,
        youtube_url: dua.library.youtube_url,
        metadata: dua.library.metadata,
        tags: dua.library.tags,
        categories: dua.library.categories,
      })
    },
    [navigation],
  )

  const handleDailyDuaRemove = useCallback(
    async (dua: DailyDuaWithLibrary) => {
      const { Alert } = await import("react-native")
      Alert.alert(
        "Remove PDF",
        `Are you sure you want to remove "${dua.library?.name}" from this date?`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Remove",
            style: "destructive",
            onPress: async () => {
              try {
                const { supabase } = await import("app/services/supabase")
                const { error } = await supabase.from("daily_duas").delete().eq("id", dua.id)

                if (error) {
                  Alert.alert("Error", "Failed to remove PDF from date")
                  return
                }

                // Refresh the daily duas list
                if (selectedDate) {
                  const response = await supabaseFetcher.fetchDailyDuas({
                    date: selectedDate.date.day,
                    month: selectedDate.date.month,
                  })
                  if (response.success && response.data) {
                    setDailyDuas(response.data)
                  }
                }
              } catch (error) {
                Alert.alert("Error", "Failed to remove PDF from date")
              }
            },
          },
        ],
      )
    },
    [selectedDate, supabaseFetcher],
  )

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
          dailyDuas={dailyDuas}
          dailyDuasLoading={dailyDuasLoading}
          dailyDuasError={dailyDuasError}
          onDailyDuaPress={handleDailyDuaPress}
          onDailyDuaRemove={handleDailyDuaRemove}
        />
      ) : null}
    </Screen>
  )
})

const $screenContainer: ViewStyle = {
  flex: 1,
}
