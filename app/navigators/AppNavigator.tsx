/**
 * The app navigator (formerly "AppNavigator" and "MainNavigator") is used for the primary
 * navigation flows of your app.
 * Generally speaking, it will contain an auth flow (registration, login, forgot password)
 * and a "main" flow which the user will use once logged in.
 */

import { DarkTheme, DefaultTheme, NavigationContainer } from "@react-navigation/native"
import { createNativeStackNavigator, NativeStackScreenProps } from "@react-navigation/native-stack"
import HijriDate from "app/libs/HijriDate"
import * as Screens from "app/screens"
import { colors } from "app/theme"
import { observer } from "mobx-react-lite"
import React from "react"
import { useColorScheme } from "react-native"

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
  Calendar: undefined
  Namaz: undefined
  Tabs: undefined
  Home: undefined
  PdfViewer: undefined
  Counter: undefined
  SavedTasbeeh: undefined
  EventReminder: { date: HijriDate }
  TasbeehList: undefined
  Reminder: undefined
  ReminderSettings: undefined
  // 🔥 Your screens go here
  // IGNITE_GENERATOR_ANCHOR_APP_STACK_PARAM_LIST
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
      <Stack.Screen name="PdfViewer" component={Screens.PdfScreen} />
      <Stack.Screen name="Counter" component={Screens.CounterScreen} />
      <Stack.Screen name="SavedTasbeeh" component={Screens.SavedTasbeehScreen} />
      <Stack.Screen name="EventReminder" component={Screens.EventReminderScreen} />
      <Stack.Screen name="TasbeehList" component={Screens.TasbeehListScreen} />
      <Stack.Screen name="Reminder" component={Screens.ReminderScreen} />
      <Stack.Screen name="ReminderSettings" component={Screens.ReminderSettingsScreen} />
    </Stack.Navigator>
  )
})

export interface NavigationProps
  extends Partial<React.ComponentProps<typeof NavigationContainer>> {}

export const AppNavigator = observer(function AppNavigator(props: NavigationProps) {
  const colorScheme = useColorScheme()

  useBackButtonHandler((routeName) => exitRoutes.includes(routeName))

  return (
    <NavigationContainer
      ref={navigationRef}
      theme={colorScheme === "dark" ? DarkTheme : DefaultTheme}
      {...props}
    >
      <AppStack />
    </NavigationContainer>
  )
})
