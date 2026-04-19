import { IconArrowLeft } from "@tabler/icons-react-native"
import { Screen, Text } from "app/components"
import type { AppStackScreenProps } from "app/navigators"
import { apiSupabase } from "app/services/api"
import type { Database } from "app/services/supabase/types"
import { spacing } from "app/theme"
import { useColors } from "app/theme/useColors"
import { observer } from "mobx-react-lite"
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
  ActivityIndicator,
  FlatList,
  Image,
  ImageStyle,
  ListRenderItem,
  Pressable,
  ScrollView,
  StyleSheet,
  TextStyle,
  View,
  ViewStyle,
} from "react-native"
import { LinearGradient } from "react-native-linear-gradient"
import PagerView from "react-native-pager-view"
import { useSafeAreaInsets } from "react-native-safe-area-context"

type NearbyPlaceRow = Database["public"]["Tables"]["nearby_places"]["Row"] & { distance?: number }
type ZiyaratNearRow = Database["public"]["Tables"]["ziyarat"]["Row"] & { distanceKm: number }

const HERO_HEIGHT = 200
const AT_MAZAR_MAX_KM = 0.25
const NEARBY_ZIYARAT_MAX_KM = 25
const NEARBY_PLACES_RADIUS_M = 30_000

/** `nearby_places.category` values used in Supabase; extend to match your dataset. */
const NEARBY_CATEGORIES_HALAL_FOOD = [
  "restaurant",
  "food",
  "cafe",
  "meal_takeaway",
  "bakery",
  "halal",
]
const NEARBY_CATEGORIES_SHOPS = [
  "store",
  "shopping_mall",
  "pharmacy",
  "bank",
  "atm",
  "car_dealer",
  "gas_station",
]
const NEARBY_CATEGORIES_PLACES = [
  "tourist_attraction",
  "train_station",
  "transit_station",
  "subway_station",
  "museum",
  "park",
  "lodging",
  "mosque",
  "hospital",
  "library",
  "place_of_worship",
]

const TABS = ["Ziyarat", "Halal food", "Shops & business", "Places"] as const

function categorizeNearbyPlaces(rows: NearbyPlaceRow[]): {
  halal: NearbyPlaceRow[]
  shops: NearbyPlaceRow[]
  places: NearbyPlaceRow[]
} {
  const halal: NearbyPlaceRow[] = []
  const shops: NearbyPlaceRow[] = []
  const other: NearbyPlaceRow[] = []

  for (const p of rows) {
    const cat = (p.category || "").toLowerCase()
    const name = (p.name || "").toLowerCase()
    const hay = `${cat} ${name}`

    if (
      /halal|food|restaurant|cafe|dining|kitchen|meal|biryani|thali|snack|juice|coffee|tea/.test(
        hay,
      )
    ) {
      halal.push(p)
    } else if (/shop|store|business|market|retail|bazaar|mall|boutique|pharmacy|bank|atm/.test(hay)) {
      shops.push(p)
    } else {
      other.push(p)
    }
  }

  return { halal, shops, places: other }
}

function distanceMetersLabel(m?: number): string {
  if (m == null || !Number.isFinite(m)) return ""
  if (m < 1000) return `${Math.round(m)} m`
  return `${(m / 1000).toFixed(1)} km`
}

function mergePlacesById(primary: NearbyPlaceRow[], fallback: NearbyPlaceRow[]): NearbyPlaceRow[] {
  const byId = new Map<number, NearbyPlaceRow>()
  for (const p of primary) {
    byId.set(p.id, p)
  }
  for (const p of fallback) {
    if (!byId.has(p.id)) byId.set(p.id, p)
  }
  return [...byId.values()].sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0))
}

type MazarDetailScreenProps = AppStackScreenProps<"MazarDetail">

