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
import { View, ViewStyle, Pressable, Animated, SectionList, RefreshControl } from "react-native"

import DailyDuas from "../components/DuaGridList"
import SoundPlayerHome from "../Home/components/SoundPlayerHome"

import AlbumList, { AlbumCategory } from "./components/AlbumList"

interface DuaHomeScreen extends AppStackScreenProps<"DuaHome"> {}

export const DuaLHomeScreen: FC<DuaHomeScreen> = observer(function DuaLHomeScreen(props) {
  const { libraryStore, dataStore } = useStores()
  const { currentSound } = useSoundPlayer()

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
  const iconScale = useRef(new Animated.Value(1)).current

  const [refreshing, setRefreshing] = useState(false)
  const [recentPdfItems, setRecentPdfItems] = useState<ILibrary[]>([])

  const fetchLibraryData = useCallback(async () => {
    await libraryStore.fetchCategories()
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
  const recentPdfIds = new Set(recentHistory.map((entry) => entry.pdfId))

  // Fetch recent PDF items by IDs
  useEffect(() => {
    if (recentHistory.length > 0) {
      const ids = recentHistory.map((entry) => entry.pdfId)
      libraryStore.fetchItemsByIds(ids).then((items) => {
        setRecentPdfItems(items.slice(0, 6))
      })
    }
  }, [recentHistory, libraryStore])

  const filteredDailyDuas = dataStore.pinnedPdfs.filter((item) => !recentPdfIds.has(item.id))

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

  // filter out from from first 4 items in recentPdfItems
  const homeData = libraryStore.homeData.filter(
    (item) => !recentPdfItems.some((i) => i.id === item.id),
  )

  const allItems = new Set([...recentPdfItems, ...homeData, ...filteredDailyDuas])
  const allItemsArray = Array.from(allItems)

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
          <Pressable
            onPress={() => {
              animateIconPress()
              props.navigation.navigate("DuaListSearch")
            }}
          >
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
                  hideTitle
                  title="Recently Opened"
                  navigation={props.navigation}
                  items={allItemsArray}
                  currentSound={currentSound}
                  handleItemLongPress={handleItemLongPress}
                  key="recent-pdfs"
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
