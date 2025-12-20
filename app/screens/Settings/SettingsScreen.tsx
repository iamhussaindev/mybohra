import { useNavigation } from "@react-navigation/native"
import { Icon, Screen, Switch, Text } from "app/components"
import { useTheme } from "app/contexts/ThemeContext"
import { useStores } from "app/models"
import { AppStackScreenProps } from "app/navigators"
import { spacing } from "app/theme"
import { useColors } from "app/theme/useColors"
import i18n from "i18n-js"
import { observer } from "mobx-react-lite"
import React, { useState, useEffect } from "react"
import {
  Alert,
  FlatList,
  Image,
  ImageStyle,
  Pressable,
  TextStyle,
  View,
  ViewStyle,
} from "react-native"

export const SettingsScreen = observer(function SettingsScreen(
  _props: AppStackScreenProps<"Settings">,
) {
  const colors = useColors()
  const { themeMode, setThemeMode } = useTheme()
  const { dataStore } = useStores()
  const navigation = useNavigation()
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [locationEnabled, setLocationEnabled] = useState(true)
  const [currentLanguage, setCurrentLanguage] = useState(i18n.locale || "en")
  const [cachedPdfs, setCachedPdfs] = useState<Array<{ id: number; name: string; size: number }>>(
    [],
  )
  const [cachedSize, setCachedSize] = useState(0)

  const languages = [
    { code: "en", name: "English" },
    { code: "ar", name: "العربية" },
    { code: "fr", name: "Français" },
    { code: "ko", name: "한국어" },
  ]

  // Load cached PDFs
  useEffect(() => {
    loadCachedPdfs()
  }, [])

  const loadCachedPdfs = async () => {
    try {
      // Try to use expo-file-system if available
      let FileSystem: any = null
      try {
        FileSystem = require("expo-file-system")
      } catch {
        // FileSystem not available, return empty
        setCachedPdfs([])
        setCachedSize(0)
        return
      }

      const cacheDir = FileSystem.cacheDirectory + "pdfs/"
      const dirInfo = await FileSystem.getInfoAsync(cacheDir)

      if (dirInfo.exists) {
        const files = await FileSystem.readDirectoryAsync(cacheDir)
        const pdfFiles = files.filter((f: string) => f.endsWith(".pdf"))

        const pdfInfo = await Promise.all(
          pdfFiles.map(async (file: string) => {
            const fileInfo = await FileSystem.getInfoAsync(cacheDir + file)
            const size = fileInfo.exists && "size" in fileInfo ? fileInfo.size : 0
            const id = parseInt(file.replace(".pdf", ""), 10)
            // Try to get name from bookmarked PDFs
            const pdf = dataStore.pinnedPdfs.find((p) => p.id === id)
            return {
              id,
              name: pdf?.name || `PDF ${id}`,
              size,
            }
          }),
        )

        setCachedPdfs(pdfInfo)
        const totalSize = pdfInfo.reduce((sum: number, f: any) => sum + f.size, 0)
        setCachedSize(totalSize)
      }
    } catch (error) {
      console.error("Error loading cached PDFs:", error)
      setCachedPdfs([])
      setCachedSize(0)
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 B"
    const k = 1024
    const sizes = ["B", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i]
  }

  const handleThemeChange = (mode: "light" | "dark" | "system") => {
    setThemeMode(mode)
  }

  const handleLanguageChange = (langCode: string) => {
    i18n.locale = langCode
    setCurrentLanguage(langCode)
    // Save language preference
    // You may want to add this to storage
  }

  const handleClearCache = async () => {
    Alert.alert("Clear Cache", "Are you sure you want to clear all cached PDFs?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Clear",
        style: "destructive",
        onPress: async () => {
          try {
            let FileSystem: any = null
            try {
              FileSystem = require("expo-file-system")
            } catch {
              Alert.alert("Error", "File system not available")
              return
            }

            const cacheDir = FileSystem.cacheDirectory + "pdfs/"
            await FileSystem.deleteAsync(cacheDir, { idempotent: true })
            setCachedPdfs([])
            setCachedSize(0)
            Alert.alert("Success", "Cache cleared successfully")
          } catch (error) {
            Alert.alert("Error", "Failed to clear cache")
          }
        },
      },
    ])
  }

  const handleRemovePdf = async (pdfId: number) => {
    try {
      let FileSystem: any = null
      try {
        FileSystem = require("expo-file-system")
      } catch {
        return
      }

      const cacheDir = FileSystem.cacheDirectory + "pdfs/"
      const filePath = cacheDir + `${pdfId}.pdf`
      const fileInfo = await FileSystem.getInfoAsync(filePath)

      if (fileInfo.exists) {
        await FileSystem.deleteAsync(filePath, { idempotent: true })
        await loadCachedPdfs()
      }
    } catch (error) {
      console.error("Error removing PDF:", error)
    }
  }

  const handleViewBookmarks = () => {
    // @ts-ignore - navigation type may vary
    navigation.navigate("DuaHome", { initialTab: "Bookmarks" })
  }

  return (
    <Screen
      style={[$screen, { backgroundColor: colors.background }]}
      preset="scroll"
      contentContainerStyle={$scrollContent}
      ScrollViewProps={{ showsVerticalScrollIndicator: false }}
      safeAreaEdges={["top"]}
    >
      {/* Profile Section */}
      <View style={[$section, { backgroundColor: colors.background, paddingTop: spacing.lg }]}>
        <View style={$profileHeader}>
          <View style={[$avatar, { backgroundColor: colors.palette.primary500 }]}>
            <Icon icon="user" size={40} color={colors.white} />
          </View>
          <Text text="Profile" style={$profileTitle} weight="bold" />
        </View>
      </View>

      {/* Section 1: App Settings */}
      <View style={[$section, { backgroundColor: colors.background }]}>
        <Text text="App Settings" style={[$sectionTitle, { color: colors.text }]} weight="bold" />

        {/* Light/Dark Mode */}
        <View style={$settingItem}>
          <View style={$settingLeft}>
            <Icon icon="settings" size={24} color={colors.tint} />
            <View style={$settingTextContainer}>
              <Text text="Theme" style={[$settingLabel, { color: colors.text }]} weight="medium" />
              <Text
                text={themeMode === "light" ? "Light" : themeMode === "dark" ? "Dark" : "System"}
                style={[$settingSubtext, { color: colors.textDim }]}
              />
            </View>
          </View>
          <Pressable
            style={$themeSelector}
            onPress={() => {
              const modes: Array<"light" | "dark" | "system"> = ["light", "dark", "system"]
              const currentIndex = modes.indexOf(themeMode)
              const nextIndex = (currentIndex + 1) % modes.length
              handleThemeChange(modes[nextIndex])
            }}
          >
            <Text
              text={themeMode === "light" ? "☀️" : themeMode === "dark" ? "🌙" : "⚙️"}
              style={$themeIcon}
            />
          </Pressable>
        </View>

        {/* Language Toggle */}
        <View style={$settingItem}>
          <View style={$settingLeft}>
            <Icon icon="settings" size={24} color={colors.tint} />
            <View style={$settingTextContainer}>
              <Text
                text="Language"
                style={[$settingLabel, { color: colors.text }]}
                weight="medium"
              />
              <Text
                text={languages.find((l) => l.code === currentLanguage)?.name || "English"}
                style={[$settingSubtext, { color: colors.textDim }]}
              />
            </View>
          </View>
          <Pressable
            style={$languageSelector}
            onPress={() => {
              const currentIndex = languages.findIndex((l) => l.code === currentLanguage)
              const nextIndex = (currentIndex + 1) % languages.length
              handleLanguageChange(languages[nextIndex].code)
            }}
          >
            <Text text="→" style={$selectorArrow} />
          </Pressable>
        </View>

        {/* Notifications */}
        <View style={$settingItem}>
          <View style={$settingLeft}>
            <Icon icon="bell" size={24} color={colors.tint} />
            <View style={$settingTextContainer}>
              <Text
                text="Notifications"
                style={[$settingLabel, { color: colors.text }]}
                weight="medium"
              />
              <Text
                text="Enable prayer time reminders"
                style={[$settingSubtext, { color: colors.textDim }]}
              />
            </View>
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{ false: colors.switchBackground, true: colors.switchGreen }}
          />
        </View>

        {/* Location */}
        <View style={$settingItem}>
          <View style={$settingLeft}>
            <Icon icon="location" size={24} color={colors.tint} />
            <View style={$settingTextContainer}>
              <Text
                text="Location"
                style={[$settingLabel, { color: colors.text }]}
                weight="medium"
              />
              <Text
                text="Use device location for prayer times"
                style={[$settingSubtext, { color: colors.textDim }]}
              />
            </View>
          </View>
          <Switch
            value={locationEnabled}
            onValueChange={setLocationEnabled}
            trackColor={{ false: colors.switchBackground, true: colors.switchGreen }}
          />
        </View>
      </View>

      {/* Bookmarked PDFs */}
      <View style={[$section, { backgroundColor: colors.background }]}>
        <Pressable style={$bookmarkHeader} onPress={handleViewBookmarks}>
          <View style={$settingLeft}>
            <Icon icon="bookmark" size={24} color={colors.tint} />
            <View style={$settingTextContainer}>
              <Text
                text="Bookmarked PDFs"
                style={[$settingLabel, { color: colors.text }]}
                weight="medium"
              />
              <Text
                text={`${dataStore.pinnedPdfs.length} bookmarked`}
                style={[$settingSubtext, { color: colors.textDim }]}
              />
            </View>
          </View>
          <Icon icon="arrowRight" size={20} color={colors.textDim} />
        </Pressable>
      </View>

      {/* Storage Section */}
      <View style={[$section, { backgroundColor: colors.background }]}>
        <Text text="Storage" style={[$sectionTitle, { color: colors.text }]} weight="bold" />

        {/* Cached PDFs */}
        <View style={$storageItem}>
          <View style={$settingLeft}>
            <Icon icon="bookmark" size={24} color={colors.tint} />
            <View style={$settingTextContainer}>
              <Text
                text="Downloaded PDFs"
                style={[$settingLabel, { color: colors.text }]}
                weight="medium"
              />
              <Text
                text={`${cachedPdfs.length} files • ${formatFileSize(cachedSize)}`}
                style={[$settingSubtext, { color: colors.textDim }]}
              />
            </View>
          </View>
          {cachedPdfs.length > 0 && (
            <Pressable onPress={handleClearCache} style={$clearButton}>
              <Text text="Clear" style={[$clearButtonText, { color: colors.error }]} />
            </Pressable>
          )}
        </View>

        {/* Cached PDFs List */}
        {cachedPdfs.length > 0 && (
          <View style={$cachedListContainer}>
            <FlatList
              data={cachedPdfs}
              keyExtractor={(item) => item.id.toString()}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <View style={[$cachedItem, { borderBottomColor: colors.border }]}>
                  <View style={$cachedItemLeft}>
                    <Image
                      source={require("../../../assets/images/pdf.png")}
                      style={$pdfIcon}
                      resizeMode="contain"
                    />
                    <View style={$cachedItemText}>
                      <Text
                        text={item.name}
                        style={[$cachedItemName, { color: colors.text }]}
                        numberOfLines={1}
                      />
                      <Text
                        text={formatFileSize(item.size)}
                        style={[$cachedItemSize, { color: colors.textDim }]}
                      />
                    </View>
                  </View>
                  <Pressable onPress={() => handleRemovePdf(item.id)} style={$removeButton}>
                    <Icon icon="x" size={18} color={colors.error} />
                  </Pressable>
                </View>
              )}
            />
          </View>
        )}
      </View>
    </Screen>
  )
})

