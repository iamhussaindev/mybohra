import { currentTime, momentTime } from "app/utils/currentTime"
import moment from "moment"

export interface ITimes {
  [key: string]: string
}

export type CurrentGhari = {
  key: string
  name: string
  isNext?: boolean
  time?: string
  endTime?: string
  description?: string
  group?: string
  nextInList?: string
}

export type NamazTimes = {
  fajr: string
  zawaal: string
  zohar: string
  asar: string
  sihori: string
  maghrib_safe: string
  nisful_layl: string
}

export const namazLabels = {
  fajr: "Fajr",
  zawaal: "Zawal",
  zohar: "Zohar",
  asar: "Asar",
  sihori: "Sihori time",
  maghrib_safe: "Maghrib",
  nisful_layl: "Nisful-Layl",
}

export const namazEndDescription: Record<keyof NamazTimes, string> = {
  fajr: "starts in",
  zawaal: "starts in",
  zohar: "starts",
  asar: "starts",
  sihori: "ends in",
  maghrib_safe: "starts in",
  nisful_layl: "starts in",
}

export const getNextNamazKey = (times: ITimes): string => {
  const homeTimeKeys = ["sihori", "fajr", "zawaal", "maghrib_safe", "nisful_layl"]

  if (times && Object.keys(times).length > 0) {
    const nextNamazTime = homeTimeKeys.find((key: string) => {
      const time = times[key]
      const [hours, minutes] = time.split(":").map((t: string) => parseInt(t))
      const date = currentTime()
      date.setHours(hours)
      date.setMinutes(minutes)

      if (date.getHours() === 0) {
        date.setDate(date.getDate() + 2)
      }

      return date > currentTime()
    })

    if (nextNamazTime) {
      return nextNamazTime
    }
  }

  return ""
}

export const getTime = (times: ITimes, timeKey: string) => {
  const time = times[timeKey]

  if (!time) {
    return { date: momentTime(), time: "" }
  }

  const date = momentTime()
  const [hours, minutes] = time.split(":").map((t: string) => parseInt(t))

  date.set("hours", hours)
  date.set("minutes", minutes)

  if (date.hour() === 0) {
    date.add(1, "day")
  }

  return { date, time }
}

export const getNamazTimeDifference = (nextNamazTime: string) => {
  const currentTime = momentTime()

  const time = moment(nextNamazTime, "HH:mm")

  if (moment(nextNamazTime, "HH:mm").get("hour") === 0) {
    time.add(1, "day")
  }

  const hours = time.diff(currentTime, "hours")
  const minutes = time.diff(currentTime, "minutes") - hours * 60

  const timeDiffString = `${
    hours > 0 ? `${hours} hour${hours > 1 ? `s` : ``} ` : ``
  }${minutes} minute${minutes > 1 ? `s` : ``}`

  return { name: timeDiffString, hours, minutes }
}

export const getTimeDescription = (
  key: string,
  time: string,
  currentGhari?: CurrentGhari,
  nextNamazKey?: string,
  allTimes?: ITimes,
) => {
  if (!allTimes || !nextNamazKey) {
    return ""
  }

  const { date: momentDate } = getTime({ [key]: time }, key)

  if (currentGhari?.key === key && currentGhari.isNext) {
    return `Ends ${momentDate.fromNow()}`
  }

  if (currentGhari?.key === key) {
    return `Current Ghari ends in ${currentGhari.endTime}`
  }

  if (nextNamazKey === key) {
    const { date } = getTime(allTimes, nextNamazKey)
    return `Starts in ${date.fromNow()}`
  }

  return ""
}

export const getCurrentGhari = (times: ITimes, nextNamazTime: string): CurrentGhari => {
  if (nextNamazTime === "nisful_layl") {
    const { date } = getTime(times, "maghrib_safe")
    const { date: maghribEnd } = getTime(times, "maghrib_end")
    const { date: nisf } = getTime(times, "nisful_layl")

    if (momentTime().isBetween(date, maghribEnd)) {
      const description = ""
      return { key: "maghrib_safe", name: "Maghrib", description, group: "evening" }
    }

    return {
      description: `Isha ends in ${nisf.fromNow()}`,
      key: "maghrib_safe",
      name: "Maghrib/Isha",
      endTime: nisf?.fromNow(),
      group: "evening",
      nextInList: "nisful_layl",
    }
  }

  if (nextNamazTime === "sihori") {
    const { date: nisf } = getTime(times, "nisful_layl")
    const { date: nisfEnd } = getTime(times, "nisful_layl_end")
    const { name } = getNamazTimeDifference(times.sihori)

    if (momentTime().diff(nisf, "minutes") > 0 && momentTime().diff(nisfEnd, "minutes") < 0) {
      return { key: "nisful_layl", name: "Nisful-Layl", group: "evening" }
    } else {
      return {
        key: "sihori",
        name: "Sihori Ends",
        group: "morning",
        description: `Sihori ends in ${name}`,
      }
    }
  }

  if (nextNamazTime === "fajr") {
    return { key: "sihori", name: "Sihori Ends", group: "morning" }
  }

  if (nextNamazTime === "zawaal") {
    const { date: fajr } = getTime(times, "fajr")
    const { date: sunrise } = getTime(times, "sunrise_safe")

    if (momentTime().isBetween(fajr, sunrise)) {
      return { key: "fajr", name: "Fajr", group: "morning" }
    }

    return { key: "zawaal", name: "Zawal", isNext: true, group: "noon" }
  }

  if (nextNamazTime === "maghrib_safe") {
    const { date: zawwal } = getTime(times, "zawaal")
    const { date: zoharEnd } = getTime(times, "zohr_end")

    const { date: asarEnd, time: asarEndmtime } = getTime(times, "asr_end")

    if (momentTime().isBetween(zawwal, zoharEnd)) {
      return { key: "zawaal", name: "Zohr/Asr", group: "noon", nextInList: "zohr_end" }
    }

    if (momentTime().isBetween(zoharEnd, asarEnd)) {
      return {
        key: "zawaal",
        name: "Asar until",
        time: asarEndmtime,
        group: "noon",
        nextInList: "asr_end",
      }
    }

    return {
      key: "maghrib_safe",
      name: "Maghrib",
      isNext: true,
      group: "evening",
      nextInList: "maghrib_safe",
    }
  }

  return { key: nextNamazTime, name: nextNamazTime }
}
