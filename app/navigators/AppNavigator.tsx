/**
 * The app navigator (formerly "AppNavigator" and "MainNavigator") is used for the primary
 * navigation flows of your app.
 * Generally speaking, it will contain an auth flow (registration, login, forgot password)
 * and a "main" flow which the user will use once logged in.
 */

import { DarkTheme, DefaultTheme, NavigationContainer } from "@react-navigation/native"
import { createNativeStackNavigator, NativeStackScreenProps } from "@react-navigation/native-stack"
import { useTheme } from "app/contexts/ThemeContext"
import HijriDate from "app/libs/HijriDate"
import * as Screens from "app/screens"
import { useColors } from "app/theme/useColors"
import { observer } from "mobx-react-lite"
import React from "react"

import Config from "../config"

import { NavigationTab } from "./NavigationTab"
import { navigationRef, useBackButtonHandler } from "./navigationUtilities"

/**
 * This type allows TypeScript to know what routes are defined in this navigator
 * as well as what properties (if any) they might take when navigating to them.
 *
 * If no params are allowed, pass through `undefined`. Generally speaking, we
 * recommend using your MobX-State-Tree store(s) to keep application state
 * rather than passing state through navigation params.
 *
 * For more information, see this documentation:
 *   https://reactnavigation.org/docs/params/
 *   https://reactnavigation.org/docs/typescript#type-checking-the-navigator
 *   https://reactnavigation.org/docs/typescript/#organizing-types
 */
export type AppStackParamList = {
  Calendar:
    | {
        highlight?: {
          year: number
          month: number
          day: number
        }
      }
    | undefined
  Namaz: undefined
  Tabs: undefined
  Home: undefined
  PdfViewer: {
    id: number
    name: string
    description: string | null
    audio_url: string | null
    pdf_url: string | null
    youtube_url: string | null
    metadata: any
    tags: string[] | null
    categories: string[] | null
  }
  Counter: undefined
  SavedTasbeeh: undefined
  EventReminder: { date: HijriDate }
  TasbeehList: undefined
  DuaList:
    | {
        album?: {
          id: string
          title: string
          description: string
          count: number
        }
      }
    | undefined
  DuaHome: undefined
  Reminder: undefined
  ReminderSettings: undefined
  CalendarSearch: undefined
  DuaListSearch: undefined
  DuaListSearchModal: undefined
  Settings: undefined
  Qibla: undefined
  Sautuliman: undefined
}

/**
 * This is a list of all the route names that will exit the app if the back button
 * is pressed while in that screen. Only affects Android.
 */
const exitRoutes = Config.exitRoutes

export type AppStackScreenProps<T extends keyof AppStackParamList> = NativeStackScreenProps<
  AppStackParamList,
  T
>

// Documentation: https://reactnavigation.org/docs/stack-navigator/
const Stack = createNativeStackNavigator<AppStackParamList>()

const AppStack = observer(function AppStack() {
  const colors = useColors()

  return (
    <Stack.Navigator
      initialRouteName="Tabs"
      screenOptions={{
        headerShown: false,
        navigationBarColor: colors.background,
      }}
    >
      <Stack.Screen name="Tabs" component={NavigationTab} />
      <Stack.Screen name="Namaz" component={Screens.NamazScreen} />
      <Stack.Screen name="Calendar" component={Screens.CalendarScreen} />
      <Stack.Screen name="CalendarSearch" component={Screens.CalendarSearch} />
      <Stack.Screen name="PdfViewer" component={Screens.PdfScreen} />
      <Stack.Screen name="Counter" component={Screens.CounterScreen} />
      <Stack.Screen name="SavedTasbeeh" component={Screens.SavedTasbeehScreen} />
      <Stack.Screen name="EventReminder" component={Screens.EventReminderScreen} />
      <Stack.Screen name="TasbeehList" component={Screens.TasbeehListScreen} />
      <Stack.Screen name="DuaHome" component={Screens.DuaLHomeScreen} />
      <Stack.Screen name="DuaList" component={Screens.DuaListScreen} />
      <Stack.Screen name="DuaListSearch" component={Screens.DuaListSearch} />
      <Stack.Screen
        name="DuaListSearchModal"
        component={Screens.DuaListSearch}
        options={{
          presentation: "modal",
        }}
      />
      <Stack.Screen name="Reminder" component={Screens.ReminderScreen} />
      <Stack.Screen name="ReminderSettings" component={Screens.ReminderSettingsScreen} />
      <Stack.Screen name="Settings" component={Screens.SettingsScreen} />
      <Stack.Screen name="Qibla" component={Screens.QiblaScreen} />
      <Stack.Screen name="Sautuliman" component={Screens.SautulimanScreen} />
    </Stack.Navigator>
  )
})

export interface NavigationProps
  extends Partial<React.ComponentProps<typeof NavigationContainer>> {}

export const AppNavigator = observer(function AppNavigator(props: NavigationProps) {
  const { isDark } = useTheme()

  useBackButtonHandler((routeName) => exitRoutes.includes(routeName))

  return (
    <NavigationContainer ref={navigationRef} theme={isDark ? DarkTheme : DefaultTheme} {...props}>
      <AppStack />
    </NavigationContainer>
  )
})