const $screen: ViewStyle = {
  flex: 1,
}

const $scrollContent: ViewStyle = {
  paddingBottom: spacing.xxl,
}

const $section: ViewStyle = {
  paddingHorizontal: spacing.lg,
  paddingVertical: spacing.md,
  marginBottom: spacing.xs,
}

const $profileHeader: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  paddingVertical: spacing.md,
}

const $avatar: ViewStyle = {
  width: 60,
  height: 60,
  borderRadius: 30,
  justifyContent: "center",
  alignItems: "center",
  marginRight: spacing.md,
}

const $profileTitle: TextStyle = {
  fontSize: 24,
}

const $sectionTitle: TextStyle = {
  fontSize: 18,
  marginBottom: spacing.md,
}

const $settingItem: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  paddingVertical: spacing.md,
  borderBottomWidth: 1,
  borderBottomColor: "transparent",
}

const $settingLeft: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  flex: 1,
}

const $settingTextContainer: ViewStyle = {
  marginLeft: spacing.md,
  flex: 1,
}

const $settingLabel: TextStyle = {
  fontSize: 16,
}

const $settingSubtext: TextStyle = {
  fontSize: 12,
  marginTop: spacing.xxxs,
}

const $themeSelector: ViewStyle = {
  padding: spacing.xs,
}

