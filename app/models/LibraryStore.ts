import { api } from "app/services/api"
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
  audio: types.maybeNull(types.string),
  pdf: types.maybeNull(types.string),
  metadata: types.maybeNull(MetadataModel),
  album: types.maybeNull(types.string),
})

const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]

export const LibraryStoreModel = types
  .model("LibraryStore", {
    homeData: types.array(LibraryModel),
    allLibraryData: types.array(LibraryModel),
  })
  .actions((self) => ({
    fetchHomeData: flow(function* () {
      try {
        const response: any = yield api.fetch(`library/daily-items`)
        const data = response.data as ILibrary[]

        if (response.kind === "ok") {
          self.homeData = data as any
          yield storage.save("LIBRARY_HOME", data)
        }
      } catch (error) {
        console.log(error)
      }
    }),

    fetchList: flow(function* () {
      try {
        // First, check if we have cached data and version
        const cachedData = yield storage.load("LIBRARY_ALL")
        const storedVersion = yield storage.load("DUA_LIST_VERSION")

        // Fetch current version from API
        const versionResponse = yield api.fetchVersion("DUA_LIST")

        if (versionResponse.kind === "ok") {
          const currentVersion = versionResponse.data?.version

          // If we have cached data and versions match, use cached data
          if (cachedData && cachedData.length > 0 && storedVersion === currentVersion) {
            self.allLibraryData = cachedData as any
            return
          }

          // If versions don't match or no cached data, fetch fresh data
          const response: any = yield api.fetch("library/all")

          if (response.kind === "ok") {
            const data = response.data as ILibrary[]
            self.allLibraryData = data as any

            // Save data and version to storage
            yield storage.save("LIBRARY_ALL", data)
            yield storage.save("DUA_LIST_VERSION", currentVersion)
          }
        } else {
          // If version check fails, try to fetch data anyway
          const response: any = yield api.fetch("library/all")

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
  }))

// Create an instance of LibraryStore

export interface LibraryStore extends Instance<typeof LibraryStoreModel> {}
export interface LibraryStoreSnapshot extends SnapshotOut<typeof LibraryStoreModel> {}
export interface ILibrary extends Instance<typeof LibraryModel> {}
