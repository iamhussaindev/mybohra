import { Instance, SnapshotOut, types } from "mobx-state-tree"

import { DataStoreModel, LocationModel } from "./DataStore"
import { LibraryStoreModel } from "./LibraryStore"
import { MiqaatStoreModel } from "./MiqaatStore"
import { ReminderStoreModel } from "./ReminderStore"
import { TasbeehStoreModel } from "./TasbeehStore"
import { YouTubeStoreModel } from "./YouTubeStore"

/**
 * A RootStore model.
 */
export const RootStoreModel = types.model("RootStore").props({
  dataStore: types.optional(DataStoreModel, {
    currentLocation: LocationModel.create(),
    currentLocationLoaded: false,
    locations: [],
    locationsLoaded: false,
  }),
  miqaatStore: types.optional(MiqaatStoreModel, {
    list: [],
  }),

  libraryStore: types.optional(LibraryStoreModel, {
    homeData: [],
  }),

  reminderStore: types.optional(ReminderStoreModel, {
    reminders: [],
    isLoaded: false,
  }),

  tasbeehStore: types.optional(TasbeehStoreModel, {
    list: [],
    defaultTasbeehCount: 0,
    savingCount: false,
  }),

  youtubeStore: types.optional(YouTubeStoreModel, {
    videos: [],
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