export const MazarDetailScreen = observer(function MazarDetailScreen({ route, navigation }: MazarDetailScreenProps) {
  const colors = useColors()
  const insets = useSafeAreaInsets()
  const pagerRef = useRef<PagerView>(null)
  const { name, imageUri, latitude, longitude, city } = route.params

  const [tabIndex, setTabIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [ziyaratAt, setZiyaratAt] = useState<ZiyaratNearRow[]>([])
  const [ziyaratNear, setZiyaratNear] = useState<ZiyaratNearRow[]>([])
  const [halalPlaces, setHalalPlaces] = useState<NearbyPlaceRow[]>([])
  const [shopPlaces, setShopPlaces] = useState<NearbyPlaceRow[]>([])
  const [otherPlaces, setOtherPlaces] = useState<NearbyPlaceRow[]>([])

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [zRes, allPlacesRes, halalRes, shopsRes, placesRes] = await Promise.all([
        apiSupabase.fetchZiyaratsNear({
          latitude,
          longitude,
          maxRadiusKm: NEARBY_ZIYARAT_MAX_KM,
          city: city || undefined,
          fetchLimit: 500,
          resultLimit: 100,
        }),
        apiSupabase.fetchNearbyPlaces({
          latitude,
          longitude,
          radius: NEARBY_PLACES_RADIUS_M,
          limit: 350,
        }),
        apiSupabase.fetchNearbyPlaces({
          latitude,
          longitude,
          radius: NEARBY_PLACES_RADIUS_M,
          categories: NEARBY_CATEGORIES_HALAL_FOOD,
          limit: 120,
        }),
        apiSupabase.fetchNearbyPlaces({
          latitude,
          longitude,
          radius: NEARBY_PLACES_RADIUS_M,
          categories: NEARBY_CATEGORIES_SHOPS,
          limit: 120,
        }),
        apiSupabase.fetchNearbyPlaces({
          latitude,
          longitude,
          radius: NEARBY_PLACES_RADIUS_M,
          categories: NEARBY_CATEGORIES_PLACES,
          limit: 120,
        }),
      ])

      if (zRes.kind !== "ok") {
        setError("Could not load ziyarat.")
        setZiyaratAt([])
        setZiyaratNear([])
      } else {
        const at = zRes.data.filter((z) => z.distanceKm <= AT_MAZAR_MAX_KM)
        const near = zRes.data.filter((z) => z.distanceKm > AT_MAZAR_MAX_KM)
        setZiyaratAt(at)
        setZiyaratNear(near)
      }

      const allRows =
        allPlacesRes.kind === "ok" ? (allPlacesRes.data as NearbyPlaceRow[]) : []
      const heuristic = categorizeNearbyPlaces(allRows)

      const halalApi = halalRes.kind === "ok" ? (halalRes.data as NearbyPlaceRow[]) : []
      const shopsApi = shopsRes.kind === "ok" ? (shopsRes.data as NearbyPlaceRow[]) : []
      const placesApi = placesRes.kind === "ok" ? (placesRes.data as NearbyPlaceRow[]) : []

      setHalalPlaces(mergePlacesById(halalApi, heuristic.halal))
      setShopPlaces(mergePlacesById(shopsApi, heuristic.shops))
      setOtherPlaces(mergePlacesById(placesApi, heuristic.places))
    } catch (e) {
      setError("Something went wrong.")
    } finally {
      setLoading(false)
    }
  }, [latitude, longitude, city])

  useEffect(() => {
    load()
  }, [load])

  const onTabPress = useCallback((index: number) => {
    setTabIndex(index)
    pagerRef.current?.setPage(index)
  }, [])

  const onPageSelected = useCallback((e: { nativeEvent: { position: number } }) => {
    setTabIndex(e.nativeEvent.position)
  }, [])

  const renderZiyaratRow: ListRenderItem<ZiyaratNearRow> = useCallback(
    ({ item }) => (
      <View style={[$row, { borderBottomColor: colors.border }]}>
        <Text weight="medium" color={colors.text} text={item.name} numberOfLines={2} />
        {item.city ? (
          <Text preset="formHelper" color={colors.textDim} text={item.city} numberOfLines={1} />
        ) : null}
        <Text preset="formHelper" color={colors.palette.primary500} text={`${item.distanceKm.toFixed(1)} km`} />
      </View>
    ),
    [colors],
  )

  const renderPlaceRow: ListRenderItem<NearbyPlaceRow> = useCallback(
    ({ item }) => (
      <View style={[$row, { borderBottomColor: colors.border }]}>
        <Text weight="medium" color={colors.text} text={item.name} numberOfLines={2} />
        {item.address || item.city ? (
          <Text
            preset="formHelper"
            color={colors.textDim}
            text={[item.address, item.city].filter(Boolean).join(" · ")}
            numberOfLines={2}
          />
        ) : null}
        {item.category ? (
          <Text preset="formHelper" color={colors.textDim} text={item.category} numberOfLines={1} />
        ) : null}
        <Text preset="formHelper" color={colors.palette.primary500} text={distanceMetersLabel(item.distance)} />
      </View>
    ),
    [colors],
  )

  const ziyaratTab = useMemo(
    () => (
      <ScrollView
        style={$tabScroll}
        contentContainerStyle={$tabScrollContent}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <ActivityIndicator style={$tabLoading} color={colors.tint} />
        ) : (
          <>
            <Text preset="formLabel" weight="bold" color={colors.text} style={$sectionTitle} text="At this mazar" />
            {ziyaratAt.length === 0 ? (
              <Text preset="formHelper" color={colors.textDim} text="No ziyarat listed within a short walk." />
            ) : (
              <FlatList
                data={ziyaratAt}
                keyExtractor={(item) => `at-${item.id}`}
                renderItem={renderZiyaratRow}
                scrollEnabled={false}
              />
            )}
            <Text preset="formLabel" weight="bold" color={colors.text} style={$sectionTitle} text="Nearby" />
            {ziyaratNear.length === 0 ? (
              <Text preset="formHelper" color={colors.textDim} text="No other ziyarat within 25 km." />
            ) : (
              <FlatList
                data={ziyaratNear}
                keyExtractor={(item) => `near-${item.id}`}
                renderItem={renderZiyaratRow}
                scrollEnabled={false}
              />
            )}
          </>
        )}
      </ScrollView>
    ),
    [colors, loading, ziyaratAt, ziyaratNear, renderZiyaratRow],
  )

  const halalTab = useMemo(
    () => (
      <FlatList
        style={$tabScroll}
        contentContainerStyle={$tabListContent}
        data={halalPlaces}
        keyExtractor={(item) => `h-${item.id}`}
        renderItem={renderPlaceRow}
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator style={$tabLoading} color={colors.tint} />
          ) : (
            <Text preset="formHelper" color={colors.textDim} text="No halal food spots found in this area yet." />
          )
        }
      />
    ),
    [halalPlaces, loading, colors, renderPlaceRow],
  )

  const shopsTab = useMemo(
    () => (
      <FlatList
        style={$tabScroll}
        contentContainerStyle={$tabListContent}
        data={shopPlaces}
        keyExtractor={(item) => `s-${item.id}`}
        renderItem={renderPlaceRow}
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator style={$tabLoading} color={colors.tint} />
          ) : (
            <Text preset="formHelper" color={colors.textDim} text="No shops or businesses found in this area yet." />
          )
        }
      />
    ),
    [shopPlaces, loading, colors, renderPlaceRow],
  )

  const placesTab = useMemo(
    () => (
      <FlatList
        style={$tabScroll}
        contentContainerStyle={$tabListContent}
        data={otherPlaces}
        keyExtractor={(item) => `p-${item.id}`}
        renderItem={renderPlaceRow}
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator style={$tabLoading} color={colors.tint} />
          ) : (
            <Text preset="formHelper" color={colors.textDim} text="No other places listed in this area yet." />
          )
        }
      />
    ),
    [otherPlaces, loading, colors, renderPlaceRow],
  )

  return (
    <Screen preset="fixed" backgroundColor={colors.background} safeAreaEdges={["top"]} style={$screen}>
      <View style={$heroShell}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={$heroImage} resizeMode="cover" />
        ) : (
          <View style={[$heroImage, { backgroundColor: colors.palette.neutral300 }]} />
        )}
        <LinearGradient
          pointerEvents="none"
          colors={["rgba(0,0,0,0.06)", "rgba(0,0,0,0.4)", "rgba(0,0,0,0.85)"]}
          locations={[0, 0.45, 1]}
          style={StyleSheet.absoluteFill}
        />
        <Pressable
          onPress={() => navigation.goBack()}
          style={[fabBack, { top: insets.top + spacing.xs }]}
          hitSlop={12}
        >
          <View style={$fabInner}>
            <IconArrowLeft size={22} color={colors.absoluteWhite} />
          </View>
        </Pressable>
        <View style={$heroTextBlock}>
          <Text preset="subheading" weight="bold" color={colors.absoluteWhite} numberOfLines={2} text={name} />
          {city ? (
            <Text preset="formHelper" color="rgba(255,255,255,0.85)" numberOfLines={1} text={city} />
          ) : null}
        </View>
      </View>

      {error ? (
        <Text preset="formHelper" color={colors.error} text={error} style={{ paddingHorizontal: spacing.lg }} />
      ) : null}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[$tabBar, { borderBottomColor: colors.border }]}
      >
        {TABS.map((label, index) => (
          <Pressable key={label} onPress={() => onTabPress(index)} style={$tabPill}>
            <Text
              weight={tabIndex === index ? "bold" : "medium"}
              color={tabIndex === index ? colors.palette.primary500 : colors.textDim}
              text={label}
              size="sm"
            />
            {tabIndex === index ? <View style={[$tabUnderline, { backgroundColor: colors.palette.primary500 }]} /> : null}
          </Pressable>
        ))}
      </ScrollView>

      <PagerView
        ref={pagerRef}
        style={$pager}
        initialPage={0}
        onPageSelected={onPageSelected}
      >
        <View key="0" style={$page}>
          {ziyaratTab}
        </View>
        <View key="1" style={$page}>
          {halalTab}
        </View>
        <View key="2" style={$page}>
          {shopsTab}
        </View>
        <View key="3" style={$page}>
          {placesTab}
        </View>
      </PagerView>
    </Screen>
  )
})

