import { types, flow, Instance, SnapshotOut } from "mobx-state-tree"
import { api } from "app/services/api"
import * as storage from "app/utils/storage"

export const TasbeehModel = types.model("TasbeehModel", {
  arabicText: types.maybeNull(types.string),
  text: types.maybeNull(types.string),
  count: types.maybeNull(types.number), // Better to keep it as a number
  id: types.identifierNumber, // Using `identifierNumber` if `id` is a unique identifier
  image: types.maybeNull(types.string),
  audio: types.maybeNull(types.string),
  type: types.string,
  name: types.maybeNull(types.string),
  tags: types.optional(types.array(types.string), []),
})

export const SavedTasbeehModel = types.model("SavedTasbeehModel", {
  tasbeeh: TasbeehModel,
  count: types.number,
})

export const TasbeehStoreModel = types
  .model("TasbeehStore", {
    list: types.optional(types.array(TasbeehModel), []),
    savedList: types.optional(types.array(SavedTasbeehModel), []),
    defaultTasbeehCount: types.optional(types.number, 0),
    defaultTasbeehGoal: types.optional(types.number, 0),
    savingCount: types.optional(types.boolean, false),
  })
  .actions((self) => ({
    reset: flow(function* () {
      self.savingCount = false
    }),
    fetchTasbeeh: flow(function* () {
      try {
        const list = yield storage.load("TASBEEH")
        const storedVersion = yield storage.load("TASBEEH_VERSION")

        const version = yield api.fetchVersion("TASBEEH")

        if (list && list.length > 0 && storedVersion === version.data?.version) {
          self.list = list
        } else {
          try {
            const response = yield api.fetch("tasbeeh")
            if (response.kind === "ok") {
              self.list = response.data
              yield storage.save("TASBEEH", response.data)
            }
          } catch (error) {
            console.log(error)
          }
        }
      } catch (error) {
        console.log(error)
      }
    }),
    setDefaultTasbeehCount: flow(function* (count: number, goal: number) {
      self.savingCount = true
      try {
        self.defaultTasbeehCount = count
        yield storage.save("DEFAULT_TASBEEH_COUNT", count)
        self.defaultTasbeehGoal = goal
        yield storage.save("DEFAULT_TASBEEH_GOAL", goal)
      } catch (error) {
        console.log(error)
      }
      self.savingCount = false
    }),
    loadSavedTasbeeh: flow(function* () {
      try {
        const savedTasbeeh = yield storage.load("SAVED_TASBEEH")
        self.savedList = savedTasbeeh
      } catch (error) {
        console.log(error)
      }
    }),
    saveCurrentCount: flow(function* (id: number, count: number) {
      try {
        // Find the tasbeeh in savedList by id
        const savedTasbeeh = self.savedList.find((saved) => saved.tasbeeh.id === id)
        if (savedTasbeeh) {
          savedTasbeeh.count = count // Update the count
        } else {
          // If not found, add a new saved tasbeeh
          const tasbeeh = self.list.find((t) => t.id === id)
          if (tasbeeh) {
            self.savedList.push({
              tasbeeh,
              count,
            })
          }
        }

        // Persist the updated savedList to storage
        yield storage.save("SAVED_TASBEEH", self.savedList)
      } catch (error) {
        console.log("Failed to save current count:", error)
      }
    }),
  }))
  .views((self) => ({
    get all() {
      return self.list
    },
    get defaultCount() {
      return self.defaultTasbeehCount
    },
    get savedTasbeeh() {
      return self.savedList
    },
  }))

// Create an instance of DataStore

export interface TasbeehStore extends Instance<typeof TasbeehStoreModel> {}
export interface TasbeehStoreSnapshot extends SnapshotOut<typeof TasbeehStoreModel> {}
export interface ITasbeeh extends Instance<typeof TasbeehModel> {}
