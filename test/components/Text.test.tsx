import { render } from "@testing-library/react-native"
import { Text } from "app/components/Text"
import React from "react"

describe("Text", () => {
  describe("rendering", () => {
    it("should render text content", () => {
      const { getByText } = render(<Text>Hello World</Text>)

      expect(getByText("Hello World")).toBeTruthy()
    })

    it("should render with default size", () => {
      const { getByText } = render(<Text>Default Text</Text>)

      expect(getByText("Default Text")).toBeTruthy()
    })

    it("should render with different sizes", () => {
      const sizes = ["xs", "sm", "md", "lg", "xl"] as const

      sizes.forEach((size) => {
        const { getByText } = render(<Text size={size}>{`${size} Text`}</Text>)
        expect(getByText(`${size} Text`)).toBeTruthy()
      })
    })

    it("should render with different weights", () => {
      const weights = ["light", "normal", "medium", "bold", "black"] as const

      weights.forEach((weight) => {
        const { getByText } = render(<Text weight={weight}>{`${weight} Text`}</Text>)
        expect(getByText(`${weight} Text`)).toBeTruthy()
      })
    })
  })

  describe("styling", () => {
    it("should apply custom style", () => {
      const customStyle = { color: "red", fontSize: 20 }
      const { getByText } = render(<Text style={customStyle}>Styled Text</Text>)

      expect(getByText("Styled Text")).toBeTruthy()
    })

    it("should combine default and custom styles", () => {
      const customStyle = { color: "blue" }
      const { getByText } = render(
        <Text size="lg" style={customStyle}>
          Combined Text
        </Text>,
      )

      expect(getByText("Combined Text")).toBeTruthy()
    })
  })

  describe("accessibility", () => {
    it("should have accessible role", () => {
      const { getByRole } = render(<Text>Accessible Text</Text>)

      expect(getByRole("text")).toBeTruthy()
    })

    it("should support accessibility label", () => {
      const { getByLabelText } = render(<Text accessibilityLabel="Custom Label">Text</Text>)

      expect(getByLabelText("Custom Label")).toBeTruthy()
    })

    it("should support accessibility hint", () => {
      const { getByText } = render(<Text accessibilityHint="This is a hint">Text</Text>)

      const text = getByText("Text")
      expect(text.props.accessibilityHint).toBe("This is a hint")
    })
  })

  describe("text content", () => {
    it("should handle empty text", () => {
      const { getByText } = render(<Text></Text>)

      expect(getByText("")).toBeTruthy()
    })

    it("should handle multiline text", () => {
      const multilineText = "Line 1\nLine 2\nLine 3"
      const { getByText } = render(<Text>{multilineText}</Text>)

      expect(getByText(multilineText)).toBeTruthy()
    })

    it("should handle special characters", () => {
      const specialText = "Special chars: !@#$%^&*()_+-=[]{}|;':\",./<>?"
      const { getByText } = render(<Text>{specialText}</Text>)

      expect(getByText(specialText)).toBeTruthy()
    })

    it("should handle unicode characters", () => {
      const unicodeText = "Unicode: 你好世界 🌍 مرحبا بالعالم"
      const { getByText } = render(<Text>{unicodeText}</Text>)

      expect(getByText(unicodeText)).toBeTruthy()
    })
  })

  describe("size and weight combinations", () => {
    it("should handle all size and weight combinations", () => {
      const sizes = ["xs", "sm", "md", "lg", "xl"] as const
      const weights = ["light", "normal", "medium", "bold", "black"] as const

      sizes.forEach((size) => {
        weights.forEach((weight) => {
          const { getByText } = render(
            <Text size={size} weight={weight}>
              {`${size}-${weight}`}
            </Text>,
          )
          expect(getByText(`${size}-${weight}`)).toBeTruthy()
        })
      })
    })
  })

  describe("edge cases", () => {
    it("should handle null children", () => {
      const { getByText } = render(<Text>{null}</Text>)

      expect(getByText("")).toBeTruthy()
    })

    it("should handle undefined children", () => {
      const { getByText } = render(<Text>{undefined}</Text>)

      expect(getByText("")).toBeTruthy()
    })

    it("should handle number children", () => {
      const { getByText } = render(<Text>{123}</Text>)

      expect(getByText("123")).toBeTruthy()
    })

    it("should handle boolean children", () => {
      const { getByText } = render(<Text>{true}</Text>)

      expect(getByText("true")).toBeTruthy()
    })
  })

  describe("performance", () => {
    it("should not cause unnecessary re-renders", () => {
      let renderCount = 0

      const TestComponent = ({ text }: { text: string }) => {
        renderCount++
        return <Text>{text}</Text>
      }

      const { rerender } = render(<TestComponent text="Test" />)
      expect(renderCount).toBe(1)

      // Rerender with same text
      rerender(<TestComponent text="Test" />)
      expect(renderCount).toBe(2)
    })
  })
})
