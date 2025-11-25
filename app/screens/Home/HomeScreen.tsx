import { PDFOptionsBottomSheet, Screen } from "app/components"
import { useSoundPlayer } from "app/hooks/useAudio"
import { usePdfOptionsBottomSheet } from "app/hooks/usePdfOptionsBottomSheet"
import { useStores } from "app/models"
import MiqaatList from "app/screens/components/MiqaatList"
import { Asset } from "expo-asset"
import { observer } from "mobx-react-lite"
import React, { FC, ReactElement, useCallback, useEffect, useRef, useState } from "react"
import { View, ViewStyle, SectionList, NativeScrollEvent, NativeSyntheticEvent } from "react-native"
import { Drawer } from "react-native-drawer-layout"
import { RefreshControl } from "react-native-gesture-handler"
import SoundPlayer from "react-native-sound-player"

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
  const [, setIsInitialLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const tonePlaybackLock = useRef(false)
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

  const dailyDuas = [...pinnedItems, ...libraryStore.homeData]

  const fetchMiqaats = useCallback(async () => {
    await miqaatStore.fetchMiqaats()
  }, [miqaatStore])

  const fetchHomeLibrary = useCallback(async () => {
    await libraryStore.fetchHomeData()
    await dataStore.fetchQiyam()
    await libraryStore.fetchList()
  }, [dataStore, libraryStore])

  const fetchData = useCallback(async () => {
    await fetchMiqaats()
    await fetchHomeLibrary()
  }, [fetchHomeLibrary, fetchMiqaats])

  const playLoadingTone = useCallback(async () => {
    if (tonePlaybackLock.current) return
    tonePlaybackLock.current = true
    try {
      const toneAsset = Asset.fromModule(require("assets/audio/quick-ting.mp3"))
      if (!toneAsset.localUri) {
        await toneAsset.downloadAsync()
      }
      const uri = toneAsset.localUri ?? toneAsset.uri
      if (uri) {
        SoundPlayer.playUrl(uri)
      }
    } catch (error) {
      console.warn("Unable to play loading tone", error)
    } finally {
      tonePlaybackLock.current = false
    }
  }, [])

  useEffect(() => {
    ;(async function load() {
      await dataStore.loadPinnedPdfs()
      await dataStore.loadPdfHistory?.()
    })()
  }, [dataStore])

  useEffect(() => {
    return () => timeout.current && clearTimeout(timeout.current)
  }, [])

  useEffect(() => {
    let isMounted = true
    ;(async () => {
      try {
        await fetchData()
      } catch (error) {
        console.warn("Failed to load home data", error)
      } finally {
        if (isMounted) {
          setIsInitialLoading(false)
          // await playLoadingTone()
        }
      }
    })()
    return () => {
      isMounted = false
    }
  }, [fetchData, playLoadingTone])

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true)
    try {
      await fetchData()
      await playLoadingTone()
    } catch (error) {
      console.warn("Failed to refresh home data", error)
    } finally {
      setIsRefreshing(false)
    }
  }, [fetchData, playLoadingTone])

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
                colors={[colors.palette.primary500]}
                refreshing={isRefreshing}
                onRefresh={handleRefresh}
                progressBackgroundColor={colors.palette.primary100}
                progressViewOffset={10}
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
                      title="Daily Ibadat & Hafti"
                      key="daily-duas"
                      showOptions={true}
                      onViewAll={() => {
                        props.navigation.navigate("DuaList", {
                          album: {
                            id: "daily-ibadat",
                            title: "Daily Ibadat & Hafti",
                            description: "Daily Ibadat & Hafti",
                            count: 0,
                          },
                        })
                      }}
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
  flex: 1,
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
