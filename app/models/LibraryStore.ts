import { VERSION_KEYS } from "app/constants/version-keys"
import HijriDate from "app/libs/HijriDate"
import { apiSupabase } from "app/services/api"
import * as storage from "app/utils/storage"
import { types, flow, Instance, SnapshotOut } from "mobx-state-tree"

export const MetadataModel = types.model("MetadataModel", {
  audioSize: types.maybeNull(types.number),
  pdfSize: types.union(types.number, types.string, types.undefined, types.null),
  audioLength: types.maybeNull(types.number),
  pdfPageCount: types.union(types.number, types.string, types.undefined, types.null),
  thumbnail: types.maybeNull(types.string),
})

export const LibraryModel = types.model("LibraryModel", {
  id: types.identifierNumber,
  name: types.string,
  description: types.maybeNull(types.string),
  audio_url: types.maybeNull(types.string),
  pdf_url: types.maybeNull(types.string),
  youtube_url: types.maybeNull(types.string),
  metadata: types.maybeNull(MetadataModel),
  album: types.maybeNull(types.string),
  tags: types.maybeNull(types.array(types.string)),
  categories: types.maybeNull(types.array(types.string)),
  search_text: types.maybeNull(types.string),
  search_vector: types.maybeNull(types.string),
  created_at: types.maybeNull(types.string),
  updated_at: types.maybeNull(types.string),
})

export const LibraryStoreModel = types
  .model("LibraryStore", {
    homeData: types.optional(types.array(LibraryModel), []),
    allLibraryData: types.array(LibraryModel),
  })
  .actions((self) => ({
    fetchHomeData: flow(function* () {
      try {
        const date = new HijriDate()
        const response: any = yield apiSupabase.fetchDailyDuasByDate({
          date: date.day,
          month: date.month,
        })

        if (response.kind === "ok") {
          self.homeData = response.data as any
        }
      } catch (error) {
        console.log("Error fetching daily items:", error)
      }
    }),
    getCategories: function () {
      return (
        Array.from(
          new Set(
            self.allLibraryData
              .map((item) => item.categories)
              .filter((item) => item !== null)
              .flat()
              .filter((item): item is string => typeof item === "string"),
          ),
        ).map((item) => {
          let title
          if (item === "daily-dua") {
            title = "Daily Ibadat"
          }

          title = item?.replace("_", " ").replace("-", " ")

          return {
            id: item ?? "",
            title: title.replace("daily dua", "daily ibadat") ?? "",
            description: item ?? "",
            count: 0,
          }
        }) ?? []
      )
    },
    fetchList: flow(function* () {
      try {
        // First, check if we have cached data and version
        const cachedData = yield storage.load("LIBRARY_ALL")

        const storedVersion = yield storage.load("DUA_LIST_VERSION")

        // Fetch current version from API
        const versionResponse = yield apiSupabase.fetchVersion(VERSION_KEYS.DUA_VERSION)

        if (versionResponse.kind === "ok") {
          const currentVersion = versionResponse.data?.version

          // If we have cached data and versions match, use cached data
          if (cachedData && cachedData.length > 0 && storedVersion === currentVersion) {
            self.allLibraryData = cachedData as any
            return
          }

          // If versions don't match or no cached data, fetch fresh data
          const response: any = yield apiSupabase.fetch("library/all")

          if (response.kind === "ok") {
            const data = response.data as ILibrary[]
            self.allLibraryData = data as any

            // Save data and version to storage
            yield storage.save("LIBRARY_ALL", data)
            yield storage.save("DUA_LIST_VERSION", currentVersion)
          }
        } else {
          // If version check fails, try to fetch data anyway
          const response: any = yield apiSupabase.fetch("library/all")

          if (response.kind === "ok") {
            const data = response.data as ILibrary[]
            self.allLibraryData = data as any
            yield storage.save("LIBRARY_ALL", data)
          }
        }
      } catch (error) {
        console.log("Error fetching library list:", error)
      }
    }),
  }))
  .views((self) => ({
    // Computed view to check if data is loaded
    get howManyLibrary() {
      return self.homeData.length
    },

    get libraryItems() {
      return self.homeData
    },

    // Computed view for all library data
    get howManyAllLibrary() {
      return self.allLibraryData.length
    },

    get allLibraryItems() {
      return self.allLibraryData
    },

    // Get items by IDs (for pinned items)
    getItemsByIds(ids: number[]): ILibrary[] {
      return self.allLibraryData.filter((item) => ids.includes(item.id))
    },

    // Get items by categories
    fetchItemsByCategories(categories: string[]): ILibrary[] {
      if (!categories || categories.length === 0) {
        return []
      }

      return self.allLibraryData.filter((item) => {
        if (!item.categories || item.categories.length === 0) {
          return false
        }
        // Check if any of the item's categories match any of the requested categories
        return item.categories.some((category) => categories.includes(category))
      })
    },
  }))

export interface LibraryStore extends Instance<typeof LibraryStoreModel> {}
export interface LibraryStoreSnapshot extends SnapshotOut<typeof LibraryStoreModel> {}
export interface ILibrary extends Instance<typeof LibraryModel> {}
