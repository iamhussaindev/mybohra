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
import { ViewStyle, Pressable, Animated, ScrollView, RefreshControl } from "react-native"

import DailyDuas from "../components/DuaGridList"

interface DuaListScreenProps extends AppStackScreenProps<"DuaList"> {}

export const DuaListScreen: FC<DuaListScreenProps> = observer(function DuaListScreen(props) {
  const { libraryStore, dataStore } = useStores()
  const { currentSound } = useSoundPlayer()
  const album = props.route.params?.album

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

  const fetchLibraryData = useCallback(async () => {
    await dataStore.loadPdfHistory()
  }, [dataStore])

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

  // Fetch items by categories if album is provided
  const [categoryItems, setCategoryItems] = useState<ILibrary[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (album) {
      setLoading(true)
      libraryStore.fetchByCategories([album.id]).then((items) => {
        setCategoryItems(items)
        setLoading(false)
      })
    } else {
      setCategoryItems([])
    }
  }, [album, libraryStore])

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

  return (
    <Screen
      preset="fixed"
      backgroundColor={colors.background}
      safeAreaEdges={["top"]}
      contentContainerStyle={$screenContainer}
    >
      <Header
        title={album ? album.title : "Dua Library"}
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
      <ScrollView
        style={$scrollView}
        contentContainerStyle={$scrollViewContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {album && categoryItems.length > 0 ? (
          <DailyDuas
            hideTitle
            columns={1}
            title={album.title}
            navigation={props.navigation}
            items={categoryItems}
            currentSound={currentSound}
            handleItemLongPress={handleItemLongPress}
            key="category-items"
            pinnedIds={dataStore.getPinnedPdfIds()}
            showOptions={true}
          />
        ) : album && categoryItems.length === 0 ? (
          <DailyDuas
            title={album.title}
            navigation={props.navigation}
            items={[]}
            currentSound={currentSound}
            handleItemLongPress={handleItemLongPress}
            key="category-items-empty"
            pinnedIds={dataStore.getPinnedPdfIds()}
            showOptions={true}
          />
        ) : null}
      </ScrollView>
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

const $scrollView: ViewStyle = {
  flex: 1,
}

const $scrollViewContent: ViewStyle = {
  paddingBottom: 40,
}
