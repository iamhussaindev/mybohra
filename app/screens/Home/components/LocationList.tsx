import BottomSheet, {
  BottomSheetFlatList,
  BottomSheetSectionList,
  SCREEN_HEIGHT,
} from "@gorhom/bottom-sheet"
import { IconCurrentLocationFilled } from "@tabler/icons-react-native"
import { Icon, Text, Button } from "app/components"
import { shadowProps } from "app/helpers/shadow.helper"
import { useStores } from "app/models"
import { ILocation } from "app/models/DataStore"
import { colors, spacing, typography } from "app/theme"
import { PlainLocation } from "app/types/location"
import Fuse from "fuse.js"
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { ImageStyle, Pressable, TextInput, TextStyle, View, ViewStyle } from "react-native"
import GetLocation from "react-native-get-location"

// Helper function to convert MST instance to plain object
const toPlainLocation = (location: ILocation): PlainLocation => ({
  latitude: location.latitude,
  longitude: location.longitude,
  city: location.city,
  country: location.country,
  state: location.state,
  timezone: location.timezone,
  type: location.type,
})

const LocationList = React.memo(
  ({
    list,
    sheetRef,
    handleItemClick,
  }: {
    list: ILocation[]
    sheetRef: React.RefObject<BottomSheet>
    handleItemClick: (item: PlainLocation) => void
  }) => {
    const [search, setSearch] = useState("")
    const { dataStore } = useStores()

    const $searchRef = useRef<TextInput>(null)
    // Convert list to plain objects for Fuse search
    const plainList = useMemo(() => list.map(toPlainLocation), [list])

    console.log("plainList", plainList)

    const fuse = useMemo(
      () =>
        new Fuse(plainList, {
          keys: [
            {
              name: "city",
              weight: 2,
            },
            {
              name: "country",
              weight: 1,
            },
            {
              name: "state",
              weight: 1,
            },
          ],
          threshold: 0.2,
        }),
      [plainList],
    )

    // // Expand the bottom sheet when the component mounts
    useEffect(() => {
      sheetRef.current?.expand()
    }, [sheetRef])

    // Reset search when component unmounts or sheet closes
    useEffect(() => {
      return () => {
        setSearch("")
        $searchRef.current?.blur()
      }
    }, [])

    // Reset function to clear search and blur input
    const resetSearch = useCallback(() => {
      setSearch("")
      $searchRef.current?.blur()
    }, [])

    // Handle auto-detect location
    const handleAutoDetect = useCallback(async () => {
      try {
        // Get current device location
        const location = await GetLocation.getCurrentPosition({
          enableHighAccuracy: true,
          timeout: 15000,
        })

        // Use the new autoDetectLocation method that always updates current location
        await dataStore.autoDetectLocation(location.latitude, location.longitude)

        // Close the bottom sheet
        sheetRef.current?.close()
      } catch (error) {
        console.error("Error auto-detecting location:", error)
        // You could show an error message here
      }
    }, [dataStore, sheetRef])

    const renderLocationItem = useCallback(
      ({ item }: { item: PlainLocation }) => (
        <Pressable
          style={$locationItem}
          onPress={() => {
            // Blur keyboard first to prevent double-tap issue
            $searchRef.current?.blur()
            // Small delay to ensure keyboard is dismissed before handling selection
            setTimeout(() => {
              handleItemClick(item)
            }, 100)
          }}
        >
          <Text
            style={$locationText}
            text={`${item.city}, ${item.country}`}
            weight="medium"
            size="md"
          />
        </Pressable>
      ),
      [handleItemClick],
    )

    const renderEmptyComponent = useCallback(
      () =>
        search.length > 0 ? (
          <View style={$emptyContainer}>
            <Text style={$emptyText} text="No locations found" weight="normal" size="md" />
            <Text
              style={$emptySubText}
              text="Try a different search term"
              weight="normal"
              size="sm"
            />
          </View>
        ) : (
          <View style={$initialContainer}>
            <Icon icon="search" size={60} style={$searchIcon} color={colors.textDim} />
            <Text
              style={$initialText}
              text="No saved locations available"
              weight="normal"
              size="xs"
            />
            <Text
              style={$emptySubText}
              text="Use auto-detect or search for a location"
              weight="normal"
              size="sm"
            />
          </View>
        ),
      [search],
    )

    const keyExtractor = useCallback(
      (item: PlainLocation) => `${item.latitude}-${item.longitude}-${item.city}-${item.country}`,
      [],
    )

    const results = useMemo(() => {
      if (search.length > 0) {
        // Show search results
        return fuse.search(search).map((res) => res.item)
      } else {
        // Show saved/current locations when no search
        const savedLocations: PlainLocation[] = []

        // Add current location if it exists
        if (dataStore.currentLocation && dataStore.currentLocationLoaded) {
          savedLocations.push(toPlainLocation(dataStore.currentLocation))
        }

        // Add device location if different from current
        if (dataStore.deviceLocation && dataStore.deviceLocationLoaded) {
          const isDeviceDifferent =
            !dataStore.currentLocation ||
            dataStore.currentLocation.latitude !== dataStore.deviceLocation.latitude ||
            dataStore.currentLocation.longitude !== dataStore.deviceLocation.longitude

          if (isDeviceDifferent) {
            savedLocations.push(toPlainLocation(dataStore.deviceLocation))
          }
        }

        // past selected locations
        const pastSelectedLocations = dataStore.pastSelectedLocations.map(toPlainLocation)
        // deduplicate past selected locations
        const deduplicatedPastSelectedLocations = pastSelectedLocations.filter(
          (location, index, self) =>
            index ===
            self.findIndex(
              (t) => t.latitude === location.latitude && t.longitude === location.longitude,
            ),
        )

        const finalLocations = [...savedLocations, ...deduplicatedPastSelectedLocations]
        const finalLocationsDeduplicated = finalLocations.filter(
          (location, index, self) =>
            index ===
            self.findIndex(
              (t) => t.latitude === location.latitude && t.longitude === location.longitude,
            ),
        )

        // Combine saved locations first, then others (limit to first 20 for performance)
        return finalLocationsDeduplicated.slice(0, 20)
      }
    }, [
      search,
      fuse,
      plainList,
      dataStore.currentLocation,
      dataStore.currentLocationLoaded,
      dataStore.deviceLocation,
      dataStore.deviceLocationLoaded,
      dataStore.pastSelectedLocations,
    ])

    const renderHeader = useCallback(
      () => (
        <View style={$headerContainer}>
          <Pressable
            onPress={() => {
              resetSearch()
              sheetRef.current?.close()
            }}
            style={$header}
          >
            <Icon icon="caretLeft" size={24} style={$caret} color={colors.text} />
            <Text style={$title} text="Select Location" weight="bold" size="md" />
          </Pressable>
          <View style={$searchContainer}>
            <Icon icon="search" size={20} style={$searchIcon} color={colors.textDim} />
            <TextInput
              ref={$searchRef}
              value={search}
              style={$searchField}
              placeholder="eg: Ahmedabad"
              placeholderTextColor={colors.palette.neutral300}
              onChangeText={setSearch}
              autoCorrect={false}
              autoCapitalize="none"
              returnKeyType="search"
              blurOnSubmit={false}
              clearButtonMode="while-editing"
            />
          </View>
          <View style={$autoDetectContainer}>
            <Button
              preset="default"
              text="Auto Detect Location"
              onPress={handleAutoDetect}
              style={$autoDetectButton}
              textStyle={$autoDetectButtonText}
              LeftAccessory={() => (
                <IconCurrentLocationFilled
                  color={colors.palette.neutral100}
                  style={$autoDetectButtonIcon}
                  size={20}
                />
              )}
            />
          </View>
        </View>
      ),
      [search, resetSearch, handleAutoDetect],
    )

    return (
      <BottomSheetSectionList
        style={$sectionListContentContainer}
        showsVerticalScrollIndicator={false}
        stickySectionHeadersEnabled
        keyboardShouldPersistTaps="always"
        sections={[
          {
            name: "search",
            data: [renderHeader()],
          },
          {
            name: "Locations",
            data: [
              <BottomSheetFlatList
                key="Locations"
                style={$listContainer}
                contentContainerStyle={$listContentContainer}
                showsVerticalScrollIndicator={false}
                data={results}
                renderItem={renderLocationItem}
                keyExtractor={keyExtractor}
                ListEmptyComponent={renderEmptyComponent}
                stickyHeaderIndices={[0]}
                keyboardShouldPersistTaps="always"
                removeClippedSubviews={false}
              />,
            ],
          },
        ]}
        renderItem={({ item }) => item}
      />
    )
  },
  (prevProps, nextProps) => {
    return prevProps.list.length === nextProps.list.length
  },
)

