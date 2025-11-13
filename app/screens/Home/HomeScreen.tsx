import { PDFOptionsBottomSheet, Screen } from "app/components"
import { useSoundPlayer } from "app/hooks/useAudio"
import { usePdfOptionsBottomSheet } from "app/hooks/usePdfOptionsBottomSheet"
import { useStores } from "app/models"
import MiqaatList from "app/screens/components/MiqaatList"
import { observer } from "mobx-react-lite"
import React, { FC, ReactElement, useEffect, useRef, useState } from "react"
import { View, ViewStyle, SectionList, NativeScrollEvent, NativeSyntheticEvent } from "react-native"
import { Drawer } from "react-native-drawer-layout"
import { RefreshControl } from "react-native-gesture-handler"

import { useLocationBottomSheet } from "../../contexts/LocationBottomSheetContext"
import { isRTL } from "../../i18n"
import { AppStackScreenProps } from "../../navigators"
import { colors, spacing } from "../../theme"
import { useSafeAreaInsetsStyle } from "../../utils/useSafeAreaInsetsStyle"
import DuaGridList from "../components/DuaGridList"

import CurrentQiyam from "./components/CurrentQiyam"
import GridIcons from "./components/GridIcons"
import { Header } from "./components/Header"
import HeroIcons from "./components/HeroIcons"
import NamazUI from "./components/NamazUI"
import RamazaanNiyyat from "./components/RamazaanNiyyat"
import SoundPlayerHome from "./components/SoundPlayerHome"

interface HomeScreenProps extends AppStackScreenProps<"Home"> {
  refetchHomeData: () => void
}

export interface HomeSection {
  name: string
  description: string
  data: ReactElement[]
}

