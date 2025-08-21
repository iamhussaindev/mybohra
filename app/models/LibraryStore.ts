import { types, flow, Instance, SnapshotOut } from "mobx-state-tree"
import { api } from "app/services/api"
import * as storage from "app/utils/storage"
import { momentTime } from "app/utils/currentTime"

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
  })
  .actions((self) => ({
    fetchHomeData: flow(function* () {
      const day = momentTime().isoWeekday() - 1
      const today = days[day]

      try {
        const response: any = yield api.fetch(
          `library/list?categories[]=daily-duas&categories[]=${today}&daily=true`,
        )
        const data = response.data as ILibrary[]

        if (response.kind === "ok") {
          self.homeData = data as any
          yield storage.save("LIBRARY_HOME", data)
        }
      } catch (error) {
        console.log(error)
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
  }))

// Create an instance of LibraryStore

export interface LibraryStore extends Instance<typeof LibraryStoreModel> {}
export interface LibraryStoreSnapshot extends SnapshotOut<typeof LibraryStoreModel> {}
export interface ILibrary extends Instance<typeof LibraryModel> {}