LocationList.displayName = "LocationList"

const $initialContainer: ViewStyle = {
  padding: spacing.xl,
  alignItems: "center",
  flex: 1,
  justifyContent: "center",
  height: SCREEN_HEIGHT - 300,
}

const $initialText: TextStyle = {
  color: colors.palette.neutral500,
  textAlign: "center",
  marginTop: spacing.xl,
  fontSize: 14,
  fontWeight: "normal",
}

const $searchField: TextStyle = {
  flex: 1,
  fontFamily: typography.primary.medium,
  fontSize: 16,
  color: colors.text,
  backgroundColor: colors.palette.neutral100,
  paddingEnd: spacing.md,
  paddingVertical: spacing.sm,
  margin: 0,
}

const $caret: ImageStyle = {
  transform: [{ rotate: "-90deg" }],
  marginRight: spacing.xs,
}

const $header: ViewStyle = {
  flexDirection: "row",
  justifyContent: "flex-start",
  alignItems: "center",
  paddingVertical: spacing.xs,
}

const $listContainer: ViewStyle = {
  flex: 1,
  backgroundColor: colors.background,
}

const $listContentContainer: ViewStyle = {
  flexGrow: 1,
}

const $headerContainer: ViewStyle = {
  backgroundColor: colors.background,
  paddingTop: spacing.lg,
  paddingHorizontal: spacing.lg,
  paddingBottom: spacing.md,
  borderBottomWidth: 1,
  borderBottomColor: colors.border,
}

