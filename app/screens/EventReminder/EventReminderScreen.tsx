

import { useNavigation, useRoute, RouteProp } from "@react-navigation/native"
import { Button, Dropdown, Screen, Switch, Text, TextField } from "app/components"
import Header from "app/components/Header"
import HijriDate from "app/libs/HijriDate"
import { colors, spacing } from "app/theme"
import React, { useState } from "react"
import { TextStyle, View, ViewStyle, ScrollView, Alert } from "react-native"

type EventReminderRouteProp = RouteProp<
  {
    EventReminder: {
      date: HijriDate
    }
  },
  "EventReminder"
>

export const EventReminderScreen = () => {
  const navigation = useNavigation()
  const route = useRoute<EventReminderRouteProp>()
  const selectedDate = route.params?.date

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [time, setTime] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isRepeatEnabled, setIsRepeatEnabled] = useState(false)
  const [repeatType, setRepeatType] = useState("")

  const repeatOptions = [
    { label: "Repeat every Hijri date", value: "hijri" },
    { label: "Repeat every Gregorian date", value: "gregorian" },
  ]

  const handleSaveReminder = async () => {
    if (!title.trim()) {
      Alert.alert("Error", "Please enter a title for your reminder")
      return
    }

    if (!time.trim()) {
      Alert.alert("Error", "Please enter a time for your reminder")
      return
    }

    setIsLoading(true)
    try {
      // TODO: Implement reminder saving logic
      console.log("Saving reminder:", {
        title,
        description,
        time,
        date: selectedDate,
      })

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      Alert.alert("Success", "Reminder created successfully!", [
        { text: "OK", onPress: () => navigation.goBack() },
      ])
    } catch (error) {
      Alert.alert("Error", "Failed to create reminder. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    navigation.goBack()
  }

  const formatDate = (date: HijriDate) => {
    return `${date.day} ${date.getMonthName()} ${date.year}`
  }

  const formatGregorianDate = (date: HijriDate) => {
    return date.toGregorian().toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <Screen preset="fixed" safeAreaEdges={["top"]} contentContainerStyle={$screenContainer}>
      <Header title={<Text>Create Event Reminder</Text>} showBackButton rightActions={<View />} />

      <ScrollView style={$content} showsVerticalScrollIndicator={false}>
        {selectedDate && (
          <View style={$dateContainer}>
            <Text weight="bold" style={$dateTitle}>
              {formatDate(selectedDate)}
            </Text>
            <Text style={$dateSubtitle}>{formatGregorianDate(selectedDate)}</Text>
          </View>
        )}

        <View style={$formContainer}>
          <View style={$inputContainer}>
            <Text weight="medium" style={$label}>
              Event Title *
            </Text>
            <TextField
              value={title}
              onChangeText={setTitle}
              placeholder="Enter event title"
              style={$input}
              autoFocus
            />
          </View>

          <View style={$inputContainer}>
            <Text weight="medium" style={$label}>
              Description
            </Text>
            <TextField
              value={description}
              onChangeText={setDescription}
              placeholder="Enter event description (optional)"
              style={[$input, $textArea]}
              multiline
              numberOfLines={4}
            />
          </View>

          <View style={$inputContainer}>
            <Text weight="medium" style={$label}>
              Reminder Time *
            </Text>
            <TextField
              value={time}
              onChangeText={setTime}
              placeholder="e.g 9:00 AM"
              style={$input}
            />
          </View>

          <View>
            <Switch
              value={isRepeatEnabled}
              onValueChange={setIsRepeatEnabled}
              label="Repeat"
              labelPosition="left"
              containerStyle={$switchContainer}
            />
          </View>

          {isRepeatEnabled && (
            <View style={$inputContainer}>
              <Text weight="medium" style={$label}>
                Repeat Type
              </Text>
              <Dropdown
                value={repeatType}
                options={repeatOptions}
                onValueChange={setRepeatType}
                placeholder="Select repeat type"
                containerStyle={$dropdownContainer}
              />
            </View>
          )}
        </View>

        <View style={$buttonContainer}>
          <Button
            onPress={handleSaveReminder}
            style={$saveButton}
            textStyle={$saveButtonText}
            disabled={isLoading}
          >
            {isLoading ? "Creating..." : "Create Reminder"}
          </Button>

          <Button
            onPress={handleCancel}
            style={$cancelButton}
            textStyle={$cancelButtonText}
            disabled={isLoading}
          >
            Cancel
          </Button>
        </View>
      </ScrollView>
    </Screen>
  )
}

const $screenContainer: ViewStyle = {
  flex: 1,
  backgroundColor: colors.background,
}

const $content: ViewStyle = {
  flex: 1,
  paddingHorizontal: spacing.lg,
}

const $dateContainer: ViewStyle = {
  paddingVertical: spacing.md,
  borderBottomWidth: 1,
  borderBottomColor: colors.palette.neutral200,
  marginBottom: spacing.lg,
}

const $dateTitle: TextStyle = {
  fontSize: 20,
  color: colors.palette.primary500,
}

const $dateSubtitle: TextStyle = {
  fontSize: 16,
  color: colors.palette.neutral600,
}

const $formContainer: ViewStyle = {
  marginBottom: spacing.xl,
}

const $inputContainer: ViewStyle = {
  marginBottom: spacing.md,
}

const $label: TextStyle = {
  fontSize: 16,
  color: colors.palette.neutral900,
  marginBottom: spacing.xs,
}

const $input: ViewStyle = {
  borderWidth: 1,
  borderColor: colors.palette.neutral300,
  borderRadius: 8,
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.sm,
  backgroundColor: colors.palette.neutral100,
}

const $textArea: ViewStyle = {
  minHeight: 100,
}

const $buttonContainer: ViewStyle = {
  gap: spacing.md,
  marginBottom: spacing.xl,
}

const $saveButton: ViewStyle = {
  backgroundColor: colors.palette.primary500,
  borderRadius: 8,
  paddingVertical: spacing.md,
}

const $saveButtonText: TextStyle = {
  color: colors.palette.neutral100,
  fontSize: 16,
  fontWeight: "bold",
}

const $cancelButton: ViewStyle = {
  backgroundColor: colors.transparent,
  borderWidth: 1,
  borderColor: colors.palette.neutral300,
  borderRadius: 8,
  paddingVertical: spacing.md,
}

const $cancelButtonText: TextStyle = {
  color: colors.palette.neutral700,
  fontSize: 16,
}

const $switchContainer: ViewStyle = {
  marginBottom: spacing.md,
}

const $dropdownContainer: ViewStyle = {
  marginBottom: spacing.md,
}