export const HomeScreen: FC<HomeScreenProps> = observer(function MainScreen(props) {
  const [open, setOpen] = useState(false)
  const timeout = useRef<ReturnType<typeof setTimeout>>()
  const $drawerInsets = useSafeAreaInsetsStyle(["top"])
  const [showBorder, setShowBorder] = useState(false)
  const [shadowOffset, setShadowOffset] = useState(0)
  const { openLocationBottomSheet } = useLocationBottomSheet()

  const { dataStore, miqaatStore, libraryStore, reminderStore } = useStores()
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

  // Get pinned items and merge with daily duas
  const pinnedItems = libraryStore.getItemsByIds(dataStore.pinnedPdfIds)

  // remove pinnedItems from combinedDailyDuas
  const dailyDuas = libraryStore.homeData.filter((item) => !pinnedItems.includes(item)) ?? []

  // Removed manual analytics - using Firebase only

  const fetchMiqaats = async () => {
    await miqaatStore.fetchMiqaats()
  }

  const fetchHomeLibrary = async () => {
    await libraryStore.fetchHomeData()
    await dataStore.fetchQiyam()
    await libraryStore.fetchList()
  }

  const fetchData = async () => {
    await fetchMiqaats()
    await fetchHomeLibrary()
  }

  useEffect(() => {
    ;(async function load() {
      await dataStore.loadPinnedPdfs()
    })()
  }, [dataStore])

  useEffect(() => {
    return () => timeout.current && clearTimeout(timeout.current)
  }, [])

  const listRef = useRef<SectionList>(null)

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetY = event.nativeEvent.contentOffset.y
    if (offsetY > 40) {
      setShowBorder(true)
      const maxShadowOffset = 50
      const newShadowOffset = Math.min(maxShadowOffset, (offsetY - 50) / 5)
      setShadowOffset(newShadowOffset)
    } else {
      setShowBorder(false)
      setShadowOffset(0)
    }
  }

  const handleLocationPress = () => {
    openLocationBottomSheet()
  }

  return (
    <>
      <Drawer
        open={open}
        onOpen={() => {
          setOpen(true)
        }}
        onClose={() => {
          setOpen(false)
        }}
        drawerType={"slide"}
        drawerPosition={isRTL ? "right" : "left"}
        renderDrawerContent={() => (
          <View style={[$drawer, $drawerInsets]}>
            <View style={$logoContainer} />
          </View>
        )}
      >
        <Screen
          backgroundColor={colors.background}
          preset="fixed"
          safeAreaEdges={["top"]}
          contentContainerStyle={$screenContainer}
        >
          <Header
            showBorder={showBorder}
            shadowOffset={shadowOffset}
            loaded={dataStore?.currentLocationLoaded}
            currentLocation={dataStore?.currentLocation}
            open={open}
            setOpen={setOpen}
            onLocationPress={handleLocationPress}
          />
          <SectionList
            onScroll={handleScroll}
            ref={listRef}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={false}
                onRefresh={() => {
                  fetchData()
                }}
              />
            }
            contentContainerStyle={$sectionListContentContainer}
            stickySectionHeadersEnabled={false}
            sections={[
              {
                name: "Current Sound",
                description: "Current Sound",
                data: [
                  currentSound ? (
                    <SoundPlayerHome navigation={props.navigation} key="current-sound" />
                  ) : null,
                ],
              },
              {
                name: "Hero Icons",
                description: "Hero Icons",
                data: [
                  <HeroIcons
                    key="hero-icons"
                    onNavigation={(screen: "Calendar" | "Home" | "Namaz") => {
                      props.navigation.navigate(screen)
                    }}
                  />,
                ],
              },
              {
                name: "Ramazan Niyyat",
                description: "Ramazan Niyyat",
                data: [<RamazaanNiyyat key="ramazan-niyyat" />],
              },
              {
                name: "Namaz Times",
                description: "Namaz Times",
                data: [
                  <NamazUI
                    key="namaz-times"
                    navigation={props.navigation}
                    isReminderEnabled={(prayerTime) =>
                      reminderStore.reminders.some((reminder) => reminder.prayerTime === prayerTime)
                    }
                  />,
                ],
              },

              {
                name: "Grid Icons",
                description: "Grid Icons",
                data: [
                  <GridIcons
                    onNavigation={(screen: "Counter") => {
                      props.navigation.navigate(screen)
                    }}
                    key="grid_icons"
                  />,
                ],
              },
              {
                name: "Qiyam",
                description: "Qiyam",
                data: [
                  dataStore.qiyamLoaded && dataStore.qiyam ? (
                    <CurrentQiyam qiyam={dataStore.qiyam} key="qiyam" />
                  ) : null,
                ],
              },
              {
                name: "Bookmark & Pinned",
                description: "Bookmark & Pinned",
                key: "bookmark-pinned",
                data: [
                  pinnedItems.length > 0 ? (
                    <DuaGridList
                      navigation={props.navigation}
                      handleItemLongPress={handleItemLongPress}
                      items={pinnedItems}
                      currentSound={currentSound}
                      pinnedIds={dataStore.pinnedPdfIds}
                      title="Bookmark & Pinned"
                      key="daily-duas"
                      showOptions={true}
                    />
                  ) : null,
                ],
              },
              {
                name: "Daily Duas",
                description: "daily duas",
                data: [
                  dailyDuas.length > 0 ? (
                    <DuaGridList
                      navigation={props.navigation}
                      handleItemLongPress={handleItemLongPress}
                      items={dailyDuas}
                      currentSound={currentSound}
                      pinnedIds={dataStore.pinnedPdfIds}
                      title="Daily Duas & Hafti"
                      key="daily-duas"
                      showOptions={true}
                    />
                  ) : null,
                ],
              },
              {
                name: "Miqaat",
                description: "Miqaat",
                data: [
                  miqaatStore.miqaatsToday.length > 0 ? (
                    <MiqaatList title="Miqaats Today" list={miqaatStore.miqaatsToday} />
                  ) : null,
                ],
              },
              {
                name: "Upcoming Miqaats",
                description: "Miqaat",
                data: [
                  miqaatStore.upcomingMiqaats.length ? (
                    <MiqaatList
                      showCount
                      title="Upcoming Miqaats"
                      list={miqaatStore.upcomingMiqaats}
                    />
                  ) : null,
                ],
              },
            ]}
            renderItem={({ item }) => item}
          />
        </Screen>
      </Drawer>
      <PDFOptionsBottomSheet
        ref={bottomSheetRef}
        item={selectedItem}
        onPinToHomeScreen={handlePinToHomeScreen}
        onOpen={handleOpenPDF}
        onReportPDF={handleReportPDF}
        onClose={handleCloseBottomSheet}
        isPinned={isPinned}
      />
    </>
  )
})

const $sectionListContentContainer: ViewStyle = {
  paddingHorizontal: 0,
}

const $screenContainer: ViewStyle = {
  paddingBottom: 42,
}

const $drawer: ViewStyle = {
  backgroundColor: colors.background,
  flex: 1,
}

const $logoContainer: ViewStyle = {
  alignSelf: "flex-start",
  justifyContent: "center",
  height: 56,
  paddingHorizontal: spacing.lg,
}
