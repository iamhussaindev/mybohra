import { CachedImage, Screen, Text, ListView } from "app/components"
import Header from "app/components/Header"
import { useBusinesses } from "app/services/supabase/queries/business.query"
import { useBusinessStore } from "app/store"
import { spacing } from "app/theme"
import { useColors } from "app/theme/useColors"
import React, { useCallback, useMemo, useState } from "react"
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  TextInput,
  TextStyle,
  View,
  ViewStyle,
  ImageStyle,
} from "react-native"

export function MarketScreen() {
  const colors = useColors()
  const { categoryFilter, setCategoryFilter, searchQuery, setSearchQuery } = useBusinessStore()
  const { data: businesses = [], isLoading, refetch, isRefetching } = useBusinesses({ limit: 100 })
  const [refreshing, setRefreshing] = useState(false)

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    return businesses.filter((b) => {
      const matchesQuery =
        !q ||
        b.business_name.toLowerCase().includes(q) ||
        (b.description ?? "").toLowerCase().includes(q)
      const matchesCategory = categoryFilter === "all" || true
      return matchesQuery && matchesCategory
    })
  }, [businesses, searchQuery, categoryFilter])

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await refetch()
    setRefreshing(false)
  }, [refetch])

  const renderItem = useCallback(
    ({ item }: { item: (typeof businesses)[number] }) => (
      <Pressable style={[$card, { backgroundColor: colors.palette.neutral200 }]}>
        {item.logo ? (
          <CachedImage uri={item.logo} style={$logo} contentFit="cover" />
        ) : null}
        <Text weight="bold" style={{ color: colors.text }}>
          {item.business_name}
        </Text>
        {item.description ? (
          <Text size="sm" style={{ color: colors.textDim }} numberOfLines={2}>
            {item.description}
          </Text>
        ) : null}
      </Pressable>
    ),
    [colors],
  )

  return (
    <Screen preset="fixed" safeAreaEdges={["top"]} backgroundColor={colors.background}>
      <Header title="Market" />
      <View style={$filters}>
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search businesses..."
          placeholderTextColor={colors.textDim}
          style={[$searchInput, { color: colors.text, borderColor: colors.palette.neutral300 }]}
        />
        <Pressable
          onPress={() => setCategoryFilter(categoryFilter === "all" ? "halal" : "all")}
          style={[$filterChip, { backgroundColor: colors.tint }]}
        >
          <Text size="xs" weight="bold" style={{ color: "#fff" }}>
            {categoryFilter === "all" ? "All" : categoryFilter}
          </Text>
        </Pressable>
      </View>

      {isLoading ? (
        <View style={$center}>
          <ActivityIndicator color={colors.tint} />
        </View>
      ) : filtered.length === 0 ? (
        <View style={$center}>
          <Text style={{ color: colors.textDim }}>No businesses found</Text>
        </View>
      ) : (
        <ListView
          data={filtered}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          estimatedItemSize={88}
          contentContainerStyle={$list}
          refreshControl={<RefreshControl refreshing={refreshing || isRefetching} onRefresh={onRefresh} />}
        />
      )}
    </Screen>
  )
}

const $filters: ViewStyle = {
  paddingHorizontal: spacing.md,
  marginBottom: spacing.sm,
  gap: spacing.sm,
}

const $searchInput: TextStyle = {
  borderWidth: 1,
  borderRadius: spacing.sm,
  paddingHorizontal: spacing.sm,
  paddingVertical: spacing.sm,
  fontSize: 16,
}

const $filterChip: ViewStyle = {
  alignSelf: "flex-start",
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.xs,
  borderRadius: spacing.lg,
}

const $center: ViewStyle = {
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
}

const $list: ViewStyle = {
  padding: spacing.md,
  paddingBottom: spacing.xl,
}

const $card: ViewStyle = {
  padding: spacing.md,
  borderRadius: spacing.sm,
  marginBottom: spacing.sm,
  gap: spacing.xs,
}

const $logo: ImageStyle = {
  width: 48,
  height: 48,
  borderRadius: spacing.xs,
}
