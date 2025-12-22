import { BottomTabScreenProps, createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { CompositeScreenProps } from "@react-navigation/native"
import {
  IconGlobe,
  IconGlobeFilled,
  IconHome,
  IconHomeFilled,
  IconSearch,
  IconShoppingCart,
  IconShoppingCartFilled,
  IconUser,
  IconUserFilled,
} from "@tabler/icons-react-native"
import { Text } from "app/components"
import { AccountScreen } from "app/screens/Account/AccountScreen"
import { MarketScreen } from "app/screens/Market/MarketScreen"
import { SearchScreen } from "app/screens/Search/SearchScreen"
import React from "react"
import { TextStyle, ViewStyle } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import { HomeScreen } from "../screens"
import { spacing, typography } from "../theme"
import { useColors } from "../theme/useColors"

import { AppStackParamList, AppStackScreenProps } from "./AppNavigator"

export type TabParamList = {
  Home: undefined
  Search: undefined
  Market: undefined
  Account: undefined
  Explore: undefined
}

/**
 * Helper for automatically generating navigation prop types for each route.
 *
 * More info: https://reactnavigation.org/docs/typescript/#organizing-types
 */
export type TabScreenProps<T extends keyof TabParamList> = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, T>,
  AppStackScreenProps<keyof AppStackParamList>
>

const Tab = createBottomTabNavigator<TabParamList>()

/**
 * This is the main navigator for the  screens with a bottom tab bar.
 * Each tab is a stack navigator with its own set of screens.
 *
 * More info: https://reactnavigation.org/docs/bottom-tab-navigator/
 * @returns {JSX.Element} The rendered `Navigator`.
 */
export function NavigationTab() {
  const { bottom } = useSafeAreaInsets()
  const colors = useColors()

  const idleColor = colors.palette.neutral400

  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarStyle: [
          $tabBar,
          {
            height: bottom + 70,
            backgroundColor: colors.background,
            borderTopColor: colors.border,
          },
        ],
        tabBarActiveTintColor: colors.text,
        tabBarInactiveTintColor: colors.text,
        tabBarLabelStyle: $tabBarLabel,
        tabBarItemStyle: $tabBarItem,
        lazy: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen as any}
        options={{
          tabBarLabel: ({ focused }) => (
            <Text style={[$tabBarLabel, { color: focused ? colors.tint : idleColor }]}>Home</Text>
          ),
          tabBarIcon: ({ focused }) =>
            focused ? (
              <IconHomeFilled color={colors.tint} size={36} />
            ) : (
              <IconHome color={colors.textDim} size={36} />
            ),
        }}
      />

      <Tab.Screen
        name="Search"
        component={SearchScreen}
        options={{
          tabBarLabel: ({ focused }) => (
            <Text style={[$tabBarLabel, { color: focused ? colors.tint : idleColor }]}>Search</Text>
          ),
          tabBarIcon: ({ focused }) =>
            focused ? (
              <IconSearch color={colors.tint} size={36} />
            ) : (
              <IconSearch color={colors.textDim} size={36} />
            ),
        }}
      />

      <Tab.Screen
        name="Explore"
        component={MarketScreen}
        options={{
          tabBarLabel: ({ focused }) => (
            <Text style={[$tabBarLabel, { color: focused ? colors.tint : idleColor }]}>
              Explore
            </Text>
          ),
          tabBarIcon: ({ focused }) =>
            focused ? (
              <IconGlobeFilled color={colors.tint} size={36} />
            ) : (
              <IconGlobe color={colors.textDim} size={36} />
            ),
        }}
      />

      <Tab.Screen
        name="Market"
        component={MarketScreen}
        options={{
          tabBarAccessibilityLabel: "Market",
          tabBarLabel: ({ focused }) => (
            <Text style={[$tabBarLabel, { color: focused ? colors.tint : idleColor }]}>Market</Text>
          ),
          tabBarIcon: ({ focused }) =>
            focused ? (
              <IconShoppingCartFilled color={colors.tint} size={36} />
            ) : (
              <IconShoppingCart color={colors.textDim} size={36} />
            ),
        }}
      />

      <Tab.Screen
        name="Account"
        component={AccountScreen}
        options={{
          tabBarLabel: ({ focused }) => (
            <Text style={[$tabBarLabel, { color: focused ? colors.tint : idleColor }]}>
              Account
            </Text>
          ),

          tabBarIcon: ({ focused }) =>
            focused ? (
              <IconUserFilled color={colors.tint} size={36} />
            ) : (
              <IconUser color={colors.textDim} size={36} />
            ),
        }}
      />
    </Tab.Navigator>
  )
}

const $tabBar: ViewStyle = {
  shadowColor: "#000",
  shadowOffset: { width: 10, height: 0 },
  shadowOpacity: 0.1,
}

const $tabBarItem: ViewStyle = {
  paddingTop: spacing.md,
}

const $tabBarLabel: TextStyle = {
  fontSize: 10,
  fontFamily: typography.primary.medium,
  lineHeight: 20,
}
