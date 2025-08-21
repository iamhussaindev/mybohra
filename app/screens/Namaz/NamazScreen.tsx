import React, { FC, useCallback, useEffect, useState } from "react"
import { Icon, IconTypes, ListView, Screen, Text } from "app/components"
import { ImageStyle, NativeModules, SectionList, TextStyle, View, ViewStyle } from "react-native"
import { useStores } from "app/models"
import { colors, spacing } from "app/theme"
import { momentTime } from "app/utils/currentTime"
import { CurrentGhari, ITimes, getCurrentGhari, getNextNamazKey } from "app/helpers/namaz.helper"
import { getFormattedTime } from "app/utils/common"
import { Moment } from "moment"
import NamazScreenHeader from "./components/Header"
import { observer } from "mobx-react-lite"
import { AppStackScreenProps } from "app/navigators"

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
}: {
  isLast: boolean
  currentGhari?: CurrentGhari
  nextNamazKey?: string
  value: string
  name: string
  times: ITimes
  group: string
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
      <Text weight="bold" style={$itemText}>
        {getFormattedTime(value)}
      </Text>
    </View>
  )
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
  const [times, setTimes] = useState<any>({})
  const [nextNamazKey, setNextNamazKey] = useState<string>("")
  const [currentGhari, setCurrentGhari] = useState<CurrentGhari>()
  const [date, setDate] = useState<Moment>(momentTime())

  const { dataStore } = useStores()

  const getNextNamaz = useCallback(() => {
    const nextNamazKey = getNextNamazKey(times)
    setNextNamazKey(nextNamazKey)
    const currentGhari = getCurrentGhari(times, nextNamazKey)
    setCurrentGhari(currentGhari)
  }, [times, date])

  useEffect(() => {
    getPrayerTimes(
      dataStore.currentLocation.latitude,
      dataStore.currentLocation.longitude,
      date.toISOString(),
    )
  }, [date])

  useEffect(() => {
    getNextNamaz()
  }, [date])

  useEffect(() => {
    const timer = setInterval(() => {
      getNextNamaz()
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  async function getPrayerTimes(lat: number, lon: number, date: string) {
    NativeModules.SalaatTimes.getPrayerTimes(lat, lon, date, (times: any) => {
      setTimes(times)
    })
  }

  const groups = ["morning", "noon", "evening"]

  return (
    <Screen preset="fixed" safeAreaEdges={["top"]} contentContainerStyle={$screenContainer}>
      <NamazScreenHeader
        location={dataStore?.currentLocation?.city}
        date={date}
        setDate={setDate}
        title="Namaz Timings"
      />
      <SectionList
        contentContainerStyle={$sectionListContentContainer}
        stickySectionHeadersEnabled={false}
        scrollEnabled={false}
        renderItem={({ item }) => item}
        sections={[
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
                          isLast={
                            key.index ===
                            Object.keys(timesToShow[group as keyof typeof timesToShow]).length - 1
                          }
                          group={group}
                          currentGhari={currentGhari}
                          nextNamazKey={nextNamazKey}
                          name={key.item}
                          value={times[key.item]}
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
  margin: spacing.lg,
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
