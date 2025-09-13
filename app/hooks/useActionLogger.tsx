import { useEffect, useCallback, useRef } from "react"
import { AppState, AppStateStatus } from "react-native"

import { actionLoggerService } from "../services/analytics/action-logger.service"

interface UseActionLoggerOptions {
  autoInitialize?: boolean
  trackScreenViews?: boolean
  trackUserInteractions?: boolean
  trackPerformance?: boolean
}

interface ActionLoggerHook {
  // Core methods
  logAction: (action: string, category: string, parameters?: Record<string, any>) => Promise<void>
  setUserId: (userId: string) => Promise<void>
  clearUserId: () => Promise<void>

  // Utility methods
  getPendingCount: () => Promise<number>
  getUploadedCount: () => Promise<number>
  exportActions: (limit?: number) => Promise<any[]>
  clearAllActions: () => Promise<void>

  // Predefined action loggers
  logScreenView: (screenName: string, parameters?: Record<string, any>) => Promise<void>
  logUserInteraction: (
    interaction: string,
    element: string,
    parameters?: Record<string, any>,
  ) => Promise<void>
  logButtonClick: (
    buttonName: string,
    screen: string,
    parameters?: Record<string, any>,
  ) => Promise<void>
  logFeatureUsage: (feature: string, parameters?: Record<string, any>) => Promise<void>
  logError: (error: string, context: string, parameters?: Record<string, any>) => Promise<void>
  logPerformance: (
    metric: string,
    value: number,
    unit: string,
    parameters?: Record<string, any>,
  ) => Promise<void>
  logNavigation: (
    from: string,
    to: string,
    method: string,
    parameters?: Record<string, any>,
  ) => Promise<void>
  logSearch: (query: string, results: number, parameters?: Record<string, any>) => Promise<void>
  logContentInteraction: (
    contentId: string,
    contentType: string,
    action: string,
    parameters?: Record<string, any>,
  ) => Promise<void>
}

export function useActionLogger(options: UseActionLoggerOptions = {}): ActionLoggerHook {
  const {
    autoInitialize = true,
    trackScreenViews = true,
    trackUserInteractions = true,
    trackPerformance = false,
  } = options

  const isInitialized = useRef(false)
  const currentScreen = useRef<string | null>(null)
  const appState = useRef(AppState.currentState)

  // Initialize action logger
  useEffect(() => {
    if (autoInitialize && !isInitialized.current) {
      actionLoggerService.initialize().then(() => {
        isInitialized.current = true
        console.log("Action Logger hook initialized")
      })
    }
  }, [autoInitialize])

  // Track app state changes
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      const previousAppState = appState.current
      appState.current = nextAppState

      if (previousAppState === "background" && nextAppState === "active") {
        // App came to foreground
        actionLoggerService.logAction("app_foreground", "app_lifecycle", {
          previous_state: previousAppState,
          current_state: nextAppState,
        })
      } else if (previousAppState === "active" && nextAppState === "background") {
        // App went to background
        actionLoggerService.logAction("app_background", "app_lifecycle", {
          previous_state: previousAppState,
          current_state: nextAppState,
        })
      }
    }

    const subscription = AppState.addEventListener("change", handleAppStateChange)
    return () => subscription?.remove()
  }, [])

  // Core logging method
  const logAction = useCallback(
    async (action: string, category: string, parameters?: Record<string, any>) => {
      await actionLoggerService.logAction(action, category, parameters)
    },
    [],
  )

  // User management
  const setUserId = useCallback(async (userId: string) => {
    await actionLoggerService.setUserId(userId)
  }, [])

  const clearUserId = useCallback(async () => {
    await actionLoggerService.clearUserId()
  }, [])

  // Utility methods
  const getPendingCount = useCallback(async () => {
    return await actionLoggerService.getPendingActionsCount()
  }, [])

  const getUploadedCount = useCallback(async () => {
    return await actionLoggerService.getUploadedActionsCount()
  }, [])

  const exportActions = useCallback(async (limit = 100) => {
    return await actionLoggerService.exportActions(limit)
  }, [])

  const clearAllActions = useCallback(async () => {
    await actionLoggerService.clearAllActions()
  }, [])

  // Predefined action loggers
  const logScreenView = useCallback(
    async (screenName: string, parameters?: Record<string, any>) => {
      if (!trackScreenViews) return

      const previousScreen = currentScreen.current
      currentScreen.current = screenName

      await actionLoggerService.logAction("screen_view", "navigation", {
        screen_name: screenName,
        previous_screen: previousScreen,
        ...parameters,
      })
    },
    [trackScreenViews],
  )

  const logUserInteraction = useCallback(
    async (interaction: string, element: string, parameters?: Record<string, any>) => {
      if (!trackUserInteractions) return

      await actionLoggerService.logAction("user_interaction", "engagement", {
        interaction_type: interaction,
        element,
        screen: currentScreen.current,
        ...parameters,
      })
    },
    [trackUserInteractions],
  )

  const logButtonClick = useCallback(
    async (buttonName: string, screen: string, parameters?: Record<string, any>) => {
      await actionLoggerService.logAction("button_click", "engagement", {
        button_name: buttonName,
        screen,
        ...parameters,
      })
    },
    [],
  )

  const logFeatureUsage = useCallback(async (feature: string, parameters?: Record<string, any>) => {
    await actionLoggerService.logAction("feature_usage", "engagement", {
      feature_name: feature,
      screen: currentScreen.current,
      ...parameters,
    })
  }, [])

  const logError = useCallback(
    async (error: string, context: string, parameters?: Record<string, any>) => {
      await actionLoggerService.logAction("error_occurred", "error", {
        error_message: error,
        context,
        screen: currentScreen.current,
        ...parameters,
      })
    },
    [],
  )

  const logPerformance = useCallback(
    async (metric: string, value: number, unit: string, parameters?: Record<string, any>) => {
      if (!trackPerformance) return

      await actionLoggerService.logAction("performance_metric", "performance", {
        metric_name: metric,
        value,
        unit,
        screen: currentScreen.current,
        ...parameters,
      })
    },
    [trackPerformance],
  )

  const logNavigation = useCallback(
    async (from: string, to: string, method: string, parameters?: Record<string, any>) => {
      await actionLoggerService.logAction("navigation", "navigation", {
        from_screen: from,
        to_screen: to,
        navigation_method: method,
        ...parameters,
      })
    },
    [],
  )

  const logSearch = useCallback(
    async (query: string, results: number, parameters?: Record<string, any>) => {
      await actionLoggerService.logAction("search_performed", "engagement", {
        search_query: query,
        results_count: results,
        screen: currentScreen.current,
        ...parameters,
      })
    },
    [],
  )

  const logContentInteraction = useCallback(
    async (
      contentId: string,
      contentType: string,
      action: string,
      parameters?: Record<string, any>,
    ) => {
      await actionLoggerService.logAction("content_interaction", "engagement", {
        content_id: contentId,
        content_type: contentType,
        interaction_action: action,
        screen: currentScreen.current,
        ...parameters,
      })
    },
    [],
  )

  return {
    // Core methods
    logAction,
    setUserId,
    clearUserId,

    // Utility methods
    getPendingCount,
    getUploadedCount,
    exportActions,
    clearAllActions,

    // Predefined action loggers
    logScreenView,
    logUserInteraction,
    logButtonClick,
    logFeatureUsage,
    logError,
    logPerformance,
    logNavigation,
    logSearch,
    logContentInteraction,
  }
}
