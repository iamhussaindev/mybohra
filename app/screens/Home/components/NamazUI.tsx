import { NamazTimes } from "app/helpers/namaz.helper"
import { useLocationPrayerTimes } from "app/hooks/useLocationPrayerTimes"
import { useNextNamaz } from "app/hooks/useNextNamaz"
import { observer } from "mobx-react-lite"
import React from "react"

import NamazTimesList from "./NamazTimes"
import NextNamaz from "./NextNamaz"

export default observer(function NamazUI() {
  // Use the comprehensive location + prayer times hook
  const { times, timesLoaded } = useLocationPrayerTimes()

  // Use the next namaz hook for automatic updates
  const { nextNamazKey, currentGhari } = useNextNamaz(times)

  return (
    <>
      <NextNamaz key="namaz-times" nextTimeKey={nextNamazKey as keyof NamazTimes} times={times} />
      {timesLoaded ? (
        <NamazTimesList currentGhari={currentGhari} nextTimeKey={nextNamazKey} times={times} />
      ) : null}
    </>
  )
})
