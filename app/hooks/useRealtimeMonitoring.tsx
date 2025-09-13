import { useEffect, useCallback, useRef } from "react"
import { AppState, AppStateStatus } from "react-native"

import { realtimeMonitorService } from "../services/monitoring/realtime-monitor.service"

interface UseRealtimeMonitoringOptions {
  screenName?: string
  trackPageViews?: boolean
  trackAppStateChanges?: boolean
  trackUserActivities?: boolean
}

export const useRealtimeMonitoring = (options: UseRealtimeMonitoringOptions = {}) => {
  const {
    screenName,
    trackPageViews = true,
    trackAppStateChanges = true,
    trackUserActivities = true,
  } = options

  const appStateRef = useRef(AppState.currentState)
  const previousScreenRef = useRef<string | null>(null)

  // Initialize monitoring on mount
  useEffect(() => {
    realtimeMonitorService.initialize()
  }, [])

  // Track page views
  useEffect(() => {
    if (trackPageViews && screenName) {
      realtimeMonitorService.trackPageView(screenName, previousScreenRef.current || undefined)
      previousScreenRef.current = screenName
    }
  }, [screenName, trackPageViews])

  // Track app state changes
  useEffect(() => {
    if (!trackAppStateChanges) return

    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (appStateRef.current !== nextAppState) {
        const isActive = nextAppState === "active"
        realtimeMonitorService.setUserActive(isActive)
        appStateRef.current = nextAppState
      }
    }

    const subscription = AppState.addEventListener("change", handleAppStateChange)

    return () => {
      subscription?.remove()
    }
  }, [trackAppStateChanges])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      realtimeMonitorService.endSession()
    }
  }, [])

  // Monitoring methods
  const trackPageView = useCallback((screenName: string, previousScreen?: string) => {
    realtimeMonitorService.trackPageView(screenName, previousScreen)
  }, [])

  const trackUserActivity = useCallback(
    (activity: string, details?: Record<string, any>) => {
      if (trackUserActivities) {
        realtimeMonitorService.trackUserActivity(activity, details)
      }
    },
    [trackUserActivities],
  )

  const setUserId = useCallback((userId: string) => {
    realtimeMonitorService.setUserId(userId)
  }, [])

  const setUserActive = useCallback((isActive: boolean) => {
    realtimeMonitorService.setUserActive(isActive)
  }, [])

  const getCurrentData = useCallback(() => {
    return realtimeMonitorService.getCurrentData()
  }, [])

  const getActiveUsersData = useCallback(() => {
    return realtimeMonitorService.getActiveUsersData()
  }, [])

  // Predefined activity trackers
  const trackButtonClick = useCallback(
    (buttonName: string, screen?: string) => {
      trackUserActivity("button_click", { button_name: buttonName, screen })
    },
    [trackUserActivity],
  )

  const trackNavigation = useCallback(
    (fromScreen: string, toScreen: string) => {
      trackUserActivity("navigation", { from_screen: fromScreen, to_screen: toScreen })
    },
    [trackUserActivity],
  )

  const trackFeatureUsage = useCallback(
    (featureName: string, details?: Record<string, any>) => {
      trackUserActivity("feature_usage", { feature_name: featureName, ...details })
    },
    [trackUserActivity],
  )

  const trackSearch = useCallback(
    (searchTerm: string, resultsCount?: number) => {
      trackUserActivity("search", { search_term: searchTerm, results_count: resultsCount })
    },
    [trackUserActivity],
  )

  const trackMediaInteraction = useCallback(
    (mediaType: "audio" | "video" | "pdf", action: string, mediaName?: string) => {
      trackUserActivity("media_interaction", {
        media_type: mediaType,
        action,
        media_name: mediaName,
      })
    },
    [trackUserActivity],
  )

  const trackFormSubmission = useCallback(
    (formName: string, success: boolean, errorMessage?: string) => {
      trackUserActivity("form_submission", {
        form_name: formName,
        success,
        error_message: errorMessage,
      })
    },
    [trackUserActivity],
  )

  const trackSettingsChange = useCallback(
    (settingName: string, oldValue: any, newValue: any) => {
      trackUserActivity("settings_change", {
        setting_name: settingName,
        old_value: oldValue,
        new_value: newValue,
      })
    },
    [trackUserActivity],
  )

  const trackError = useCallback(
    (errorType: string, errorMessage: string, context?: Record<string, any>) => {
      trackUserActivity("error_occurred", {
        error_type: errorType,
        error_message: errorMessage,
        ...context,
      })
    },
    [trackUserActivity],
  )

  const trackPerformance = useCallback(
    (metricName: string, value: number, unit = "ms") => {
      trackUserActivity("performance_metric", {
        metric_name: metricName,
        value,
        unit,
      })
    },
    [trackUserActivity],
  )

  return {
    // Core methods
    trackPageView,
    trackUserActivity,
    setUserId,
    setUserActive,
    getCurrentData,
    getActiveUsersData,

    // Predefined activity trackers
    trackButtonClick,
    trackNavigation,
    trackFeatureUsage,
    trackSearch,
    trackMediaInteraction,
    trackFormSubmission,
    trackSettingsChange,
    trackError,
    trackPerformance,
  }
}

export default useRealtimeMonitoring
