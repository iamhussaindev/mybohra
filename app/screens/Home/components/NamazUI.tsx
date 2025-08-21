import { currentTime } from "app/utils/currentTime"
import React, { useCallback, useEffect, useState } from "react"
import { NativeModules } from "react-native"
import NextNamaz from "./NextNamaz"
import NamazTimesList from "./NamazTimes"
import {
  CurrentGhari,
  NamazTimes,
  getCurrentGhari,
  getNextNamazKey,
} from "app/helpers/namaz.helper"
import { useStores } from "app/models"

export default function NamazUI() {
  const date = currentTime().toISOString()
  const [times, setTimes] = useState<any>({})
  const [nextNamazKey, setNextNamazKey] = useState<string>("")
  const [currentGhari, setCurrentGhari] = useState<CurrentGhari>()

  const { dataStore } = useStores()

  useEffect(() => {
    getPrayerTimes(dataStore.currentLocation.latitude, dataStore.currentLocation.longitude, date)
  }, [])

  const getNextNamaz = useCallback(() => {
    const nextNamazKey = getNextNamazKey(times)
    setNextNamazKey(nextNamazKey)
    const currentGhari = getCurrentGhari(times, nextNamazKey)
    setCurrentGhari(currentGhari)
  }, [times])

  useEffect(() => {
    getNextNamaz()

    const timer = setInterval(() => {
      getNextNamaz()
    }, 1000)

    return () => clearInterval(timer)
  }, [times])

  const getPrayerTimes = async (lat: number, lon: number, date: string) => {
    NativeModules.SalaatTimes.getPrayerTimes(lat, lon, date, (times: any) => {
      setTimes(times)
    })
  }

  const timesLoaded = Object.keys(times).length > 0

  return (
    <>
      <NextNamaz key="namaz-times" nextTimeKey={nextNamazKey as keyof NamazTimes} times={times} />
      {timesLoaded ? (
        <NamazTimesList currentGhari={currentGhari} nextTimeKey={nextNamazKey} times={times} />
      ) : null}
    </>
  )
}
