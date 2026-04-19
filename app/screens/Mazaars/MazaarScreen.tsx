import { IconImageInPicture, IconSearch } from "@tabler/icons-react-native"
import { Screen, Text } from "app/components"
import Header from "app/components/Header"
import { useLocationCoords } from "app/hooks/useLocationCoords"
import { useStores } from "app/models"
import type { AppStackScreenProps } from "app/navigators"
import { spacing } from "app/theme"
import { useColors } from "app/theme/useColors"
import { haversineDistanceKm } from "app/utils/geoDistance"
import { observer } from "mobx-react-lite"
import React, { useEffect, useState, useMemo } from "react"
import {
  ViewStyle,
  FlatList,
  View,
  ActivityIndicator,
  Image,
  ImageStyle,
  TextStyle,
  RefreshControl,
  Pressable,
} from "react-native"

type MazaarScreenProps = AppStackScreenProps<"Mazaar">

interface PlainMazaar {
  id: string
  name: string
  lat: number | null
  lng: number | null
  contact: string | null
  photos: string[] | null
  website: string | null
  social_media: string[] | null
  location: {
    id: number
    city: string
    state: string | null
    country: string
    latitude: number
    longitude: number
  } | null
  distance?: number
}

interface MazaarCardProps {
  mazaar: PlainMazaar
  onPress?: () => void
}

const MazaarCard: React.FC<MazaarCardProps> = ({ mazaar }) => {
  const colors = useColors()
  const imageUrl = mazaar.photos && mazaar.photos.length > 0 ? mazaar.photos[0] : null

  return (
    <View style={[$card(), { backgroundColor: colors.background }]}>
      {/* Square image on left */}
      <View style={$imageContainer}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={$image} resizeMode="cover" />
        ) : (
          <View style={[$image, $placeholderImage, { backgroundColor: colors.palette.neutral300 }]}>
            <IconImageInPicture size={24} color={colors.palette.neutral500} />
          </View>
        )}
      </View>

      {/* Content on right */}
      <View style={$contentContainer}>
        <Text style={[$name, { color: colors.text }]} weight="bold" numberOfLines={2}>
          {mazaar.name}
        </Text>
        {/* <Text style={[$address, { color: colors.textDim }]} size="sm" numberOfLines={2}>
          {mazaar.distance ? `${mazaar.distance}km away` : "Unknown distance"}
        </Text> */}

        {/* Address from location */}
        {mazaar.location && (
          <Text style={[$address, { color: colors.textDim }]} size="sm" numberOfLines={2}>
            {[mazaar.location.city, mazaar.location.state, mazaar.location.country]
              .filter(Boolean)
              .join(", ")}
          </Text>
        )}
      </View>
    </View>
  )
}

