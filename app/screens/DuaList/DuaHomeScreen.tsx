import { TouchableHighlight } from "@gorhom/bottom-sheet"
import { IconDotsVertical } from "@tabler/icons-react-native"
import { Icon, PDFOptionsBottomSheet, PDFPreviewModal, Screen, Text } from "app/components"
import Header from "app/components/Header"
import { usePdfOptionsBottomSheet } from "app/hooks/usePdfOptionsBottomSheet"
import { useStores } from "app/models"
import { ILibrary } from "app/models/LibraryStore"
import { AppStackScreenProps } from "app/navigators"
import { colors, spacing } from "app/theme"
import { typography } from "app/theme/typography"
import { momentTime } from "app/utils/currentTime"
import * as storage from "app/utils/storage"
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
import ReactNativeHapticFeedback from "react-native-haptic-feedback"

import { AlbumCategory } from "./components/AlbumList"

interface DuaHomeScreen extends AppStackScreenProps<"DuaHome"> {}

type TabType = "Recent" | "Bookmarks" | "Today"

// Helper function to format relative time
const formatTimeAgo = (dateString: string): string => {
  const date = momentTime(new Date(dateString))
  const now = momentTime()
  const diffInHours = now.diff(date, "hours")
  const diffInDays = now.diff(date, "days")

  if (diffInHours < 1) {
    const diffInMinutes = now.diff(date, "minutes")
    if (diffInMinutes < 1) return "Just now"
    return `Opened ${diffInMinutes} ${diffInMinutes === 1 ? "minute" : "minutes"} ago`
  } else if (diffInHours < 24) {
    return `Opened ${diffInHours} ${diffInHours === 1 ? "hour" : "hours"} ago`
  } else if (diffInDays < 7) {
    return `Opened ${diffInDays} ${diffInDays === 1 ? "day" : "days"} ago`
  } else {
    return date.format("MMM D, YYYY")
  }
}

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

  // Animated values
  const iconScale = useRef(new Animated.Value(1)).current

  const [refreshing, setRefreshing] = useState(false)
  const [recentPdfItems, setRecentPdfItems] = useState<ILibrary[]>([])
  const [activeTab, setActiveTab] = useState<TabType>("Recent")
  const [hasNewTodayItems, setHasNewTodayItems] = useState(false)
  const [previewItem, setPreviewItem] = useState<ILibrary | null>(null)
  const [anchorPosition, setAnchorPosition] = useState<{
    x: number
    y: number
    width: number
    height: number
  } | null>(null)

  const tabs: TabType[] = ["Recent", "Today", "Bookmarks"]
  const TODAY_SNAPSHOT_KEY = "TODAY_TAB_SNAPSHOT"

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

  // Create snapshot from items (array of {id, lastOpened})
  const createSnapshot = useCallback(
    (
      items: Array<ILibrary & { lastOpened?: string }>,
    ): Array<{ id: number; lastOpened: string }> => {
      return items
        .filter((item): item is ILibrary & { lastOpened: string } => !!item.lastOpened)
        .map((item) => ({
          id: item.id,
          lastOpened: item.lastOpened,
        }))
        .sort((a, b) => new Date(b.lastOpened).getTime() - new Date(a.lastOpened).getTime())
    },
    [],
  )

  // Compare snapshots to detect changes
  const compareSnapshots = useCallback(
    (
      current: Array<{ id: number; lastOpened: string }>,
      stored: Array<{ id: number; lastOpened: string }> | null,
    ): boolean => {
      if (!stored || stored.length === 0) {
        return current.length > 0
      }

      // Check if there are new items (IDs not in stored snapshot)
      const storedIds = new Set(stored.map((item) => item.id))
      const hasNewItems = current.some((item) => !storedIds.has(item.id))

      if (hasNewItems) return true

      // Check if any existing items have newer lastOpened timestamps
      const storedMap = new Map(stored.map((item) => [item.id, item.lastOpened]))
      const hasUpdatedItems = current.some((item) => {
        const storedTimestamp = storedMap.get(item.id)
        return storedTimestamp && new Date(item.lastOpened) > new Date(storedTimestamp)
      })

      return hasUpdatedItems
    },
    [],
  )

  // Check for new items when data changes
  useEffect(() => {
    const checkForNewItems = async () => {
      const todayItems = getTodayItems()
      const currentSnapshot = createSnapshot(todayItems)
      const storedSnapshot = (await storage.load(TODAY_SNAPSHOT_KEY)) as Array<{
        id: number
        lastOpened: string
      }> | null

      const hasChanges = compareSnapshots(currentSnapshot, storedSnapshot)
      setHasNewTodayItems(hasChanges)
    }

    if (recentPdfItems.length > 0) {
      checkForNewItems()
    }
  }, [recentPdfItems, getTodayItems, createSnapshot, compareSnapshots])

  // Update snapshot when user views Today tab
  useEffect(() => {
    if (activeTab === "Today") {
      const updateSnapshot = async () => {
        const todayItems = getTodayItems()
        const currentSnapshot = createSnapshot(todayItems)
        await storage.save(TODAY_SNAPSHOT_KEY, currentSnapshot)
        setHasNewTodayItems(false)
      }

      updateSnapshot()
    }
  }, [activeTab, getTodayItems, createSnapshot])

  // Update snapshot on refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    try {
      await fetchLibraryData()
      // Refresh recent PDF items after history is reloaded
      await fetchRecentPdfItems()
      // Update snapshot after refresh if on Today tab
      if (activeTab === "Today") {
        const todayItems = getTodayItems()
        const currentSnapshot = createSnapshot(todayItems)
        await storage.save(TODAY_SNAPSHOT_KEY, currentSnapshot)
        setHasNewTodayItems(false)
      }
    } finally {
      setRefreshing(false)
    }
  }, [activeTab, fetchLibraryData, fetchRecentPdfItems, getTodayItems, createSnapshot])

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
    const timeAgo = item.lastOpened ? formatTimeAgo(item.lastOpened) : ""
    const itemRef = useRef<View>(null)

    const handleLongPress = (e: any) => {
      e.stopPropagation()
      // Trigger stronger haptic feedback on long press
      try {
        ReactNativeHapticFeedback.trigger("impactMedium", {
          enableVibrateFallback: true,
          ignoreAndroidSystemSettings: false,
        })
      } catch (error) {
        console.log("Haptic feedback error:", error)
      }

      // Measure the item position
      itemRef.current?.measure((x, y, width, height, pageX, pageY) => {
        setAnchorPosition({
          x: pageX,
          y: pageY,
          width,
          height,
        })
        setPreviewItem(item)
      })
    }

    return (
      <View ref={itemRef} collapsable={false}>
        <TouchableHighlight
          underlayColor={colors.palette.neutral200}
          onPress={() => handleItemPress(item)}
          onLongPress={handleLongPress}
          style={$pdfCard}
        >
          <View style={$pdfCardContent}>
            <View style={$pdfIconContainer}>
              <Image source={require("../../../assets/images/file.png")} style={$icon} />
            </View>
            <View style={$pdfTextContainer}>
              <Text text={item.name} style={$pdfTitle} numberOfLines={2} weight="medium" />
              {timeAgo && <Text text={timeAgo} style={$pdfTimestamp} />}
            </View>
            <Pressable
              onPress={(e) => {
                e.stopPropagation()
                // Trigger haptic feedback on press
                try {
                  ReactNativeHapticFeedback.trigger("impactLight", {
                    enableVibrateFallback: true,
                    ignoreAndroidSystemSettings: false,
                  })
                } catch (error) {
                  console.log("Haptic feedback error:", error)
                }
                handleItemLongPress(item)
              }}
              style={({ pressed }) => [$bookmarkButton, pressed && $bookmarkButtonPressed]}
              hitSlop={8}
            >
              <IconDotsVertical size={20} color={colors.palette.neutral800} />
            </Pressable>
          </View>
        </TouchableHighlight>
      </View>
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
            <Text text={item.title} style={$folderTitle} numberOfLines={2} weight="medium" />
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
          <View style={$tabsContainer}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={$tabsScrollContent}
            >
              {tabs.map((tab) => (
                <Pressable
                  key={tab}
                  onPress={() => setActiveTab(tab)}
                  style={[$tabButton, activeTab === tab && $activeTabButton]}
                >
                  <View style={$tabContent}>
                    {tab === "Today" && hasNewTodayItems && <View style={$redDot} />}
                    <Text
                      text={tab}
                      style={[$tabText, activeTab === tab && $activeTabText]}
                      weight="medium"
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
  backgroundColor: colors.background,
  flex: 1,
}

const $tabsContainer: ViewStyle = {
  backgroundColor: colors.background,
  paddingVertical: spacing.md,
  borderBottomColor: colors.border,
  marginBottom: spacing.sm,
}

const $tabsScrollContent: ViewStyle = {
  paddingHorizontal: spacing.md,
  flexDirection: "row",
  gap: spacing.sm,
}

const $tabButton: ViewStyle = {
  paddingHorizontal: spacing.sm,
  borderRadius: 100,
  borderWidth: 1,
  borderColor: colors.border,
  backgroundColor: colors.white,
  minHeight: 32,
  justifyContent: "center",
  alignItems: "center",
}

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

const $activeTabButton: ViewStyle = {
  backgroundColor: colors.palette.neutral200,
  borderColor: colors.border,
}

const $tabText: TextStyle = {
  fontSize: 14,
  color: colors.palette.neutral800,
}

const $activeTabText: TextStyle = {
  color: colors.palette.neutral800,
}

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
  backgroundColor: colors.white,
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
  color: colors.palette.neutral900,
  textTransform: "capitalize",
}

const $pdfCard: ViewStyle = {
  backgroundColor: colors.white,
  marginBottom: spacing.sm,
  paddingHorizontal: spacing.sm,
  paddingVertical: spacing.xxs,
  borderColor: colors.border,
}

const $pdfCardContent: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
}

const $pdfIconContainer: ViewStyle = {
  width: 40,
  height: 40,
  justifyContent: "center",
  alignItems: "center",
  marginRight: spacing.md,
}

const $icon: ImageStyle = {
  width: 24,
  height: 24,
}

const $pdfTextContainer: ViewStyle = {
  flex: 1,
  justifyContent: "center",
}

const $pdfTitle: TextStyle = {
  fontSize: 16,
  fontFamily: typography.primary.medium,
  color: colors.palette.neutral800,
  textTransform: "capitalize",
}

const $pdfTimestamp: TextStyle = {
  fontSize: 13,
  fontFamily: typography.primary.normal,
  color: colors.palette.neutral500,
}

const $bookmarkButton: ViewStyle = {
  padding: spacing.xs,
  justifyContent: "center",
  alignItems: "center",
  borderRadius: 8,
}

const $bookmarkButtonPressed: ViewStyle = {
  backgroundColor: colors.palette.neutral200,
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
