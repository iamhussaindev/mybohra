import { useEffect, useCallback, useRef } from "react"
import { AppState, AppStateStatus } from "react-native"

import {
  expoAnalyticsService,
  ANALYTICS_EVENTS,
} from "../services/analytics/expo-analytics.service"

interface UseAnalyticsOptions {
  screenName?: string
  screenClass?: string
  trackScreenView?: boolean
  trackAppStateChanges?: boolean
}

export const useAnalytics = (options: UseAnalyticsOptions = {}) => {
  const { screenName, screenClass, trackScreenView = true, trackAppStateChanges = true } = options

  const appStateRef = useRef(AppState.currentState)

  // Initialize analytics on mount
  useEffect(() => {
    expoAnalyticsService.initialize()
  }, [])

  // Track screen view
  useEffect(() => {
    if (trackScreenView && screenName) {
      expoAnalyticsService.trackScreenView(screenName, screenClass)
    }
  }, [screenName, screenClass, trackScreenView])

  // Track app state changes
  useEffect(() => {
    if (!trackAppStateChanges) return

    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (appStateRef.current !== nextAppState) {
        expoAnalyticsService.trackAppStateChange(
          nextAppState as "active" | "background" | "inactive",
        )
        appStateRef.current = nextAppState
      }
    }

    const subscription = AppState.addEventListener("change", handleAppStateChange)

    return () => {
      subscription?.remove()
    }
  }, [trackAppStateChanges])

  // Analytics methods
  const trackEvent = useCallback((eventName: string, parameters?: Record<string, any>) => {
    expoAnalyticsService.logEvent(eventName, parameters)
  }, [])

  const trackUserAction = useCallback((action: string, details?: Record<string, any>) => {
    expoAnalyticsService.trackUserAction(action, details)
  }, [])

  const trackError = useCallback((errorName: string, error: any, fatal = false) => {
    expoAnalyticsService.recordError(errorName, error, fatal)
  }, [])

  const trackPerformance = useCallback((metricName: string, value: number, unit = "ms") => {
    expoAnalyticsService.trackPerformance(metricName, value, unit)
  }, [])

  const setUserId = useCallback((userId: string) => {
    expoAnalyticsService.setUserId(userId)
  }, [])

  // Predefined event trackers
  const trackScreenViewCustom = useCallback((screen: string, screenClass?: string) => {
    expoAnalyticsService.trackScreenView(screen, screenClass)
  }, [])

  const trackPrayerTimeViewed = useCallback(
    (prayerName: string, location?: string) => {
      trackEvent(ANALYTICS_EVENTS.PRAYER_TIME_VIEWED, { prayer_name: prayerName, location })
    },
    [trackEvent],
  )

  const trackQiblaOpened = useCallback(
    (location?: string) => {
      trackEvent(ANALYTICS_EVENTS.QIBLA_OPENED, { location })
    },
    [trackEvent],
  )

  const trackCalendarOpened = useCallback(
    (date?: string) => {
      trackEvent(ANALYTICS_EVENTS.CALENDAR_OPENED, { date })
    },
    [trackEvent],
  )

  const trackReminderCreated = useCallback(
    (reminderType: string, prayerName?: string) => {
      trackEvent(ANALYTICS_EVENTS.REMINDER_CREATED, {
        reminder_type: reminderType,
        prayer_name: prayerName,
      })
    },
    [trackEvent],
  )

  const trackReminderDeleted = useCallback(
    (reminderType: string, prayerName?: string) => {
      trackEvent(ANALYTICS_EVENTS.REMINDER_DELETED, {
        reminder_type: reminderType,
        prayer_name: prayerName,
      })
    },
    [trackEvent],
  )

  const trackTasbeehStarted = useCallback(
    (tasbeehName: string, targetCount?: number) => {
      trackEvent(ANALYTICS_EVENTS.TASBEEH_STARTED, {
        tasbeeh_name: tasbeehName,
        target_count: targetCount,
      })
    },
    [trackEvent],
  )

  const trackTasbeehCompleted = useCallback(
    (tasbeehName: string, actualCount: number, targetCount?: number) => {
      trackEvent(ANALYTICS_EVENTS.TASBEEH_COMPLETED, {
        tasbeeh_name: tasbeehName,
        actual_count: actualCount,
        target_count: targetCount,
      })
    },
    [trackEvent],
  )

  const trackPdfOpened = useCallback(
    (pdfName: string, source?: string) => {
      trackEvent(ANALYTICS_EVENTS.PDF_OPENED, { pdf_name: pdfName, source })
    },
    [trackEvent],
  )

  const trackAudioPlayed = useCallback(
    (audioName: string, duration?: number) => {
      trackEvent(ANALYTICS_EVENTS.AUDIO_PLAYED, { audio_name: audioName, duration })
    },
    [trackEvent],
  )

  const trackAudioPaused = useCallback(
    (audioName: string, position?: number) => {
      trackEvent(ANALYTICS_EVENTS.AUDIO_PAUSED, { audio_name: audioName, position })
    },
    [trackEvent],
  )

  const trackSearchPerformed = useCallback(
    (searchTerm: string, resultsCount?: number) => {
      trackEvent(ANALYTICS_EVENTS.SEARCH_PERFORMED, {
        search_term: searchTerm,
        results_count: resultsCount,
      })
    },
    [trackEvent],
  )

  const trackNavigationTabChanged = useCallback(
    (tabName: string) => {
      trackEvent(ANALYTICS_EVENTS.NAVIGATION_TAB_CHANGED, { tab_name: tabName })
    },
    [trackEvent],
  )

  const trackDrawerOpened = useCallback(() => {
    trackEvent(ANALYTICS_EVENTS.DRAWER_OPENED)
  }, [trackEvent])

  const trackDrawerClosed = useCallback(() => {
    trackEvent(ANALYTICS_EVENTS.DRAWER_CLOSED)
  }, [trackEvent])

  const trackLocationUpdated = useCallback(
    (latitude: number, longitude: number, city?: string) => {
      trackEvent(ANALYTICS_EVENTS.LOCATION_UPDATED, { latitude, longitude, city })
    },
    [trackEvent],
  )

  const trackLocationPermissionGranted = useCallback(() => {
    trackEvent(ANALYTICS_EVENTS.LOCATION_PERMISSION_GRANTED)
  }, [trackEvent])

  const trackLocationPermissionDenied = useCallback(() => {
    trackEvent(ANALYTICS_EVENTS.LOCATION_PERMISSION_DENIED)
  }, [trackEvent])

  const trackApiError = useCallback(
    (endpoint: string, errorCode?: number, errorMessage?: string) => {
      trackEvent(ANALYTICS_EVENTS.API_ERROR, {
        endpoint,
        error_code: errorCode,
        error_message: errorMessage,
      })
    },
    [trackEvent],
  )

  const trackNetworkError = useCallback(
    (endpoint: string, errorMessage?: string) => {
      trackEvent(ANALYTICS_EVENTS.NETWORK_ERROR, { endpoint, error_message: errorMessage })
    },
    [trackEvent],
  )

  return {
    // Core methods
    trackEvent,
    trackUserAction,
    trackError,
    trackPerformance,
    setUserId,
    trackScreenView: trackScreenViewCustom,

    // Predefined event trackers
    trackPrayerTimeViewed,
    trackQiblaOpened,
    trackCalendarOpened,
    trackReminderCreated,
    trackReminderDeleted,
    trackTasbeehStarted,
    trackTasbeehCompleted,
    trackPdfOpened,
    trackAudioPlayed,
    trackAudioPaused,
    trackSearchPerformed,
    trackNavigationTabChanged,
    trackDrawerOpened,
    trackDrawerClosed,
    trackLocationUpdated,
    trackLocationPermissionGranted,
    trackLocationPermissionDenied,
    trackApiError,
    trackNetworkError,

    // State
    getCurrentState: expoAnalyticsService.getCurrentState.bind(expoAnalyticsService),
  }
}

export default useAnalytics
