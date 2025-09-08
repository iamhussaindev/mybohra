import React, { useState, useRef } from "react"
import {
  View,
  ViewStyle,
  FlatList,
  TextStyle,
  ImageStyle,
  Pressable,
  TextInput,
} from "react-native"
import { Icon, Text } from "app/components"
import { colors, spacing, typography } from "app/theme"

interface LocationItem {
  id: string
  city: string
  country: string
}

interface LocationListProps {
  onLocationSelect?: (location: LocationItem) => void
  onClose?: () => void
}

const sampleLocations: LocationItem[] = [
  { id: "1", city: "Mumbai", country: "India" },
  { id: "2", city: "Delhi", country: "India" },
  { id: "3", city: "Bangalore", country: "India" },
  { id: "4", city: "Chennai", country: "India" },
  { id: "5", city: "Kolkata", country: "India" },
  { id: "6", city: "Hyderabad", country: "India" },
  { id: "7", city: "Pune", country: "India" },
  { id: "8", city: "Ahmedabad", country: "India" },
  { id: "9", city: "Surat", country: "India" },
  { id: "10", city: "Jaipur", country: "India" },
]

export function LocationList({ onLocationSelect, onClose }: LocationListProps) {
  const renderLocationItem = ({ item }: { item: LocationItem }) => (
    <View style={$locationItem}>
      <Text
        style={$locationText}
        text={item.city}
        weight="medium"
        size="md"
        onPress={() => onLocationSelect?.(item)}
      />
      <Text style={$countryText} text={item.country} weight="normal" size="sm" />
    </View>
  )

  const $searchRef = useRef<TextInput>(null)
  const [search, setSearch] = useState("")

  return (
    <View style={$container}>
      <View style={$headerContainer}>
        <Pressable onPress={() => onClose?.()} style={$header}>
          <Icon icon="caretLeft" size={24} style={$caret} color={colors.text} />
          <Text style={$title} text="Select Location" weight="bold" size="md" />
        </Pressable>
        <View style={$searchContainer}>
          <TextInput
            ref={$searchRef}
            value={search}
            style={$searchField}
            key="search"
            placeholder="Search"
            onChangeText={setSearch}
          />
        </View>
      </View>
      <FlatList
        data={sampleLocations}
        renderItem={renderLocationItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        style={$list}
      />
    </View>
  )
}

const $searchField: TextStyle = {
  backgroundColor: "rgb(255, 250, 241)",
  paddingHorizontal: 20,
  paddingVertical: 16,
  borderRadius: 12,
  marginBottom: 20,
  borderWidth: 1,
  marginHorizontal: 20,
  marginTop: 20,
  fontFamily: typography.primary.medium,
  borderColor: "rgb(240, 195, 116)",
  fontSize: 16,
  shadowColor: "rgba(0, 0, 0, 0.1)",
  shadowOffset: {
    width: 0,
    height: 2,
  },
  shadowOpacity: 0.5,
  shadowRadius: 3.84,
  elevation: 5,
}

const $searchContainer: ViewStyle = {
  marginTop: spacing.xs,
  flex: 1,
}

const $headerContainer: ViewStyle = {
  paddingHorizontal: spacing.xs,
  paddingVertical: spacing.xs,
}

const $caret: ImageStyle = {
  transform: [{ rotate: "-90deg" }],
  marginTop: -12,
  marginRight: spacing.xs,
}

const $header: ViewStyle = {
  flexDirection: "row",
  justifyContent: "flex-start",
  alignItems: "center",
  paddingHorizontal: spacing.xs,
  paddingVertical: spacing.xs,
}

const $container: ViewStyle = {
  padding: spacing.xs,
  marginTop: spacing.lg,
  backgroundColor: colors.background,
}

const $title: TextStyle = {
  marginBottom: spacing.md,
  textAlign: "center",
}

const $list: ViewStyle = {}

const $locationItem: ViewStyle = {
  paddingVertical: spacing.sm,
  paddingHorizontal: spacing.xs,
  borderBottomWidth: 1,
  borderBottomColor: colors.border,
}

const $locationText: TextStyle = {
  color: colors.text,
  marginBottom: spacing.xxs,
}

const $countryText: TextStyle = {
  color: colors.textDim,
}
