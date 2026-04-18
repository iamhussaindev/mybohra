import { Text } from "app/components"
import { spacing } from "app/theme"
import { useColors } from "app/theme/useColors"
import React from "react"
import { Modal, View, ViewStyle, TextStyle, Pressable } from "react-native"

interface HomeLocationModalProps {
  visible: boolean
  location: {
    city: string
    state: string | null
    country: string
  }
  onConfirm: () => void
  onCancel: () => void
}

export function HomeLocationModal({
  visible,
  location,
  onConfirm,
  onCancel,
}: HomeLocationModalProps) {
  const colors = useColors()

  const locationString = [location.city, location.state, location.country]
    .filter(Boolean)
    .join(", ")

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={$overlay}>
        <View style={[$modal, { backgroundColor: colors.background }]}>
          <Text style={[$title, { color: colors.text }]} weight="bold" size="lg">
            Set Home Location
          </Text>
          <Text style={[$message, { color: colors.textDim }]} size="md">
            Is this your home location?
          </Text>
          <View style={[$locationContainer, { backgroundColor: colors.palette.neutral200 }]}>
            <Text style={[$locationText, { color: colors.text }]} weight="medium" size="md">
              {locationString}
            </Text>
          </View>
          <Text style={[$subtext, { color: colors.textDim }]} size="sm">
            This will be saved as your home location. You can change it later in settings.
          </Text>
          s
          <View style={$buttonContainer}>
            <Pressable
              style={[$button, $cancelButton, { borderColor: colors.border }]}
              onPress={onCancel}
            >
              <Text style={[$buttonText, { color: colors.text }]} weight="medium">
                No, Not My Home
              </Text>
            </Pressable>

            <Pressable
              style={[$button, $confirmButton, { backgroundColor: colors.tint }]}
              onPress={onConfirm}
            >
              <Text style={[$buttonText, { color: colors.background }]} weight="bold">
                Yes, This is My Home
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  )
}

const $overlay: ViewStyle = {
  flex: 1,
  backgroundColor: "rgba(0, 0, 0, 0.5)",
  justifyContent: "center",
  alignItems: "center",
  padding: spacing.lg,
}

const $modal: ViewStyle = {
  borderRadius: spacing.md,
  padding: spacing.lg,
  width: "100%",
  maxWidth: 400,
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.3,
  shadowRadius: 8,
  elevation: 8,
}

const $title: TextStyle = {
  marginBottom: spacing.md,
  textAlign: "center",
}

const $message: TextStyle = {
  marginBottom: spacing.md,
  textAlign: "center",
}

const $locationContainer: ViewStyle = {
  padding: spacing.md,
  borderRadius: spacing.xs,
  marginBottom: spacing.md,
}

const $locationText: TextStyle = {
  textAlign: "center",
}

const $subtext: TextStyle = {
  marginBottom: spacing.lg,
  textAlign: "center",
}

const $buttonContainer: ViewStyle = {
  flexDirection: "row",
  gap: spacing.sm,
}

const $button: ViewStyle = {
  flex: 1,
  paddingVertical: spacing.md,
  paddingHorizontal: spacing.sm,
  borderRadius: spacing.xs,
  alignItems: "center",
  justifyContent: "center",
}

const $cancelButton: ViewStyle = {
  borderWidth: 1,
}

const $confirmButton: ViewStyle = {
  // backgroundColor handled by inline style
}

const $buttonText: TextStyle = {
  fontSize: 14,
}