export const MazaarScreen: React.FC<MazaarScreenProps> = observer(function MazaarScreen() {
  const colors = useColors()
  const { informationStore } = useStores()
  const locationCoords = useLocationCoords()

  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  // Fetch mazaars
  const loadMazaars = async () => {
    setLoading(true)
    try {
      await informationStore.fetchMazaars()
    } catch (error) {
      console.error("Error loading mazaars:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMazaars()
  }, [])

  // Sort mazaars by distance from current location
  const sortedMazaars = useMemo(() => {
    const mazaars = informationStore.allMazaars

    // Convert MST nodes to plain objects to avoid tree detachment issues
    const plainMazaars = mazaars.map((mazaar) => ({
      id: mazaar.id,
      name: mazaar.name,
      lat: mazaar.lat,
      lng: mazaar.lng,
      contact: mazaar.contact,
      photos: mazaar.photos ? [...(mazaar.photos || [])] : null,
      website: mazaar.website,
      social_media: mazaar.social_media ? [...(mazaar.social_media || [])] : null,
      location: mazaar.location
        ? {
            id: mazaar.location.id,
            city: mazaar.location.city,
            state: mazaar.location.state,
            country: mazaar.location.country,
            latitude: mazaar.location.latitude,
            longitude: mazaar.location.longitude,
          }
        : null,
    }))

    if (!locationCoords) {
      // If no location, return unsorted
      return plainMazaars.map((m) => ({ ...m, distance: undefined }))
    }

    // Calculate distances and sort
    const mazaarsWithDistanceInKilometers = plainMazaars
      .map((mazaar) => {
        if (mazaar.location?.latitude === null || mazaar.location?.longitude === null) {
          return { ...mazaar, distance: undefined }
        }

        const distance = haversineDistanceKm(
          locationCoords.latitude,
          locationCoords.longitude,
          mazaar.location?.latitude ?? 0,
          mazaar.location?.longitude ?? 0,
        )
          .toFixed(0)
          .toString()

        return { ...mazaar, distance }
      })
      .sort((a, b) => {
        // Sort by distance (undefined distances go to end)
        if (a.distance === undefined && b.distance === undefined) return 0
        if (a.distance === undefined) return 1
        if (b.distance === undefined) return -1
        return Number(a.distance) - Number(b.distance)
      })

    return mazaarsWithDistanceInKilometers
  }, [informationStore.allMazaars, locationCoords])

  const onRefresh = async () => {
    console.log("onRefresh")
    setRefreshing(true)
    await loadMazaars()
    setRefreshing(false)
  }

  const handleMazaarPress = (mazaar: PlainMazaar) => {
    // TODO: Navigate to mazaar detail screen if needed
    console.log("Pressed mazaar:", mazaar.name)
  }

  const renderMazaarCard = ({ item }: { item: PlainMazaar }) => (
    <MazaarCard mazaar={item} onPress={() => handleMazaarPress(item)} />
  )

  return (
    <Screen
      statusBarStyle="dark"
      preset="fixed"
      backgroundColor={colors.background}
      safeAreaEdges={["top"]}
      contentContainerStyle={$screen}
    >
      <Header
        rightActions={
          <Pressable
            onPress={() => {
              console.log("search")
            }}
            style={$searchButton}
            hitSlop={8}
          >
            <IconSearch color={colors.text} size={24} />
          </Pressable>
        }
        title="Mazaar List"
        showBackButton={true}
      />

      {loading ? (
        <View style={$loadingContainer}>
          <ActivityIndicator size="large" color={colors.tint} />
        </View>
      ) : sortedMazaars.length === 0 ? (
        <View style={$emptyContainer}>
          <Text style={[$emptyText, { color: colors.textDim }]}>No mazaars found</Text>
        </View>
      ) : (
        <FlatList
          data={sortedMazaars as PlainMazaar[]}
          renderItem={renderMazaarCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={$listContent()}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        />
      )}
    </Screen>
  )
})

const $screen: ViewStyle = {
  flex: 1,
}

const $loadingContainer: ViewStyle = {
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
}

const $emptyContainer: ViewStyle = {
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  padding: spacing.lg,
}

const $emptyText: TextStyle = {
  // ...typography.bodyLarge,
}

const $listContent = (): ViewStyle => ({
  padding: spacing.md,
  paddingBottom: spacing.xl,
})

const $card = (): ViewStyle => ({
  flexDirection: "row",
  borderRadius: spacing.md,
  marginBottom: spacing.md,
  padding: spacing.xxs,
})

const $imageContainer: ViewStyle = {
  marginRight: spacing.md,
}

const $image: ImageStyle = {
  width: 80,
  height: 80,
  borderRadius: spacing.xs,
}

const $placeholderImage: ViewStyle = {
  justifyContent: "center",
  alignItems: "center",
}

const $contentContainer: ViewStyle = {
  flex: 1,
  justifyContent: "center",
  alignItems: "flex-start",
}

const $name: TextStyle = {
  fontSize: 18,
}

const $address: TextStyle = {
  marginBottom: spacing.xxs,
}

const $searchButton: ViewStyle = {
  padding: spacing.xs,
}
