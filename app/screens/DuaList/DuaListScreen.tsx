import { useFocusEffect } from "@react-navigation/native"
import { Icon, PDFOptionsBottomSheet, Screen } from "app/components"
import Header from "app/components/Header"
import { useSoundPlayer } from "app/hooks/useAudio"
import { ILibrary, useStores } from "app/models"
import { AppStackScreenProps } from "app/navigators"
import { colors } from "app/theme"
import { observer } from "mobx-react-lite"
import React, { FC, useCallback, useRef, useState, useEffect } from "react"
import {
  View,
  ViewStyle,
  Pressable,
  TextInput,
  Keyboard,
  Animated,
  SectionList,
  Alert,
} from "react-native"
import ReactNativeHapticFeedback from "react-native-haptic-feedback"

import DailyDuas from "../components/DuaGridList"
import SoundPlayerHome from "../Home/components/SoundPlayerHome"

interface DuaListScreenProps extends AppStackScreenProps<"DuaList"> {}

export const DuaListScreen: FC<DuaListScreenProps> = observer(function DuaListScreen(props) {
  const { libraryStore, dataStore } = useStores()
  const { currentSound } = useSoundPlayer()
  const [search, setSearch] = useState("")
  const [showSearch, setShowSearch] = useState(false)
  const $searchRef = useRef<TextInput>(null)
  const [selectedItem, setSelectedItem] = useState<ILibrary | null>(null)

  // Animated values
  const searchOpacity = useRef(new Animated.Value(0)).current
  const searchTranslateY = useRef(new Animated.Value(-20)).current
  const searchScale = useRef(new Animated.Value(0.95)).current
  const iconScale = useRef(new Animated.Value(1)).current

  // Fetch library data on component mount
  useEffect(() => {
    libraryStore.fetchList()
  }, [])

  const animateSearchIn = useCallback(() => {
    Animated.parallel([
      Animated.timing(searchOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(searchTranslateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(searchScale, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start()
  }, [searchOpacity, searchTranslateY, searchScale])

  const animateSearchOut = useCallback(() => {
    Animated.parallel([
      Animated.timing(searchOpacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(searchTranslateY, {
        toValue: -20,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(searchScale, {
        toValue: 0.95,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowSearch(false)
    })
  }, [searchOpacity, searchTranslateY, searchScale])

  const closeSearch = useCallback(() => {
    animateSearchOut()
    setSearch("")
    Keyboard.dismiss()
  }, [animateSearchOut])

  const animateIconPress = useCallback(() => {
    Animated.sequence([
      Animated.timing(iconScale, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(iconScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start()
  }, [iconScale])

  const toggleSearch = useCallback(() => {
    animateIconPress()

    if (!showSearch) {
      setShowSearch(true)
      // Start animation and focus after a brief delay
      setTimeout(() => {
        animateSearchIn()
        setTimeout(() => {
          $searchRef.current?.focus()
        }, 150)
      }, 50)
    } else {
      // Clear search when hiding
      closeSearch()
    }
  }, [showSearch, closeSearch, animateSearchIn, animateIconPress])

  // Close search when screen loses focus (back button, navigation)
  useFocusEffect(
    useCallback(() => {
      return () => {
        // Cleanup when screen loses focus
        closeSearch()
      }
    }, [closeSearch]),
  )

  // Close search when keyboard is dismissed
  useEffect(() => {
    const keyboardDidHideListener = Keyboard.addListener("keyboardDidHide", () => {
      if (showSearch && search.length === 0) {
        closeSearch()
      }
    })

    return () => {
      keyboardDidHideListener?.remove()
    }
  }, [showSearch, search, closeSearch])

  const handleCloseBottomSheet = useCallback(() => {
    console.log("Closing bottom sheet")
    setSelectedItem(null)
    $bottomSheetRef.current?.close()
  }, [])

  const handlePinToHomeScreen = useCallback(
    (item: ILibrary) => {
      ReactNativeHapticFeedback.trigger("impactLight", {
        enableVibrateFallback: true,
        ignoreAndroidSystemSettings: false,
      })

      if (dataStore.isPdfPinned(item.id)) {
        dataStore.unpinPdf(item.id)
        Alert.alert("Unpinned", `"${item.name}" has been unpinned from your home screen.`, [
          { text: "OK" },
        ])
      } else {
        dataStore.pinPdf(item.id)
        Alert.alert("Pinned", `"${item.name}" has been pinned to your home screen.`, [
          { text: "OK" },
        ])
      }
    },
    [dataStore],
  )

  const handleOpenPDF = useCallback(
    (item: ILibrary) => {
      props.navigation.navigate("PdfViewer", { ...item })
    },
    [props.navigation],
  )

  const handleReportPDF = useCallback((item: ILibrary) => {
    Alert.alert("Report PDF", `Report issues with "${item.name}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Report",
        style: "destructive",
        onPress: () => {
          // TODO: Implement report functionality
          Alert.alert("Thank you", "Your report has been submitted.")
        },
      },
    ])
  }, [])

  const $bottomSheetRef = useRef<any>(null)

  const handleItemLongPress = useCallback((item: ILibrary) => {
    if (item.pdf) {
      // Trigger haptic feedback
      ReactNativeHapticFeedback.trigger("impactLight", {
        enableVibrateFallback: true,
        ignoreAndroidSystemSettings: false,
      })

      console.log("Long press detected, opening bottom sheet for:", item.name)
      setSelectedItem(item)
      // Small delay to ensure state is updated
      console.log("Attempting to open bottom sheet, ref:", !!$bottomSheetRef.current)
      // Try to expand the bottom sheet
      try {
        $bottomSheetRef.current?.expand()
      } catch (error) {
        console.log("Error expanding bottom sheet:", error)
        // Fallback to snapToIndex - use index 1 for the expanded state
        $bottomSheetRef.current?.snapToIndex(1)
      }
    }
  }, [])

  return (
    <Screen
      preset="fixed"
      backgroundColor={colors.background}
      safeAreaEdges={["top"]}
      contentContainerStyle={$screenContainer}
    >
      <Header
        title="Dua Library"
        showBackButton
        rightActions={
          <Pressable onPress={toggleSearch}>
            <Animated.View style={{ transform: [{ scale: iconScale }] }}>
              <Icon icon="search" size={20} color={colors.palette.primary500} />
            </Animated.View>
          </Pressable>
        }
      />
      <SectionList
        ref={null}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={$listContainer}
        stickySectionHeadersEnabled={false}
        sections={[
          {
            name: "Current Sound",
            description: "Current Sound",
            data: [
              currentSound ? (
                <View style={$currentSoundContainer} key="current-sound">
                  <SoundPlayerHome navigation={props.navigation} key="current-sound" />
                </View>
              ) : null,
            ],
          },
          {
            name: "Daily Duas",
            description: "daily duas",
            data: [
              <DailyDuas
                title="Daily Duas & Bookmarks"
                navigation={props.navigation}
                items={libraryStore.homeData}
                currentSound={currentSound}
                handleItemLongPress={handleItemLongPress}
                key="bookmarks"
              />,
            ],
          },
        ]}
        renderItem={({ item }) => item}
      />
      <PDFOptionsBottomSheet
        ref={$bottomSheetRef}
        item={selectedItem}
        onPinToHomeScreen={handlePinToHomeScreen}
        onOpen={handleOpenPDF}
        onReportPDF={handleReportPDF}
        onClose={handleCloseBottomSheet}
        isPinned={selectedItem ? dataStore.isPdfPinned(selectedItem.id) : false}
      />
    </Screen>
  )
})

const $screenContainer: ViewStyle = {
  backgroundColor: colors.background,
  flex: 1,
}

const $currentSoundContainer: ViewStyle = {
  marginBottom: 20,
}

const $listContainer: ViewStyle = {
  paddingBottom: 40,
}