const $themeIcon: TextStyle = {
  fontSize: 24,
}

const $languageSelector: ViewStyle = {
  padding: spacing.xs,
}

const $selectorArrow: TextStyle = {
  fontSize: 20,
}

const $bookmarkHeader: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  paddingVertical: spacing.md,
}

const $storageItem: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  paddingVertical: spacing.md,
}

const $clearButton: ViewStyle = {
  paddingHorizontal: spacing.sm,
  paddingVertical: spacing.xxs,
}

const $clearButtonText: TextStyle = {
  fontSize: 14,
  fontWeight: "600",
}

const $cachedListContainer: ViewStyle = {
  marginTop: spacing.sm,
  borderRadius: 8,
  overflow: "hidden",
}

const $cachedItem: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  paddingVertical: spacing.sm,
  paddingHorizontal: spacing.md,
  borderBottomWidth: 1,
}

const $cachedItemLeft: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  flex: 1,
}

const $pdfIcon: ImageStyle = {
  width: 24,
  height: 24,
  marginRight: spacing.sm,
}

const $cachedItemText: ViewStyle = {
  flex: 1,
}

const $cachedItemName: TextStyle = {
  fontSize: 14,
}

const $cachedItemSize: TextStyle = {
  fontSize: 12,
  marginTop: spacing.xxxs,
}

const $removeButton: ViewStyle = {
  padding: spacing.xs,
}
