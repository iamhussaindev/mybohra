import HijriDate from "app/libs/HijriDate"
import moment from "moment"


export const getFormattedTime = (time: string) => {
  return moment(time, "HH:mm").format("hh:mm A")
}

export const timeInMilliseconds = (_day?: number, _month?: number) => {
  const hijriDate = new HijriDate()

  const date = _day || hijriDate.day
  const month = _month || hijriDate.month

  const year = month < hijriDate.month ? hijriDate.year + 1 : hijriDate.year
  const dateInstance = new HijriDate(year, month, date).toGregorian()
  return dateInstance.getTime()
}
