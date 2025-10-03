import { Screen, AnalyticsDebugger } from "app/components"
import { useAnalytics } from "app/hooks/useAnalytics"
import { useSoundPlayer } from "app/hooks/useAudio"
import { useRealtimeMonitoring } from "app/hooks/useRealtimeMonitoring"
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
  const [showDebugger, setShowDebugger] = useState(false)
  const timeout = useRef<ReturnType<typeof setTimeout>>()
  const $drawerInsets = useSafeAreaInsetsStyle(["top"])
  const [showBorder, setShowBorder] = useState(false)
  const [shadowOffset, setShadowOffset] = useState(0)
  const { openLocationBottomSheet } = useLocationBottomSheet()

  const { dataStore, miqaatStore, libraryStore, reminderStore } = useStores()
  const { currentSound } = useSoundPlayer()

  // Get pinned items and merge with daily duas
  const pinnedItems = libraryStore.getItemsByIds(dataStore.pinnedPdfIds)

  // remove pinnedItems from combinedDailyDuas
  const dailyDuas = libraryStore.homeData.filter((item) => !pinnedItems.includes(item))

  // Analytics and monitoring
  const { trackDrawerOpened, trackDrawerClosed } = useAnalytics({
    screenName: "Home",
    trackScreenView: true,
  })

  const { trackFeatureUsage: trackRealtimeFeature } = useRealtimeMonitoring({
    screenName: "Home",
    trackPageViews: true,
    trackUserActivities: true,
  })

  const fetchMiqaats = async () => {
    await miqaatStore.fetchMiqaats()
  }

  const fetchHomeLibrary = async () => {
    await libraryStore.fetchHomeData()
  }

  const fetchData = async () => {
    await fetchMiqaats()
    await fetchHomeLibrary()
  }

  useEffect(() => {
    ;(async function load() {
      await dataStore.fetchQiyam()
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
    <Drawer
      open={open}
      onOpen={() => {
        setOpen(true)
        trackDrawerOpened()
        trackRealtimeFeature("drawer_opened")
      }}
      onClose={() => {
        setOpen(false)
        trackDrawerClosed()
        trackRealtimeFeature("drawer_closed")
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
          onLongPress={__DEV__ ? () => setShowDebugger(true) : undefined}
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
              data: [dataStore.qiyamLoaded ? <CurrentQiyam qiyam={dataStore.qiyam} /> : null],
            },
            {
              name: "Bookmark & Pinned",
              description: "Bookmark & Pinned",
              key: "bookmark-pinned",
              data: [
                pinnedItems.length > 0 ? (
                  <DuaGridList
                    navigation={props.navigation}
                    items={pinnedItems}
                    currentSound={currentSound}
                    pinnedIds={dataStore.pinnedPdfIds}
                    title="Bookmark & Pinned"
                    key="daily-duas"
                    showOptions={false}
                  />
                ) : null,
              ],
            },
            {
              name: "Daily Duas",
              description: "daily duas",
              data: [
                <DuaGridList
                  navigation={props.navigation}
                  items={dailyDuas}
                  currentSound={currentSound}
                  pinnedIds={dataStore.pinnedPdfIds}
                  title="Duas for Today"
                  key="daily-duas"
                  showOptions={false}
                />,
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

      {__DEV__ && (
        <AnalyticsDebugger visible={showDebugger} onClose={() => setShowDebugger(false)} />
      )}
    </Drawer>
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
