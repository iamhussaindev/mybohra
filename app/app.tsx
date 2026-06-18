/* eslint-disable import/first */
if (__DEV__) {
  require("./devtools/ReactotronConfig.ts")
}
import "./i18n"
import "./utils/ignoreWarnings"
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet"
import { useFonts } from "expo-font"
import * as Linking from "expo-linking"
import React, { useEffect } from "react"
import { ViewStyle } from "react-native"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import GetLocation from "react-native-get-location"
import { initialWindowMetrics, SafeAreaProvider } from "react-native-safe-area-context"
import Toast from "react-native-toast-message"

import { HomeLocationManager } from "./components/HomeLocationManager"
import Config from "./config"
import { LocationBottomSheetProvider } from "./contexts/LocationBottomSheetContext"
import { ThemeProvider } from "./contexts/ThemeContext"
import { SoundProvider } from "./hooks/useAudio"
import { useAuthInit } from "./hooks/useAuthInit"
import { useDeviceTracking } from "./hooks/useDeviceTracking"
import { useInitialRootStore, useStores } from "./models"
import { AppNavigator } from "./navigators/AppNavigator"
import { useNavigationPersistence } from "./navigators/navigationUtilities"
import { QueryProvider } from "./providers/QueryProvider"
import { ErrorBoundary } from "./screens/ErrorScreen/ErrorBoundary"
import { customFontsToLoad } from "./theme"
import { getManualTestCityName, getManualTestCoordinates } from "./utils/manualTestLocation"
import * as storage from "./utils/storage"
import { locationStorage } from "./utils/storage"

export const NAVIGATION_PERSISTENCE_KEY = "NAVIGATION_STATE"

// Deep links: mybohra://rsvp/:slug → RsvpRespond (see app.json expo.scheme)
const prefix = Linking.createURL("/")
const linkingPrefixes = [prefix, "mybohra://"]
const linkingScreens = {
  Tabs: {
    screens: {
      Home: "",
    },
  },
  RsvpRespond: "rsvp/:slug",
}

interface AppProps {
  hideSplashScreen: () => Promise<boolean>
}

/**
 * This is the root component of our app.
 * @param {AppProps} props - The props for the `App` component.
 * @returns {JSX.Element} The rendered `App` component.
 */
function App(props: AppProps) {
  const { hideSplashScreen } = props
  const {
    initialNavigationState,
    onNavigationStateChange,
    isRestored: isNavigationStateRestored,
  } = useNavigationPersistence(storage, NAVIGATION_PERSISTENCE_KEY)

  const [areFontsLoaded] = useFonts(customFontsToLoad)
  const { dataStore, miqaatStore, libraryStore, tasbeehStore } = useStores()

  // Track device on app launch and when app comes to foreground
  useDeviceTracking(true)
  useAuthInit()

  const { rehydrated } = useInitialRootStore(() => {
    // This runs after the root store has been initialized and rehydrated.

    // If your initialization scripts run very fast, it's good to show the splash screen for just a bit longer to prevent flicker.
    // Slightly delaying splash screen hiding for better UX; can be customized or removed as needed,
    // Note: (vanilla Android) The splash-screen will not appear if you launch your app via the terminal or Android Studio. Kill the app and launch it normally by tapping on the launcher icon. https://stackoverflow.com/a/69831106
    // Note: (vanilla iOS) You might notice the splash-screen logo change size. This happens in debug/development mode. Try building the app for release.
    fetchData()
  })

  const fetchData = async () => {
    const manualCoords = getManualTestCoordinates()
    if (manualCoords) {
      await locationStorage.saveLocation(
        String(manualCoords.latitude),
        String(manualCoords.longitude),
      )
      if (__DEV__) {
        const manualCity = getManualTestCityName()
        console.log("[Location] Using manual coordinates from env (GPS skipped)", {
          ...manualCoords,
          ...(manualCity ? { cityLabel: manualCity } : {}),
        })
      }
    }
    // Load saved location first, before fetching new location
    await dataStore.loadCurrentLocation()
    await fetchStorageLocation()
    await fetchMiqaats()
    await hideSplashScreen()
    await fetchHomeLibrary()
    await fetchTasbeeh()
    await loadPastSelectedLocations()
    await dataStore.loadReminderSettings()
  }

  useEffect(() => {
    if (getManualTestCoordinates()) return

    GetLocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 15000,
    })
      .then(async (location) => {
        locationStorage.saveLocation(location.latitude.toString(), location.longitude.toString())
      })
      .catch((error) => {
        if (__DEV__) {
          const { code, message } = error
          console.warn(code, message)
        }
      })
  }, [])

  // Smart location change detection is now handled in DataStore.fetchNearestLocation
  // No need for app state change monitoring

  const syncNearestLocation = async (latitude: number, longitude: number) => {
    // check if self.locations is loaded and has data
    await fetchLocations()
    await dataStore.fetchNearestLocation(latitude, longitude)
  }

  const fetchStorageLocation = async () => {
    locationStorage
      .fetchSavedLocations()
      .then((location) => {
        syncNearestLocation(location.latitude, location.longitude)
        return location
      })
      .catch((error) => {
        console.log("error", error)
      })
  }

  const fetchMiqaats = async () => {
    await miqaatStore.fetchMiqaats()
  }

  const fetchTasbeeh = async () => {
    await tasbeehStore.fetchTasbeeh()
  }

  const fetchHomeLibrary = async () => {
    await libraryStore.fetchHomeData()
  }

  const fetchLocations = async () => {
    await dataStore.fetchLocations()
  }

  const loadPastSelectedLocations = async () => {
    await dataStore.loadPastSelectedLocations()
  }

  if (!rehydrated || !isNavigationStateRestored || !areFontsLoaded) return null

  const linking = {
    prefixes: linkingPrefixes,
    config: { screens: linkingScreens },
  }

  // otherwise, we're ready to render the app
  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <QueryProvider>
        <ThemeProvider>
          <SoundProvider>
            <ErrorBoundary catchErrors={Config.catchErrors}>
              <GestureHandlerRootView style={$container}>
                <BottomSheetModalProvider>
                  <LocationBottomSheetProvider>
                    <AppNavigator
                      linking={linking}
                      initialState={initialNavigationState}
                      onStateChange={onNavigationStateChange}
                    />
                    <HomeLocationManager />
                    <Toast position="bottom" swipeable topOffset={200} />
                  </LocationBottomSheetProvider>
                </BottomSheetModalProvider>
              </GestureHandlerRootView>
            </ErrorBoundary>
          </SoundProvider>
        </ThemeProvider>
      </QueryProvider>
    </SafeAreaProvider>
  )
}

export default App

const $container: ViewStyle = {
  flex: 1,
}
