import { Instance, SnapshotOut, types } from "mobx-state-tree"
import { DataStoreModel, LocationModel } from "./DataStore"
import { MiqaatStoreModel } from "./MiqaatStore"
import { LibraryStoreModel } from "./LibraryStore"
import { TasbeehStoreModel } from "./TasbeehStore"

/**
 * A RootStore model.
 */
export const RootStoreModel = types.model("RootStore").props({
  dataStore: types.optional(DataStoreModel, {
    currentLocation: LocationModel.create(),
  }),
  miqaatStore: types.optional(MiqaatStoreModel, {
    list: [],
  }),

  libraryStore: types.optional(LibraryStoreModel, {
    homeData: [],
  }),

  tasbeehStore: types.optional(TasbeehStoreModel, {
    list: [],
    savedList: [],
    defaultTasbeehCount: 0,
    savingCount: false,
  }),
})

/**
 * The RootStore instance.
 */
export interface RootStore extends Instance<typeof RootStoreModel> {}
/**
 * The data of a RootStore.
 */
export interface RootStoreSnapshot extends SnapshotOut<typeof RootStoreModel> {}
