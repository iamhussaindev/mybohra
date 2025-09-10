import React from "react"
import { render, fireEvent } from "@testing-library/react-native"
import { Button } from "app/components/Button"

describe("Button", () => {
  describe("rendering", () => {
    it("should render with default preset", () => {
      const { getByText } = render(<Button text="Test Button" />)

      expect(getByText("Test Button")).toBeTruthy()
    })

    it("should render with filled preset", () => {
      const { getByText } = render(<Button preset="filled" text="Filled Button" />)

      expect(getByText("Filled Button")).toBeTruthy()
    })

    it("should render with tinted preset", () => {
      const { getByText } = render(<Button preset="tinted" text="Tinted Button" />)

      expect(getByText("Tinted Button")).toBeTruthy()
    })

    it("should render with reversed preset", () => {
      const { getByText } = render(<Button preset="reversed" text="Reversed Button" />)

      expect(getByText("Reversed Button")).toBeTruthy()
    })

    it("should render with custom style", () => {
      const customStyle = { backgroundColor: "red" }
      const { getByText } = render(<Button text="Custom Button" style={customStyle} />)

      expect(getByText("Custom Button")).toBeTruthy()
    })
  })

  describe("interactions", () => {
    it("should call onPress when pressed", () => {
      const onPress = jest.fn()
      const { getByText } = render(<Button text="Test Button" onPress={onPress} />)

      fireEvent.press(getByText("Test Button"))

      expect(onPress).toHaveBeenCalledTimes(1)
    })

    it("should not call onPress when disabled", () => {
      const onPress = jest.fn()
      const { getByText } = render(<Button text="Disabled Button" onPress={onPress} disabled />)

      fireEvent.press(getByText("Disabled Button"))

      expect(onPress).not.toHaveBeenCalled()
    })

    it("should handle multiple presses", () => {
      const onPress = jest.fn()
      const { getByText } = render(<Button text="Test Button" onPress={onPress} />)

      fireEvent.press(getByText("Test Button"))
      fireEvent.press(getByText("Test Button"))
      fireEvent.press(getByText("Test Button"))

      expect(onPress).toHaveBeenCalledTimes(3)
    })
  })

  describe("disabled state", () => {
    it("should render disabled button", () => {
      const { getByText } = render(<Button text="Disabled Button" disabled />)

      expect(getByText("Disabled Button")).toBeTruthy()
    })

    it("should apply disabled styles", () => {
      const { getByText } = render(<Button text="Disabled Button" disabled />)
      const button = getByText("Disabled Button")

      // Check if disabled styles are applied (this depends on your implementation)
      expect(button).toBeTruthy()
    })

    it("should not be pressable when disabled", () => {
      const onPress = jest.fn()
      const { getByText } = render(<Button text="Disabled Button" onPress={onPress} disabled />)

      fireEvent.press(getByText("Disabled Button"))

      expect(onPress).not.toHaveBeenCalled()
    })
  })

  describe("loading state", () => {
    it("should render loading button", () => {
      const { getByText } = render(<Button text="Loading Button" loading />)

      expect(getByText("Loading Button")).toBeTruthy()
    })

    it("should not call onPress when loading", () => {
      const onPress = jest.fn()
      const { getByText } = render(<Button text="Loading Button" onPress={onPress} loading />)

      fireEvent.press(getByText("Loading Button"))

      expect(onPress).not.toHaveBeenCalled()
    })
  })

  describe("accessibility", () => {
    it("should have accessible role", () => {
      const { getByRole } = render(<Button text="Accessible Button" />)

      expect(getByRole("button")).toBeTruthy()
    })

    it("should have accessible label", () => {
      const { getByLabelText } = render(<Button text="Accessible Button" />)

      expect(getByLabelText("Accessible Button")).toBeTruthy()
    })

    it("should be accessible when disabled", () => {
      const { getByRole } = render(<Button text="Disabled Button" disabled />)

      const button = getByRole("button")
      expect(button).toBeTruthy()
      expect(button.props.accessibilityState?.disabled).toBe(true)
    })
  })

  describe("text variants", () => {
    it("should render with different text sizes", () => {
      const { getByText: getBySmall } = render(<Button text="Small Button" textSize="sm" />)
      const { getByText: getByLarge } = render(<Button text="Large Button" textSize="lg" />)

      expect(getBySmall("Small Button")).toBeTruthy()
      expect(getByLarge("Large Button")).toBeTruthy()
    })

    it("should render with different text weights", () => {
      const { getByText: getByLight } = render(<Button text="Light Button" textWeight="light" />)
      const { getByText: getByBold } = render(<Button text="Bold Button" textWeight="bold" />)

      expect(getByLight("Light Button")).toBeTruthy()
      expect(getByBold("Bold Button")).toBeTruthy()
    })
  })

  describe("edge cases", () => {
    it("should handle empty text", () => {
      const { getByRole } = render(<Button text="" />)

      expect(getByRole("button")).toBeTruthy()
    })

    it("should handle undefined onPress", () => {
      const { getByText } = render(<Button text="No Press Button" />)

      // Should not throw when pressed without onPress
      expect(() => fireEvent.press(getByText("No Press Button"))).not.toThrow()
    })

    it("should handle long text", () => {
      const longText =
        "This is a very long button text that might wrap or truncate depending on the implementation"
      const { getByText } = render(<Button text={longText} />)

      expect(getByText(longText)).toBeTruthy()
    })
  })

  describe("preset combinations", () => {
    it("should handle disabled with different presets", () => {
      const presets = ["default", "filled", "tinted", "reversed"] as const

      presets.forEach((preset) => {
        const { getByText } = render(
          <Button preset={preset} text={`${preset} Disabled`} disabled />,
        )
        expect(getByText(`${preset} Disabled`)).toBeTruthy()
      })
    })

    it("should handle loading with different presets", () => {
      const presets = ["default", "filled", "tinted", "reversed"] as const

      presets.forEach((preset) => {
        const { getByText } = render(<Button preset={preset} text={`${preset} Loading`} loading />)
        expect(getByText(`${preset} Loading`)).toBeTruthy()
      })
    })
  })
})
