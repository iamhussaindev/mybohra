import React, { useState } from "react"
import {
  View,
  ViewStyle,
  TextStyle,
  TouchableOpacity,
  Modal,
  FlatList,
  ImageStyle,
} from "react-native"
import { colors, spacing } from "../theme"
import { Text } from "./Text"
import { Icon } from "./Icon"

export interface DropdownOption {
  label: string
  value: string
}

export interface DropdownProps {
  /**
   * The currently selected option
   */
  value?: string
  /**
   * Array of options to display
   */
  options: DropdownOption[]
  /**
   * Placeholder text when no option is selected
   */
  placeholder?: string
  /**
   * Called when an option is selected
   */
  onValueChange?: (value: string) => void
  /**
   * Style overrides for the container
   */
  containerStyle?: ViewStyle
  /**
   * Style overrides for the dropdown button
   */
  buttonStyle?: ViewStyle
  /**
   * Style overrides for the dropdown text
   */
  textStyle?: TextStyle
  /**
   * Whether the dropdown is disabled
   */
  disabled?: boolean
}

/**
 * A simple dropdown component for selecting from a list of options.
 */
export function Dropdown(props: DropdownProps) {
  const {
    value,
    options,
    placeholder = "Select an option",
    onValueChange,
    containerStyle,
    buttonStyle,
    textStyle,
    disabled = false,
  } = props

  const [isOpen, setIsOpen] = useState(false)

  const selectedOption = options.find((option) => option.value === value)

  const handleSelect = (option: DropdownOption) => {
    onValueChange?.(option.value)
    setIsOpen(false)
  }

  const toggleDropdown = () => {
    if (!disabled) {
      setIsOpen(!isOpen)
    }
  }

  return (
    <View style={[$container, containerStyle]}>
      <TouchableOpacity
        style={[$button, buttonStyle, disabled && $disabled, isOpen && $buttonOpen]}
        onPress={toggleDropdown}
        disabled={disabled}
      >
        <Text style={[$buttonText, textStyle, !selectedOption && $placeholder]}>
          {selectedOption ? selectedOption.label : placeholder}
        </Text>
        <Icon
          icon="caretLeft"
          style={[$caret, isOpen && $caretOpen]}
          size={16}
          color={colors.palette.neutral600}
        />
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <TouchableOpacity style={$modalOverlay} activeOpacity={1} onPress={() => setIsOpen(false)}>
          <View style={$dropdownContainer}>
            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[$option, item.value === value && $optionSelected]}
                  onPress={() => handleSelect(item)}
                >
                  <Text style={[$optionText, item.value === value && $optionTextSelected]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              )}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  )
}

const $caret: ImageStyle = {
  transform: [{ rotate: "-90deg" }],
}

const $caretOpen: ImageStyle = {
  transform: [{ rotate: "90deg" }],
}

const $container: ViewStyle = {
  position: "relative",
}

const $button: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  borderWidth: 1,
  borderColor: colors.palette.neutral300,
  borderRadius: 8,
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.sm,
  backgroundColor: colors.palette.neutral100,
  minHeight: 44,
}

const $buttonOpen: ViewStyle = {
  borderColor: colors.palette.primary500,
}

const $disabled: ViewStyle = {
  opacity: 0.5,
}

const $buttonText: TextStyle = {
  fontSize: 16,
  color: colors.palette.neutral900,
  flex: 1,
}

const $placeholder: TextStyle = {
  color: colors.palette.neutral500,
}

const $modalOverlay: ViewStyle = {
  flex: 1,
  backgroundColor: "rgba(0, 0, 0, 0.5)",
  justifyContent: "center",
  alignItems: "center",
}

const $dropdownContainer: ViewStyle = {
  backgroundColor: colors.palette.neutral100,
  borderRadius: 8,
  maxHeight: 200,
  width: "80%",
  shadowColor: "#000",
  shadowOffset: {
    width: 0,
    height: 2,
  },
  shadowOpacity: 0.25,
  shadowRadius: 3.84,
  elevation: 5,
}

const $option: ViewStyle = {
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.sm,
  borderBottomWidth: 1,
  borderBottomColor: colors.palette.neutral200,
}

const $optionSelected: ViewStyle = {
  backgroundColor: colors.palette.primary100,
}

const $optionText: TextStyle = {
  fontSize: 16,
  color: colors.palette.neutral900,
}

const $optionTextSelected: TextStyle = {
  color: colors.palette.primary500,
  fontWeight: "bold",
}
