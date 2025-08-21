import { NativeModules } from "react-native"

export class Namaz {
  static async getPrayerTimes(lat: number, lon: number, date: string) {
    NativeModules.Namaz.getPrayerTimes(lat, lon, date, (times: any) => {
      return times
    })
  }
}
