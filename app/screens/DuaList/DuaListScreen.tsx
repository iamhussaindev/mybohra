import { Icon, PDFOptionsBottomSheet, Screen } from "app/components"
import Header from "app/components/Header"
import { usePdfOptionsBottomSheet } from "app/hooks/usePdfOptionsBottomSheet"
import { useStores } from "app/models"
import { ILibrary } from "app/models/LibraryStore"
import { AppStackScreenProps } from "app/navigators"
import { colors } from "app/theme"
import { observer } from "mobx-react-lite"
import React, { FC, useCallback, useRef, useState, useEffect } from "react"
import { ViewStyle, Pressable, Animated, FlatList } from "react-native"

import { PdfItemCard } from "./components/PdfItemCard"

interface DuaListScreenProps extends AppStackScreenProps<"DuaList"> {}

export const DuaListScreen: FC<DuaListScreenProps> = observer(function DuaListScreen(props) {
  const { libraryStore, dataStore } = useStores()
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

  const fetchLibraryData = useCallback(async () => {
    await dataStore.loadPdfHistory()
  }, [dataStore])

  // Fetch library data on component mount
  useEffect(() => {
    fetchLibraryData()
  }, [fetchLibraryData])

  // Fetch items by categories if album is provided
  const [categoryItems, setCategoryItems] = useState<ILibrary[]>([])
  const [, setLoading] = useState(false)

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

  const handleItemPress = (item: ILibrary) => {
    props.navigation.navigate("PdfViewer", { ...item })
  }

  const renderPdfItem = ({ item }: { item: ILibrary & { lastOpened?: string } }) => {
    return (
      <PdfItemCard item={item} onPress={handleItemPress} onOptionsPress={handleItemLongPress} />
    )
  }

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
      <FlatList
        data={categoryItems}
        renderItem={renderPdfItem}
        keyExtractor={(item) => item.id.toString()}
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