const $searchContainer: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  backgroundColor: colors.palette.neutral100,
  marginTop: spacing.sm,
  borderWidth: 1,
  paddingHorizontal: spacing.md,
  borderColor: colors.palette.neutral300,
  ...shadowProps,
  borderRadius: spacing.sm,
}

const $searchIcon: ImageStyle = {
  marginRight: spacing.sm,
}

const $autoDetectContainer: ViewStyle = {
  marginTop: spacing.sm,
}

const $autoDetectButtonIcon: ImageStyle = {
  marginRight: spacing.sm,
}

const $autoDetectButton: ViewStyle = {
  backgroundColor: colors.palette.primary500,
  borderRadius: 8,
  paddingHorizontal: spacing.md,
  marginBottom: spacing.md,
  height: 40,
}

const $autoDetectButtonText: TextStyle = {
  color: colors.palette.neutral100,
  fontSize: 14,
  fontWeight: "500",
}

const $sectionListContentContainer: ViewStyle = {
  backgroundColor: colors.palette.neutral100,
}

const $emptyContainer: ViewStyle = {
  padding: spacing.xl,
  alignItems: "center",
}

const $emptyText: TextStyle = {
  color: colors.textDim,
  textAlign: "center",
}

const $emptySubText: TextStyle = {
  color: colors.textDim,
  textAlign: "center",
  marginTop: spacing.xs,
  opacity: 0.7,
}

const $title: TextStyle = {
  fontSize: 18,
  fontWeight: "bold",
  color: colors.text,
}

export const $handleIndicatorStyle: ViewStyle = {
  backgroundColor: colors.palette.neutral100,
}

const $locationItem: ViewStyle = {
  paddingVertical: spacing.sm,
  paddingHorizontal: spacing.lg,
  borderBottomWidth: 1,
  borderBottomColor: colors.border,
}

const $locationText: TextStyle = {
  color: colors.text,
  marginBottom: spacing.xxs,
  fontSize: 16,
}

export default LocationList
