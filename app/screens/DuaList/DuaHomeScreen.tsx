import { Icon, PDFOptionsBottomSheet, PDFPreviewModal, Screen, Text } from "app/components"
import Header from "app/components/Header"
import { usePdfOptionsBottomSheet } from "app/hooks/usePdfOptionsBottomSheet"
import { useStores } from "app/models"
import { ILibrary } from "app/models/LibraryStore"
import { AppStackScreenProps } from "app/navigators"
import { colors, spacing } from "app/theme"
import { typography } from "app/theme/typography"
import { useColors } from "app/theme/useColors"
import { observer } from "mobx-react-lite"
import React, { FC, useCallback, useRef, useState, useEffect } from "react"
import {
  View,
  ViewStyle,
  Pressable,
  Animated,
  FlatList,
  RefreshControl,
  TextStyle,
  ScrollView,
  Image,
  SectionList,
  ImageStyle,
} from "react-native"

import { AlbumCategory } from "./components/AlbumList"
import { PdfItemCard } from "./components/PdfItemCard"

interface DuaHomeScreen extends AppStackScreenProps<"DuaHome"> {}

type TabType = "Recent" | "Bookmarks" | "Today"

export const DuaLHomeScreen: FC<DuaHomeScreen> = observer(function DuaLHomeScreen(props) {
  const { libraryStore, dataStore } = useStores()

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
  const colors = useColors()
  // Animated values
  const iconScale = useRef(new Animated.Value(1)).current

  const [refreshing, setRefreshing] = useState(false)
  const [recentPdfItems, setRecentPdfItems] = useState<ILibrary[]>([])
  const [activeTab, setActiveTab] = useState<TabType>("Recent")
  const [hasNewTodayItems] = useState(true)
  const [previewItem, setPreviewItem] = useState<ILibrary | null>(null)
  const [anchorPosition, setAnchorPosition] = useState<{
    x: number
    y: number
    width: number
    height: number
  } | null>(null)

  const tabs: TabType[] = ["Recent", "Today", "Bookmarks"]

  const fetchLibraryData = useCallback(async () => {
    await libraryStore.fetchHomeData()
    await libraryStore.fetchCategories()
    await dataStore.loadPdfHistory()
  }, [libraryStore, dataStore])

  // Fetch library data on component mount
  useEffect(() => {
    fetchLibraryData()
  }, [])

  // Fetch recent PDF items by IDs
  const fetchRecentPdfItems = useCallback(async () => {
    const history = dataStore.getRecentPdfHistory(12).map((entry) => ({
      pdfId: entry.pdfId,
      lastOpened: entry.lastOpened,
      openedCount: entry.openedCount,
    }))
    if (history.length > 0) {
      const ids = history.map((entry) => entry.pdfId)
      const items = await libraryStore.fetchItemsByIds(ids)
      setRecentPdfItems(items.slice(0, 12))
    } else {
      setRecentPdfItems([])
    }
  }, [libraryStore, dataStore])

  useEffect(() => {
    fetchRecentPdfItems()
  }, [fetchRecentPdfItems])

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

  // Get today's items
  const getTodayItems = useCallback((): Array<ILibrary & { lastOpened?: string }> => {
    return libraryStore.homeData
  }, [libraryStore.homeData])

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    try {
      await fetchLibraryData()
      await fetchRecentPdfItems()
    } finally {
      setRefreshing(false)
    }
  }, [activeTab, fetchLibraryData, fetchRecentPdfItems, getTodayItems])

  // Get data based on active tab
  const getDisplayItems = (): Array<ILibrary & { lastOpened?: string }> => {
    // Get fresh history to avoid detached node errors
    const currentHistory = dataStore.getRecentPdfHistory(12).map((entry) => ({
      pdfId: entry.pdfId,
      lastOpened: entry.lastOpened,
      openedCount: entry.openedCount,
    }))

    if (activeTab === "Bookmarks") {
      return dataStore.pinnedPdfs.map((item) => ({
        ...item,
        lastOpened: currentHistory.find((h) => h.pdfId === item.id)?.lastOpened,
      }))
    } else if (activeTab === "Today") {
      return getTodayItems()
    } else {
      // Recent tab - sort by lastOpened date (most recent first)
      return recentPdfItems
        .map((item) => {
          const history = currentHistory.find((h) => h.pdfId === item.id)
          return { ...item, lastOpened: history?.lastOpened }
        })
        .filter((item): item is ILibrary & { lastOpened: string } => item.lastOpened !== undefined)
        .sort((a, b) => {
          if (!a.lastOpened || !b.lastOpened) return 0
          return new Date(b.lastOpened).getTime() - new Date(a.lastOpened).getTime()
        })
    }
  }

  const displayItems = getDisplayItems()
  const categories = (libraryStore.getCategories() as unknown as AlbumCategory[]) || []

  const handleItemPress = (item: ILibrary) => {
    props.navigation.navigate("PdfViewer", { ...item })
  }

  const renderPdfItem = ({ item }: { item: ILibrary & { lastOpened?: string } }) => {
    return (
      <PdfItemCard
        item={item}
        onPress={handleItemPress}
        onLongPress={(item, position) => {
          setAnchorPosition(position)
          setPreviewItem(item)
        }}
        onOptionsPress={handleItemLongPress}
      />
    )
  }

  // Render folders header component
  const renderFoldersHeader = () => (
    <View style={$foldersSection}>
      <FlatList
        data={categories.filter(
          (cat) =>
            ![
              "sunday",
              "friday",
              "thursday",
              "wednesday",
              "tuesday",
              "monday",
              "saturday",
              "joshan",
              "daily-dua",
            ].includes(cat.id),
        )}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={$foldersScrollContent}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable
            style={$folderCard}
            onPress={() => {
              props.navigation.navigate("DuaList", {
                album: {
                  id: item.id,
                  title: item.title,
                  description: item.description,
                  count: item.count,
                },
              })
            }}
          >
            <Image source={require("../../../assets/images/folder.png")} style={$folderIcon} />
            <Text
              text={item.title}
              style={$folderTitle}
              numberOfLines={2}
              weight="medium"
              color={colors.text}
            />
          </Pressable>
        )}
      />
    </View>
  )

  return (
    <Screen
      preset="fixed"
      backgroundColor={colors.background}
      safeAreaEdges={["top"]}
      contentContainerStyle={$screenContainer}
    >
      <Header
        title="PDF Library"
        showBackButton
        rightActions={
          <Pressable
            onPress={() => {
              animateIconPress()
              props.navigation.navigate("DuaListSearch")
            }}
          >
            <Animated.View style={{ transform: [{ scale: iconScale }] }}>
              <Icon icon="search" size={20} color={colors.palette.neutral900} />
            </Animated.View>
          </Pressable>
        }
      />

      <SectionList
        sections={[
          {
            title: "tabs",
            data: displayItems,
            renderItem: renderPdfItem,
          },
        ]}
        keyExtractor={(item) => item.id.toString()}
        ListHeaderComponent={renderFoldersHeader}
        renderSectionHeader={() => (
          <View style={$tabsContainer(colors)}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={$tabsScrollContent}
            >
              {tabs.map((tab) => (
                <Pressable
                  key={tab}
                  onPress={() => setActiveTab(tab)}
                  style={[$tabButton(colors), activeTab === tab && $activeTabButton(colors)]}
                >
                  <View style={$tabContent}>
                    {tab === "Today" && hasNewTodayItems && <View style={$redDot} />}
                    <Text
                      text={tab}
                      style={[$tabText, activeTab === tab && $activeTabText(colors)]}
                      weight="medium"
                      color={colors.text}
                    />
                  </View>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}
        stickySectionHeadersEnabled
        contentContainerStyle={$listContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={$emptyContainer}>
            <Text text="No items found" style={$emptyText} />
          </View>
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

      <PDFPreviewModal
        item={previewItem}
        visible={!!previewItem}
        onClose={() => {
          setPreviewItem(null)
          setAnchorPosition(null)
        }}
        onOpen={handleOpenPDF}
        onPinToHomeScreen={handlePinToHomeScreen}
        onReportPDF={handleReportPDF}
        isPinned={previewItem ? dataStore.isPdfPinned(previewItem.id) : false}
        anchorPosition={anchorPosition}
      />
    </Screen>
  )
})

const $screenContainer: ViewStyle = {
  flex: 1,
}

const $tabsContainer = (colors: any): ViewStyle => ({
  paddingVertical: spacing.md,
  borderBottomColor: colors.border,
  marginBottom: spacing.sm,
  backgroundColor: colors.background,
})

const $tabsScrollContent: ViewStyle = {
  paddingHorizontal: spacing.md,
  flexDirection: "row",
  gap: spacing.sm,
}

const $tabButton = (colors: any): ViewStyle => ({
  paddingHorizontal: spacing.sm,
  borderRadius: 100,
  borderWidth: 1,
  borderColor: colors.border,
  backgroundColor: colors.background,
  minHeight: 32,
  justifyContent: "center",
  alignItems: "center",
})

const $tabContent: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  position: "relative",
  justifyContent: "center",
}

const $redDot: ViewStyle = {
  width: 6,
  height: 6,
  borderRadius: 4,
  backgroundColor: "#FF0000",
  marginRight: spacing.xs,
}

const $activeTabButton = (colors: any): ViewStyle => ({
  backgroundColor: colors.palette.neutral300,
  borderColor: colors.border,
})

const $tabText: TextStyle = {
  fontSize: 14,
}

const $activeTabText = (colors: any): TextStyle => ({
  color: colors.text,
})

const $listContainer: ViewStyle = {
  paddingBottom: spacing.xxl,
}

const $foldersSection: ViewStyle = {
  marginTop: spacing.md,
}

const $foldersScrollContent: ViewStyle = {
  paddingRight: spacing.md,
  gap: spacing.md,
  paddingLeft: spacing.md,
}

const $folderCard: ViewStyle = {
  marginBottom: spacing.md,
  marginRight: spacing.sm,
  borderColor: colors.border,
  width: 80,
  minHeight: 80,
  justifyContent: "space-between",
  alignItems: "center",
}

const $folderIcon: ImageStyle = {
  width: 72,
  height: 72,
}

const $folderTitle: TextStyle = {
  fontSize: 14,
  fontFamily: typography.primary.medium,
  textTransform: "capitalize",
}

const $emptyContainer: ViewStyle = {
  paddingVertical: spacing.xxl,
  alignItems: "center",
}

const $emptyText: TextStyle = {
  fontSize: 14,
  fontFamily: typography.primary.medium,
  color: colors.palette.neutral500,
}
