import * as storage from "app/utils/storage"
import React, { createContext, useContext, useEffect, useState, ReactNode } from "react"
import { Appearance, ColorSchemeName } from "react-native"

export type ThemeMode = "light" | "dark" | "system"

interface ThemeContextType {
  themeMode: ThemeMode
  isDark: boolean
  setThemeMode: (mode: ThemeMode) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

const THEME_MODE_KEY = "theme_mode"

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [systemColorScheme, setSystemColorScheme] = useState<ColorSchemeName>(
    Appearance.getColorScheme(),
  )
  const [themeMode, setThemeModeState] = useState<ThemeMode>("system")

  // Listen to system appearance changes
  useEffect(() => {
    // Get initial value
    const initialScheme = Appearance.getColorScheme()
    setSystemColorScheme(initialScheme)
    console.log("Initial system color scheme:", initialScheme)

    // Listen for changes
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      console.log("System color scheme changed to:", colorScheme)
      setSystemColorScheme(colorScheme)
    })

    return () => {
      subscription.remove()
    }
  }, [])

  // Load saved theme mode on mount
  useEffect(() => {
    const loadThemeMode = async () => {
      const saved = await storage.load(THEME_MODE_KEY)
      if (saved && (saved === "light" || saved === "dark" || saved === "system")) {
        setThemeModeState(saved)
      }
    }
    loadThemeMode()
  }, [])

  const setThemeMode = async (mode: ThemeMode) => {
    setThemeModeState(mode)
    await storage.save(THEME_MODE_KEY, mode)
  }

  // Determine if dark mode should be active
  // This will update when systemColorScheme changes
  const isDark = themeMode === "dark" || (themeMode === "system" && systemColorScheme === "dark")

  // Debug logging
  useEffect(() => {
    console.log("Theme state:", {
      themeMode,
      systemColorScheme,
      isDark,
    })
  }, [themeMode, systemColorScheme, isDark])

  return (
    <ThemeContext.Provider value={{ themeMode, isDark, setThemeMode }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider")
  }
  return context
}
