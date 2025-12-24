import { apiSupabase } from "app/services/api"
import { types, flow, Instance, SnapshotOut } from "mobx-state-tree"

export const YouTubeVideoModel = types.model("YouTubeVideoModel", {
  id: types.identifierNumber,
  video_id: types.string,
  title: types.string,
  description: types.maybeNull(types.string),
  duration: types.maybeNull(types.number),
  view_count: types.maybeNull(types.number),
  upload_date: types.maybeNull(types.string),
  url: types.string,
  thumbnail: types.maybeNull(types.string),
  thumbnail_default: types.maybeNull(types.string),
  thumbnail_medium: types.maybeNull(types.string),
  thumbnail_high: types.maybeNull(types.string),
  thumbnail_standard: types.maybeNull(types.string),
  thumbnail_maxres: types.maybeNull(types.string),
  channel_url: types.maybeNull(types.string),
  channel_handle: types.maybeNull(types.string),
  created_at: types.string,
  updated_at: types.string,
  tags: types.maybeNull(types.array(types.string)),
  categories: types.maybeNull(types.array(types.string)),
  library_id: types.maybeNull(types.number),
})

export const YouTubeStoreModel = types
  .model("YouTubeStore", {
    videos: types.optional(types.array(YouTubeVideoModel), []),
  })
  .actions((self) => ({
    /**
     * Fetch YouTube videos with optional filters and sorting
     */
    fetchVideos: flow(function* (options?: {
      limit?: number
      offset?: number
      categories?: string[]
      tags?: string[]
      sortBy?: "view_count" | "created_at" | "upload_date"
      sortOrder?: "asc" | "desc"
    }) {
      try {
        const response = yield apiSupabase.fetchYouTubeVideos(options)
        if (response.kind === "ok") {
          return response.data as IYouTubeVideo[]
        }
        return []
      } catch (error) {
        console.log("Error fetching YouTube videos:", error)
        return []
      }
    }),

    /**
     * Fetch YouTube video by video_id
     */
    fetchVideoById: flow(function* (videoId: string) {
      try {
        const response = yield apiSupabase.fetchYouTubeVideoById(videoId)
        if (response.kind === "ok") {
          return response.data
        }
        return null
      } catch (error) {
        console.log("Error fetching YouTube video by ID:", error)
        return null
      }
    }),

    /**
     * Fetch YouTube videos by channel handle
     */
    fetchVideosByChannel: flow(function* (
      channelHandle: string,
      options?: { limit?: number; offset?: number },
    ) {
      try {
        const response = yield apiSupabase.fetchYouTubeVideosByChannel(channelHandle, options)
        if (response.kind === "ok") {
          return response.data as IYouTubeVideo[]
        }
        return []
      } catch (error) {
        console.log("Error fetching YouTube videos by channel:", error)
        return []
      }
    }),

    /**
     * Fetch YouTube videos filtered by categories
     */
    fetchVideosByCategories: flow(function* (
      categories: string[],
      options?: {
        limit?: number
        offset?: number
        sortBy?: "view_count" | "created_at" | "upload_date"
        sortOrder?: "asc" | "desc"
      },
    ) {
      try {
        const response = yield apiSupabase.fetchYouTubeVideos({
          ...options,
          categories,
        })
        if (response.kind === "ok") {
          return response.data as IYouTubeVideo[]
        }
        return []
      } catch (error) {
        console.log("Error fetching YouTube videos by categories:", error)
        return []
      }
    }),

    /**
     * Fetch YouTube videos filtered by tags
     */
    fetchVideosByTags: flow(function* (
      tags: string[],
      options?: {
        limit?: number
        offset?: number
        sortBy?: "view_count" | "created_at" | "upload_date"
        sortOrder?: "asc" | "desc"
      },
    ) {
      try {
        const response = yield apiSupabase.fetchYouTubeVideos({
          ...options,
          tags,
        })
        if (response.kind === "ok") {
          return response.data as IYouTubeVideo[]
        }
        return []
      } catch (error) {
        console.log("Error fetching YouTube videos by tags:", error)
        return []
      }
    }),

    /**
     * Fetch YouTube videos sorted by view count
     */
    fetchVideosSortedByViews: flow(function* (options?: {
      limit?: number
      offset?: number
      categories?: string[]
      tags?: string[]
      sortOrder?: "asc" | "desc"
    }) {
      try {
        const response = yield apiSupabase.fetchYouTubeVideos({
          ...options,
          sortBy: "view_count",
          sortOrder: options?.sortOrder || "desc",
        })

        console.log("response", response)
        if (response.kind === "ok") {
          return response.data as IYouTubeVideo[]
        }
        return []
      } catch (error) {
        console.log("Error fetching YouTube videos sorted by views:", error)
        return []
      }
    }),

    /**
     * Set videos in store (for caching)
     */
    setVideos: function (videos: IYouTubeVideo[]) {
      self.videos = videos as any
    },

    /**
     * Clear videos from store
     */
    clearVideos: function () {
      self.videos = [] as any
    },
  }))
  .views((self) => ({
    /**
     * Get all videos in store
     */
    get allVideos() {
      return self.videos
    },

    /**
     * Get video count
     */
    get videoCount() {
      return self.videos.length
    },

    /**
     * Get video by ID
     */
    getVideoById: function (id: number) {
      return self.videos.find((video) => video.id === id)
    },

    /**
     * Get video by video_id
     */
    getVideoByVideoId: function (videoId: string) {
      return self.videos.find((video) => video.video_id === videoId)
    },
  }))

export interface YouTubeStore extends Instance<typeof YouTubeStoreModel> {}
export interface YouTubeStoreSnapshot extends SnapshotOut<typeof YouTubeStoreModel> {}
export interface IYouTubeVideo extends Instance<typeof YouTubeVideoModel> {}
