
import { api } from "app/services/api"
import * as storage from "app/utils/storage"
import { types, flow, Instance, SnapshotOut } from "mobx-state-tree"

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
    defaultTasbeehCount: types.optional(types.number, 0),
    defaultTasbeehGoal: types.optional(types.number, 0),
    savingCount: types.optional(types.boolean, false),
    selectedTasbeehId: types.maybeNull(types.number),
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
    saveDefaultCount: flow(function* (count: number) {
      try {
        self.defaultTasbeehCount = count
        yield storage.save("DEFAULT_TASBEEH_COUNT", count)
      } catch (error) {
        console.log("Failed to save default count:", error)
      }
    }),

    setSelectedTasbeeh: flow(function* (tasbeehId: number | null) {
      try {
        if (self.selectedTasbeehId === tasbeehId) {
          return
        }

        self.selectedTasbeehId = tasbeehId
        // set goal to the count of the tasbeeh
        self.defaultTasbeehGoal = self.list.find((tasbeeh) => tasbeeh.id === tasbeehId)?.count || 0
        self.defaultTasbeehCount = 0
        yield storage.save("DEFAULT_TASBEEH_GOAL", self.defaultTasbeehGoal)
        yield storage.save("SELECTED_TASBEEH_ID", tasbeehId)
      } catch (error) {
        console.log("Failed to save selected tasbeeh:", error)
      }
    }),
    loadSelectedTasbeeh: flow(function* () {
      try {
        const selectedTasbeehId = yield storage.load("SELECTED_TASBEEH_ID")
        console.log("Loaded selectedTasbeehId from storage:", selectedTasbeehId)
        self.selectedTasbeehId = selectedTasbeehId || null
      } catch (error) {
        console.log("Failed to load selected tasbeeh:", error)
        self.selectedTasbeehId = null
      }
    }),
    loadDefaultTasbeehCount: flow(function* () {
      try {
        const defaultCount = yield storage.load("DEFAULT_TASBEEH_COUNT")
        const defaultGoal = yield storage.load("DEFAULT_TASBEEH_GOAL")
        console.log("Loaded defaultCount from storage:", defaultCount)
        console.log("Loaded defaultGoal from storage:", defaultGoal)
        self.defaultTasbeehCount = defaultCount || 0
        self.defaultTasbeehGoal = defaultGoal || 0
      } catch (error) {
        console.log("Failed to load default tasbeeh count:", error)
        self.defaultTasbeehCount = 0
        self.defaultTasbeehGoal = 0
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

    get selectedTasbeeh() {
      if (!self.selectedTasbeehId) return null
      return self.list.find((tasbeeh) => tasbeeh.id === self.selectedTasbeehId) || null
    },
  }))

// Create an instance of DataStore

export interface TasbeehStore extends Instance<typeof TasbeehStoreModel> {}
export interface TasbeehStoreSnapshot extends SnapshotOut<typeof TasbeehStoreModel> {}
export interface ITasbeeh extends Instance<typeof TasbeehModel> {}
