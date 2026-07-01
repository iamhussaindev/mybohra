import { IconSearch } from "@tabler/icons-react-native"
import { Screen, Text } from "app/components"
import Header from "app/components/Header"
import { analytics } from "app/services/analytics.service"
import { useUniversalSearch } from "app/services/supabase/queries/search.query"
import { spacing } from "app/theme"
import { useColors } from "app/theme/useColors"
import React, { useEffect, useMemo, useState } from "react"
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  TextStyle,
  View,
  ViewStyle,
} from "react-native"

type SearchTab = "all" | "miqaat" | "mazaar" | "pdf" | "product" | "business"

const TABS: { id: SearchTab; label: string }[] = [
  { id: "all", label: "All" },
  { id: "miqaat", label: "Miqaat" },
  { id: "mazaar", label: "Mazaar" },
  { id: "pdf", label: "PDF" },
  { id: "product", label: "Product" },
  { id: "business", label: "Business" },
]

export function SearchScreen() {
  const colors = useColors()
  const [query, setQuery] = useState("")
  const [activeTab, setActiveTab] = useState<SearchTab>("all")
  const { data: results, isLoading, isFetching } = useUniversalSearch(query)

  useEffect(() => {
    if (!results || !query.trim()) return
    const total =
      results.miqaats.length +
      results.mazaars.length +
      results.pdfs.length +
      results.businesses.length
    analytics.trackSearch(query, total)
  }, [results, query])

  const listData = useMemo(() => {
    if (!results) return []

    const items: Array<{ id: string; title: string; subtitle?: string; type: string }> = []

    const push = (type: string, id: string | number, title: string, subtitle?: string) => {
      items.push({ id: `${type}-${id}`, title, subtitle, type })
    }

    const include = (tab: SearchTab) => activeTab === "all" || activeTab === tab

    if (include("miqaat")) {
      for (const m of results.miqaats) {
        push("miqaat", m.id, m.name, m.description ?? undefined)
      }
    }
    if (include("mazaar")) {
      for (const m of results.mazaars) {
        push("mazaar", m.id, m.name)
      }
    }
    if (include("pdf")) {
      for (const p of results.pdfs) {
        push("pdf", p.id, p.name, p.album ?? undefined)
      }
    }
    if (include("product")) {
      for (const p of results.products) {
        push("product", p.id, p.title, p.description ?? undefined)
      }
    }
    if (include("business")) {
      for (const b of results.businesses) {
        push("business", b.id, b.business_name, b.description ?? undefined)
      }
    }

    return items
  }, [results, activeTab])

  const showLoading = (isLoading || isFetching) && query.trim().length >= 2

  return (
    <Screen preset="fixed" safeAreaEdges={["top"]} backgroundColor={colors.background}>
      <Header title="Search" />
      <View style={[$searchRow, { borderColor: colors.palette.neutral300 }]}>
        <IconSearch size={20} color={colors.textDim} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search Miqaat, Mazaar, PDF, Business..."
          placeholderTextColor={colors.textDim}
          style={[$input, { color: colors.text }]}
          autoCorrect={false}
          autoCapitalize="none"
          returnKeyType="search"
        />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={$tabs}>
        {TABS.map((tab) => {
          const selected = activeTab === tab.id
          return (
            <Pressable
              key={tab.id}
              onPress={() => setActiveTab(tab.id)}
              style={[
                $tab,
                {
                  backgroundColor: selected ? colors.tint : colors.palette.neutral200,
                },
              ]}
            >
              <Text
                size="xs"
                weight="bold"
                style={{ color: selected ? "#fff" : colors.text }}
              >
                {tab.label}
              </Text>
            </Pressable>
          )
        })}
      </ScrollView>

      {showLoading ? (
        <View style={$center}>
          <ActivityIndicator color={colors.tint} />
        </View>
      ) : query.trim().length < 2 ? (
        <View style={$center}>
          <Text style={{ color: colors.textDim }}>Type at least 2 characters to search</Text>
        </View>
      ) : listData.length === 0 ? (
        <View style={$center}>
          <Text style={{ color: colors.textDim }}>No results found</Text>
        </View>
      ) : (
        <FlatList
          data={listData}
          keyExtractor={(item) => item.id}
          contentContainerStyle={$list}
          renderItem={({ item }) => (
            <View style={[$row, { borderBottomColor: colors.palette.neutral300 }]}>
              <Text weight="bold" style={{ color: colors.text }}>
                {item.title}
              </Text>
              {item.subtitle ? (
                <Text size="sm" style={{ color: colors.textDim }} numberOfLines={2}>
                  {item.subtitle}
                </Text>
              ) : null}
              <Text size="xs" style={{ color: colors.tint, marginTop: spacing.xxs }}>
                {item.type.toUpperCase()}
              </Text>
            </View>
          )}
        />
      )}
    </Screen>
  )
}

const $searchRow: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  marginHorizontal: spacing.md,
  marginBottom: spacing.sm,
  paddingHorizontal: spacing.sm,
  borderWidth: 1,
  borderRadius: spacing.sm,
  gap: spacing.xs,
}

const $input: TextStyle = {
  flex: 1,
  paddingVertical: spacing.sm,
  fontSize: 16,
}

const $tabs: ViewStyle = {
  maxHeight: 44,
  marginBottom: spacing.sm,
  paddingHorizontal: spacing.md,
}

const $tab: ViewStyle = {
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.xs,
  borderRadius: spacing.lg,
  marginRight: spacing.xs,
}

const $center: ViewStyle = {
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  padding: spacing.lg,
}

const $list: ViewStyle = {
  paddingHorizontal: spacing.md,
  paddingBottom: spacing.xl,
}

const $row: ViewStyle = {
  paddingVertical: spacing.md,
  borderBottomWidth: StyleSheet.hairlineWidth,
}
