import { Icon, PDFOptionsBottomSheet, Screen } from "app/components"
import Header from "app/components/Header"
import { usePdfOptionsBottomSheet } from "app/hooks/usePdfOptionsBottomSheet"
import { useStores } from "app/models"
import { ILibrary } from "app/models/LibraryStore"
import { AppStackScreenProps } from "app/navigators"
import { useColors } from "app/theme/useColors"
import { formatLabel } from "app/utils/labelHelper"
import { observer } from "mobx-react-lite"
import React, { FC, useCallback, useRef, useState, useEffect } from "react"
import { ViewStyle, Pressable, Animated, FlatList, View, ActivityIndicator } from "react-native"

import { PdfItemCard } from "./components/PdfItemCard"
import { PdfItemCardSkeleton } from "./components/PdfItemCardSkeleton"

interface DuaListScreenProps extends AppStackScreenProps<"DuaList"> {}

export const DuaListScreen: FC<DuaListScreenProps> = observer(function DuaListScreen(props) {
  const colors = useColors()
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

  // Fetch items by categories if album is provided with pagination
  const [categoryItems, setCategoryItems] = useState<ILibrary[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [offset, setOffset] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const ITEMS_PER_PAGE = 50

  const loadItems = useCallback(
    async (currentOffset: number, append = false) => {
      if (!album) return

      if (currentOffset === 0) {
        setLoading(true)
      } else {
        setLoadingMore(true)
      }

      try {
        console.log("album.id", album.id)
        const items = await libraryStore.fetchByCategories([album.id], {
          limit: ITEMS_PER_PAGE,
          offset: currentOffset,
        })

        if (items.length < ITEMS_PER_PAGE) {
          setHasMore(false)
        } else {
          setHasMore(true)
        }

        if (append) {
          setCategoryItems((prev) => [...prev, ...items])
        } else {
          setCategoryItems(items)
        }
        setOffset(currentOffset + items.length)
      } catch (error) {
        console.error("Error loading items:", error)
      } finally {
        setLoading(false)
        setLoadingMore(false)
      }
    },
    [album, libraryStore],
  )

  useEffect(() => {
    if (album) {
      setOffset(0)
      setHasMore(true)
      setCategoryItems([])
      loadItems(0, false)
    } else {
      setCategoryItems([])
      setOffset(0)
      setHasMore(false)
    }
  }, [album, loadItems])

  const handleLoadMore = useCallback(() => {
    if (!loadingMore && hasMore && !loading && album) {
      loadItems(offset, true)
    }
  }, [loadingMore, hasMore, loading, album, offset, loadItems])

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
      contentContainerStyle={$screenContainer(colors)}
    >
      <Header
        title={album ? formatLabel(album.title) : "Dua Library"}
        showBackButton
        rightActions={
          <Pressable
            onPress={() => {
              animateIconPress()
              props.navigation.navigate("DuaListSearch")
            }}
          >
            <Animated.View style={{ transform: [{ scale: iconScale }] }}>
              <Icon icon="search" size={20} color={colors.text} />
            </Animated.View>
          </Pressable>
        }
      />
      <FlatList
        data={categoryItems}
        renderItem={renderPdfItem}
        keyExtractor={(item) => item.id.toString()}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          loading && categoryItems.length === 0 ? (
            <View>
              {[...Array(5)].map((_, index) => (
                <PdfItemCardSkeleton key={index} />
              ))}
            </View>
          ) : null
        }
        ListFooterComponent={
          loadingMore ? (
            <View style={$loadingMoreContainer}>
              <ActivityIndicator size="small" color={colors.palette.primary500} />
            </View>
          ) : null
        }
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

const $screenContainer = (colors: any): ViewStyle => ({
  flex: 1,
  backgroundColor: colors.background,
})

const $loadingMoreContainer: ViewStyle = {
  padding: 20,
  alignItems: "center",
}
