import { IMiqaat } from "app/models/MiqaatStore"
import { currentTime, momentTime } from "app/utils/currentTime"

export default class HijriDate {
  day = 0
  month = 0
  year = 0

  constructor(year?: number, month?: number, day?: number) {
    if (day !== undefined && month !== undefined && year !== undefined) {
      this.day = day
      this.month = month
      this.year = year
    } else {
      const currentDate = currentTime()
      const ajd = this.gregorianToAJD(currentDate)
      const hijriDate = this.fromAJD(ajd)

      this.day = hijriDate.day
      this.month = hijriDate.month
      this.year = hijriDate.year
    }
  }

  private KABISA_YEAR_REMAINDERS = [2, 5, 8, 10, 13, 16, 19, 21, 24, 27, 29]
  private DAYS_IN_YEAR = [30, 59, 89, 118, 148, 177, 207, 236, 266, 295, 325]
  private DAYS_IN_30_YEARS = [
    354, 708, 1063, 1417, 1771, 2126, 2480, 2834, 3189, 3543, 3898, 4252, 4606, 4961, 5315, 5669,
    6024, 6378, 6732, 7087, 7441, 7796, 8150, 8504, 8859, 9213, 9567, 9922, 10276, 10631,
  ]

  private LONG_NAMES = [
    "Moharram al-Haraam",
    "Safar al-Muzaffar",
    "Rabi al-Awwal",
    "Rabi al-Aakhar",
    "Jumada al-Ula",
    "Jumada al-Ukhra",
    "Rajab al-Asab",
    "Shabaan al-Karim",
    "Ramadaan al-Moazzam",
    "Shawwal al-Mukarram",
    "Zilqadah al-Haraam",
    "Zilhaj al-Haraam",
  ]

  private SHORT_NAMES = [
    "Moharram",
    "Safar",
    "Rabi I",
    "Rabi II",
    "Jumada I",
    "Jumada II",
    "Rajab",
    "Shabaan",
    "Ramadaan",
    "Shawwal",
    "Zilqadah",
    "Zilhaj",
  ]

  ARABIC_NUMBERS = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"]
  ENGLISH_NUMBERS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"]

  public toArabic() {
    const number = this.day.toString()

    let convertedNumber = ""
    for (let i = 0; i < number.length; i++) {
      const englishDigit = number[i]
      const index = this.ENGLISH_NUMBERS.indexOf(englishDigit)
      if (index !== -1) {
        convertedNumber += this.ARABIC_NUMBERS[index]
      } else {
        convertedNumber += englishDigit
      }
    }

    return convertedNumber
  }

  static fromMiqaat(miqaat: IMiqaat): HijriDate {
    const year = new HijriDate().year
    return new HijriDate(year, miqaat.month, miqaat.date)
  }

  private isKabisa(year: number) {
    for (const i in this.KABISA_YEAR_REMAINDERS) {
      if (year % 30 === this.KABISA_YEAR_REMAINDERS[i]) {
        return true
      }
    }
    return false
  }

  static today(): HijriDate {
    const currentDate = new Date()
    const ajd = HijriDate.prototype.gregorianToAJD(currentDate)
    const hijriDate = HijriDate.prototype.fromAJD(ajd)
    return hijriDate
  }

  isToday() {
    const today = HijriDate.today()
    return this.day === today.day && this.month === today.month && this.year === today.year
  }

  formatted(): string {
    return `${this.day} ${this.getShortMonthName(this.month)} ${this.year}`
  }

  daysInMonth() {
    return (this.month === 11 && this.isKabisa(this.year)) || this.month % 2 === 0 ? 30 : 29
  }

  get monthName() {
    return this.SHORT_NAMES[this.month]
  }

  getMonthName(month?: number): string {
    return this.LONG_NAMES[month ?? this.month]
  }

  getShortMonthName(month?: number): string {
    return this.SHORT_NAMES[month ?? this.month]
  }

  fromGregorian(cal: Date): HijriDate {
    return this.fromAJD(this.gregorianToAJD(cal))
  }

  toGregorian(): Date {
    return this.ajdToGregorian(this.toAJD())
  }

  toMoment(): moment.Moment {
    return momentTime(this.toGregorian())
  }

  private isJulian(date: Date): boolean {
    if (date.getFullYear() < 1582) {
      return true
    }
    if (date.getFullYear() === 1582) {
      if (date.getMonth() < 9) {
        return true
      }
      if (date.getMonth() === 9) {
        if (date.getDate() < 5) {
          return true
        }
      }
    }
    return false
  }

  private gregorianToAJD(date: Date): number {
    let a
    let b
    let year = date.getFullYear()
    let month = date.getMonth() + 1

    const day =
      date.getDate() +
      date.getHours() / 24 +
      date.getMinutes() / 1440 +
      date.getSeconds() / 86400 +
      date.getMilliseconds() / 86400000

    if (month < 3) {
      year--
      month += 12
    }
    if (this.isJulian(date)) {
      b = 0
    } else {
      a = Math.floor(year / 100)
      b = 2 - a + Math.floor(a / 4)
    }
    return Math.floor(365.25 * (year + 4716)) + Math.floor(30.6001 * (month + 1)) + day + b - 1524.5
  }

  dayOfYear() {
    return this.month === 0 ? this.day : this.DAYS_IN_YEAR[this.month - 1] + this.day
  }

  private ajdToGregorian(ajd: any): Date {
    let a
    let alpha

    const z = Math.floor(ajd + 0.5)
    const f = ajd + 0.5 - z
    if (z < 2299161) {
      a = z
    } else {
      alpha = Math.floor((z - 1867216.25) / 36524.25)
      a = z + 1 + alpha - Math.floor(0.25 * alpha)
    }
    const b = a + 1524
    const c = Math.floor((b - 122.1) / 365.25)
    const d = Math.floor(365.25 * c)
    const e = Math.floor((b - d) / 30.6001)

    const day = b - d - Math.floor(30.6001 * e) + f
    const hrs = (day - Math.floor(day)) * 24
    const min = (hrs - Math.floor(hrs)) * 60
    const sec = (min - Math.floor(min)) * 60
    const msc = (sec - Math.floor(sec)) * 1000
    const month = e < 14 ? e - 2 : e - 14
    const year = month < 2 ? c - 4715 : c - 4716

    return new Date(year, month, day, hrs, min, sec, msc)
  }

  private fromAJD(ajd: number): HijriDate {
    let i = 0
    let left = Math.floor(ajd - 1948083.5)
    const y30 = Math.floor(left / 10631.0)

    left -= y30 * 10631
    while (left > this.DAYS_IN_30_YEARS[i]) {
      i += 1
    }

    const year = Math.round(y30 * 30.0 + i)
    if (i > 0) {
      left -= this.DAYS_IN_30_YEARS[i - 1]
    }
    i = 0
    while (left > this.DAYS_IN_YEAR[i]) {
      i += 1
    }
    const month = Math.round(i)
    const date = i > 0 ? Math.round(left - this.DAYS_IN_YEAR[i - 1]) : Math.round(left)

    return new HijriDate(year, month, date)
  }

  toAJD(): number {
    const y30 = Math.floor(this.year / 30.0)
    let ajd = 1948083.5 + y30 * 10631 + this.dayOfYear()
    if (this.year % 30 !== 0) {
      ajd += this.DAYS_IN_30_YEARS[this.year - y30 * 30 - 1]
    }
    return ajd
  }
}
