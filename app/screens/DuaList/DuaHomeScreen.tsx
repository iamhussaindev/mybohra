import { useFocusEffect } from "@react-navigation/native"
import { Icon, PDFOptionsBottomSheet, Screen } from "app/components"
import Header from "app/components/Header"
import { useSoundPlayer } from "app/hooks/useAudio"
import { usePdfOptionsBottomSheet } from "app/hooks/usePdfOptionsBottomSheet"
import { useStores } from "app/models"
import { ILibrary } from "app/models/LibraryStore"
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
  RefreshControl,
} from "react-native"

import DailyDuas from "../components/DuaGridList"
import SoundPlayerHome from "../Home/components/SoundPlayerHome"

import AlbumList, { AlbumCategory } from "./components/AlbumList"

interface DuaHomeScreen extends AppStackScreenProps<"DuaHome"> {}

export const DuaLHomeScreen: FC<DuaHomeScreen> = observer(function DuaLHomeScreen(props) {
  const { libraryStore, dataStore } = useStores()
  const { currentSound } = useSoundPlayer()
  const [search, setSearch] = useState("")
  const [showSearch, setShowSearch] = useState(false)
  const $searchRef = useRef<TextInput>(null)

  // Use the PDF options bottom sheet hook
  const {
    bottomSheetRef,
    selectedItem,
    handleItemLongPress,
    handlePinToHomeScreen,
    handleCloseBottomSheet,
    handleOpenPDF,
    handleReportPDF,
    isPinned,
  } = usePdfOptionsBottomSheet({ navigation: props.navigation })

  // Animated values
  const searchOpacity = useRef(new Animated.Value(0)).current
  const searchTranslateY = useRef(new Animated.Value(-20)).current
  const searchScale = useRef(new Animated.Value(0.95)).current
  const iconScale = useRef(new Animated.Value(1)).current

  const [refreshing, setRefreshing] = useState(false)

  const fetchLibraryData = useCallback(async () => {
    await libraryStore.fetchList()
    await dataStore.loadPdfHistory()
  }, [libraryStore, dataStore])

  // Fetch library data on component mount
  useEffect(() => {
    fetchLibraryData()
  }, [fetchLibraryData])

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    try {
      await fetchLibraryData()
    } finally {
      setRefreshing(false)
    }
  }, [fetchLibraryData])
  const recentHistory = dataStore.getRecentPdfHistory(6)
  const recentPdfItems = recentHistory
    .map((entry) => libraryStore.allLibraryData.find((item) => item.id === entry.pdfId))
    .filter((item): item is ILibrary => Boolean(item))
    .slice(0, 6)
  const recentPdfIds = new Set(recentPdfItems.map((item) => item.id))
  const filteredDailyDuas = libraryStore.getItemsByIds(
    dataStore.pinnedPdfIds.filter((id) => !recentPdfIds.has(id)),
  )

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
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
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
            name: "Recent PDFs",
            description: "recently opened",
            data: [
              recentPdfItems.length ? (
                <DailyDuas
                  title="Recently Opened"
                  navigation={props.navigation}
                  items={recentPdfItems}
                  currentSound={currentSound}
                  handleItemLongPress={handleItemLongPress}
                  key="recent-pdfs"
                />
              ) : null,
            ],
          },
          {
            name: "Daily Duas",
            description: "daily duas",
            data: [
              filteredDailyDuas.length > 0 ? (
                <DailyDuas
                  title="Bookmarks"
                  navigation={props.navigation}
                  items={filteredDailyDuas}
                  currentSound={currentSound}
                  handleItemLongPress={handleItemLongPress}
                  key="bookmarks"
                />
              ) : null,
            ],
          },

          {
            name: "Categories",
            description: "daily duas",
            data: [
              <AlbumList
                title="Categories"
                categories={libraryStore.getCategories() as unknown as AlbumCategory[]}
                onSelectAlbum={(album) => {
                  props.navigation.navigate("DuaList", {
                    album: {
                      id: album.id,
                      title: album.title,
                      description: album.description,
                      count: album.count,
                    },
                  })
                }}
                key="bookmarks"
              />,
            ],
          },
        ]}
        renderItem={({ item }) => item}
      />
      <PDFOptionsBottomSheet
        ref={bottomSheetRef}
        item={selectedItem}
        onPinToHomeScreen={handlePinToHomeScreen}
        onOpen={handleOpenPDF}
        onReportPDF={handleReportPDF}
        onClose={handleCloseBottomSheet}
        isPinned={isPinned}
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
