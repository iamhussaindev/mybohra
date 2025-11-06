import { VERSION_KEYS } from "app/constants/version-keys"
import { setupTitle } from "app/helpers/miqaat.helper"
import HijriDate from "app/libs/HijriDate"
import { apiSupabase } from "app/services/api"
import { timeInMilliseconds } from "app/utils/common"
import { momentTime } from "app/utils/currentTime"
import * as storage from "app/utils/storage"
import { types, flow, Instance, SnapshotOut } from "mobx-state-tree"

export const MiqaatModel = types.model("MiqaatModel", {
  id: types.identifierNumber,
  date: types.number,
  dateNight: types.maybeNull(types.number),
  description: types.maybeNull(types.string),
  isNight: types.boolean,
  name: types.string,
  location: types.string,
  month: types.number,
  monthNight: types.maybeNull(types.number),
  phase: types.enumeration("Phase", ["day", "night"]),
  priority: types.maybeNull(types.number),
  isImportant: types.boolean,
  type: types.optional(
    types.enumeration("MiqaatType", [
      "URS",
      "MILAD",
      "SHAHADAT",
      "WASHEQ",
      "EID",
      "PEHLI_RAAT",
      "ASHARA",
      "IMPORTANT_NIGHT",
      "OTHER",
    ]),
    "OTHER",
  ), // Assuming there can be more types
  info: types.maybeNull(types.string),
})

export const MiqaatStoreModel = types
  .model("MiqaatStore", {
    list: types.array(MiqaatModel),
  })
  .actions((self) => ({
    fetchMiqaats: flow(function* () {
      const list = yield storage.load("MIQAAT")
      const storedVersion = yield storage.load("MIQAAT_VERSION")

      const version = yield apiSupabase.fetchVersion(VERSION_KEYS.MIQAAT_VERSION)

      if (list && list.length > 0 && storedVersion === version.data?.version) {
        self.list = list
      } else {
        try {
          const response = yield apiSupabase.fetchMiqaats()

          if (response.kind === "ok") {
            // Transform the data to match the old model format
            const transformedData = response.data?.miqaats.map((item: any) => ({
              id: item.id,
              date: item.date || 0,
              dateNight: item.date_night,
              description: item.description,
              isNight: item.phase === "NIGHT",
              name: item.name,
              location: item.location || "",
              month: item.month || 0,
              monthNight: item.month_night,
              phase: item.phase?.toLowerCase() || "day",
              priority: item.priority,
              isImportant: item.important || false,
              type: item.type || "OTHER",
              info: item.html,
            }))

            self.list = transformedData
            yield storage.save("MIQAAT", transformedData)
            yield storage.save("MIQAAT_VERSION", version.data?.version)
          }
        } catch (error) {
          console.log(error)
        }
      }
    }),
  }))
  .views((self) => ({
    // Computed view to check if data is loaded
    get howManyMiqaats() {
      return self.list.length
    },

    miqaatsByMonth(month: number) {
      return self.list.filter((miqaat) => miqaat.month === month)
    },

    miqaatsOnDay(date: HijriDate | undefined) {
      if (!date) return []

      const checkToday = (miqaat: IMiqaat) => {
        const checkToday = miqaat.date === date.day && miqaat.month === date.month
        return checkToday
      }

      return self.list
        .filter((miqaat) => checkToday(miqaat))
        .sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0))
    },

    get miqaatsToday() {
      const checkToday = (miqaat: IMiqaat) => {
        const hour = momentTime().hour()
        const isBeforeEvening = hour < 18
        return miqaat.date === hijriDate.day && miqaat.month === hijriDate.month && isBeforeEvening
      }

      const checkToNight = (miqaat: IMiqaat) => {
        const checkTonight =
          miqaat.dateNight === hijriDate.day && miqaat.monthNight === hijriDate.month
        return checkTonight
      }

      const hijriDate = new HijriDate()

      const todayMiqaats = self.list
        .filter((miqaat) => checkToday(miqaat))
        .map((miqaat) => ({ ...miqaat, isNight: false }))

      const toNightMiqaats = self.list
        .filter((miqaat) => checkToNight(miqaat))
        .map((miqaat) => ({ ...miqaat, isNight: true }))
        .map((miqaat) => ({ ...miqaat, name: setupTitle(miqaat) }))

      const sortedMiqaats = [...todayMiqaats, ...toNightMiqaats].sort((a, b) => {
        return (b.isImportant ? 1 : 0) - (a.isImportant ? 1 : 0)
      })
      return sortedMiqaats
    },

    get upcomingMiqaats(): IMiqaat[] {
      const todayMiqaats = this.miqaatsToday
      const upcomingMiqaats = self.list.filter((miqaat) => {
        const isImportant = miqaat.isImportant
        const miqaatDate = momentTime(HijriDate.fromMiqaat(miqaat).toGregorian())

        const today = momentTime()

        const isUpcoming = miqaatDate.isAfter(today)
        return isImportant && isUpcoming
      })

      const sortedMiqaats = upcomingMiqaats
        .sort((a, b) => {
          const aDate = timeInMilliseconds(a.date, a.month)
          const bDate = timeInMilliseconds(b.date, b.month)
          return aDate - bDate
        })
        .filter((miqaat) => {
          return !todayMiqaats.some((todayMiqaat) => todayMiqaat.id === miqaat.id)
        })

      return sortedMiqaats.slice(0, 2)
    },

    get miqaats() {
      return self.list
    },
  }))

export interface MiqaatStore extends Instance<typeof MiqaatStoreModel> {}
export interface MiqaatStoreSnapshot extends SnapshotOut<typeof MiqaatStoreModel> {}
export interface IMiqaat extends Instance<typeof MiqaatModel> {}
