import { firebaseAnalyticsService } from "./analytics/firebase-analytics.service"

/** Non-blocking analytics wrapper for opens, searches, and sync events. */
export const analytics = {
  trackEvent(name: string, params?: Record<string, string | number | boolean>) {
    void firebaseAnalyticsService.logEvent(name, params).catch(() => undefined)
  },

  trackSearch(query: string, resultCount: number) {
    this.trackEvent("search", { query_length: query.length, result_count: resultCount })
  },

  trackOfflineSync(success: boolean) {
    this.trackEvent("offline_sync", { success })
  },
}