const $screen: ViewStyle = { flex: 1 }

const $heroShell: ViewStyle = {
  height: HERO_HEIGHT,
  width: "100%",
  position: "relative",
}

const $heroImage: ImageStyle = {
  ...StyleSheet.absoluteFillObject,
  width: "100%",
  height: "100%",
}

const fabBack: ViewStyle = {
  position: "absolute",
  left: spacing.md,
  zIndex: 2,
}

const $fabInner: ViewStyle = {
  width: 40,
  height: 40,
  borderRadius: 20,
  backgroundColor: "rgba(0,0,0,0.35)",
  alignItems: "center",
  justifyContent: "center",
}

const $heroTextBlock: ViewStyle = {
  position: "absolute",
  left: spacing.md,
  right: spacing.md,
  bottom: spacing.md,
  zIndex: 1,
}

const $tabBar: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  paddingVertical: spacing.sm,
  paddingHorizontal: spacing.sm,
  borderBottomWidth: StyleSheet.hairlineWidth,
  maxHeight: 52,
}

const $tabPill: ViewStyle = {
  marginRight: spacing.md,
  paddingBottom: spacing.xs,
}

const $tabUnderline: ViewStyle = {
  height: 2,
  borderRadius: 1,
  marginTop: 4,
}

const $pager: ViewStyle = {
  flex: 1,
}

const $page: ViewStyle = {
  flex: 1,
}

const $tabScroll: ViewStyle = {
  flex: 1,
}

const $tabScrollContent: ViewStyle = {
  paddingHorizontal: spacing.lg,
  paddingBottom: spacing.xl,
  paddingTop: spacing.sm,
}

const $tabListContent: ViewStyle = {
  paddingHorizontal: spacing.lg,
  paddingBottom: spacing.xl,
  paddingTop: spacing.sm,
}

const $tabLoading: ViewStyle = {
  marginTop: spacing.xl,
}

const $sectionTitle: TextStyle = {
  marginTop: spacing.md,
  marginBottom: spacing.sm,
}

const $row: ViewStyle = {
  paddingVertical: spacing.md,
  borderBottomWidth: StyleSheet.hairlineWidth,
}
