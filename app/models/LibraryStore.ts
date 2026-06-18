import HijriDate from "app/libs/HijriDate"
import { apiSupabase } from "app/services/api"
import { types, flow, Instance, SnapshotOut } from "mobx-state-tree"

import { ILibraryDb, LibraryDbModel } from "./generated"

export { LibraryDbModel as LibraryModel }
export type { ILibraryDb as ILibrary }

export const LibraryStoreModel = types
  .model("LibraryStore", {
    homeData: types.optional(types.array(LibraryDbModel), []),
    // Remove allLibraryData - we'll fetch from Supabase on demand
    categories: types.optional(types.array(types.frozen()), []),
    albums: types.optional(types.array(types.frozen()), []),
    tags: types.optional(types.array(types.frozen()), []),
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
    fetchCategories: flow(function* () {
      try {
        const response = yield apiSupabase.fetchCategories()
        if (response.kind === "ok") {
          self.categories = response.data as any
        }
      } catch (error) {
        console.log("Error fetching categories:", error)
      }
    }),

    getCategories: function () {
      return self.categories
    },

    fetchAlbums: flow(function* (options?: { filterAudioOnly?: boolean }) {
      try {
        const response = yield apiSupabase.fetchAlbums(options)
        if (response.kind === "ok") {
          self.albums = response.data as any
        }
      } catch (error) {
        console.log("Error fetching albums:", error)
      }
    }),

    getAlbums: function () {
      return self.albums
    },

    fetchTags: flow(function* () {
      try {
        const response = yield apiSupabase.fetchTags()
        if (response.kind === "ok") {
          self.tags = response.data as any
        }
      } catch (error) {
        console.log("Error fetching tags:", error)
      }
    }),

    getTags: function () {
      return self.tags
    },
    // Removed fetchList - no longer caching library data
    // Fetch items by album from Supabase
    fetchByAlbum: flow(function* (album: string, options?: { filterAudioOnly?: boolean }) {
      try {
        const response = yield apiSupabase.fetchByAlbum(album, options)
        if (response.kind === "ok") {
          return response.data as ILibraryDb[]
        }
        return []
      } catch (error) {
        console.log("Error fetching by album:", error)
        return []
      }
    }),

    // Fetch items by categories from Supabase with pagination
    fetchByCategories: flow(function* (
      categories: string[] | string,
      options?: { limit?: number; offset?: number; filterAudioOnly?: boolean },
    ) {
      try {
        const response = yield apiSupabase.fetchByCategories(categories as string[], options)
        if (response.kind === "ok") {
          return response.data as ILibraryDb[]
        }
        return []
      } catch (error) {
        console.log("Error fetching by categories:", error)
        return []
      }
    }),

    // Fetch items by tags from Supabase
    fetchByTags: flow(function* (tags: string[]) {
      try {
        const response = yield apiSupabase.fetchByTags(tags)
        if (response.kind === "ok") {
          return response.data as ILibraryDb[]
        }
        return []
      } catch (error) {
        console.log("Error fetching by tags:", error)
        return []
      }
    }),

    // Fetch items by IDs from Supabase
    fetchItemsByIds: flow(function* (ids: number[]) {
      try {
        const response = yield apiSupabase.fetchLibraryItemsByIds(ids)
        if (response.kind === "ok") {
          return response.data as ILibraryDb[]
        }
        return []
      } catch (error) {
        console.log("Error fetching items by IDs:", error)
        return []
      }
    }),

    // Search library using RPC
    searchLibrary: flow(function* (searchQuery: string, searchAlbum?: string | null) {
      try {
        const response = yield apiSupabase.searchLibrary(searchQuery, searchAlbum)
        if (response.kind === "ok") {
          return response.data as ILibraryDb[]
        }
        return []
      } catch (error) {
        console.log("Error searching library:", error)
        return []
      }
    }),

    // Fetch customized upnext items
    fetchCustomizedUpnext: flow(function* (params: {
      album: string
      categories?: string[] | null
      tags?: string[] | null
      excludeIds?: number[]
      limit?: number
    }) {
      try {
        const response = yield apiSupabase.fetchCustomizedUpnext(params)
        if (response.kind === "ok") {
          return response.data as ILibraryDb[]
        }
        return []
      } catch (error) {
        console.log("Error fetching customized upnext:", error)
        return []
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

export interface LibraryStore extends Instance<typeof LibraryStoreModel> {}
export interface LibraryStoreSnapshot extends SnapshotOut<typeof LibraryStoreModel> {}
