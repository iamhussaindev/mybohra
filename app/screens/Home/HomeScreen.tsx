import { observer } from "mobx-react-lite"
import React, { FC, ReactElement, useEffect, useRef, useState } from "react"
import { View, ViewStyle, SectionList, NativeScrollEvent, NativeSyntheticEvent } from "react-native"
import { Screen } from "app/components"
import { isRTL } from "../../i18n"
import { AppStackScreenProps } from "../../navigators"
import { colors, spacing } from "../../theme"
import { useSafeAreaInsetsStyle } from "../../utils/useSafeAreaInsetsStyle"
import { Drawer } from "react-native-drawer-layout"
import { Header } from "./components/Header"
import CurrentQiyam from "./components/CurrentQiyam"
import HeroIcons from "./components/HeroIcons"
import GridIcons from "./components/GridIcons"
import { useStores } from "app/models"
import MiqaatList from "app/screens/components/MiqaatList"

import DailyDuas from "./components/DailyDuas"
import NamazUI from "./components/NamazUI"
import { RefreshControl } from "react-native-gesture-handler"
import { useSoundPlayer } from "app/hooks/useAudio"
import SoundPlayerHome from "./components/SoundPlayerHome"
import RamazaanNiyyat from "./components/RamazaanNiyyat"
import { useLocationBottomSheet } from "../../contexts/LocationBottomSheetContext"

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

  const { dataStore, miqaatStore, libraryStore } = useStores()
  const { currentSound } = useSoundPlayer()

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
      }}
      onClose={() => setOpen(false)}
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
              data: [<NamazUI key="namaz-times" />],
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
              name: "Daily Duas",
              description: "daily duas",
              data: [
                <DailyDuas
                  navigation={props.navigation}
                  items={libraryStore.homeData}
                  currentSound={currentSound}
                  key="daily-duas"
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
    </Drawer>
  )
})

const $sectionListContentContainer: ViewStyle = {
  paddingHorizontal: 0,
}

const $screenContainer: ViewStyle = {
  paddingBottom: 56,
}

const $drawer: ViewStyle = {
  backgroundColor: colors.background,
  flex: 1,
}

// const $logoImage: ImageStyle = {
//   height: 42,
//   width: 77,
// }

const $logoContainer: ViewStyle = {
  alignSelf: "flex-start",
  justifyContent: "center",
  height: 56,
  paddingHorizontal: spacing.lg,
}
