import HijriDate from "app/libs/HijriDate"
import { apiSupabase } from "app/services/api"
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

    fetchAlbums: flow(function* () {
      try {
        const response = yield apiSupabase.fetchAlbums()
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
    fetchByAlbum: flow(function* (album: string) {
      try {
        const response = yield apiSupabase.fetchByAlbum(album)
        if (response.kind === "ok") {
          return response.data as ILibrary[]
        }
        return []
      } catch (error) {
        console.log("Error fetching by album:", error)
        return []
      }
    }),

    // Fetch items by categories from Supabase
    fetchByCategories: flow(function* (categories: string[]) {
      try {
        const response = yield apiSupabase.fetchByCategories(categories)
        if (response.kind === "ok") {
          return response.data as ILibrary[]
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
          return response.data as ILibrary[]
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
          return response.data as ILibrary[]
        }
        return []
      } catch (error) {
        console.log("Error fetching items by IDs:", error)
        return []
      }
    }),

    // Search library using RPC
    searchLibrary: flow(function* (searchQuery: string) {
      try {
        const response = yield apiSupabase.searchLibrary(searchQuery)
        if (response.kind === "ok") {
          return response.data as ILibrary[]
        }
        return []
      } catch (error) {
        console.log("Error searching library:", error)
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
export interface ILibrary extends Instance<typeof LibraryModel> {}
