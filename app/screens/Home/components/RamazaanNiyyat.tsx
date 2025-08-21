import { Text, Icon } from "app/components"
import { ramazanNiyyat } from "app/data/niyyat"
// import HijriDate from "app/libs/HijriDate"
import { colors, spacing, typography } from "app/theme"
import React, { useState, useEffect, useRef } from "react"
import { TextStyle, View, ViewStyle, Pressable } from "react-native"
import * as storage from "app/utils/storage"
import Swipeable, { SwipeableMethods } from "react-native-gesture-handler/ReanimatedSwipeable"

export default function RamazaanNiyyat() {
  //   const hijriDate = new HijriDate()
  const day = 9

  const swipeableRow = useRef<SwipeableMethods>(null)

  const niyyat = ramazanNiyyat.find((niyyat) => niyyat.day === day)
  if (!niyyat) return null

  const start = niyyat.text.split("Saumal ")[0] + "Saumal"
  const middle = niyyat.text.split("Saumal ")[1].split("min ")[0]
  const end = niyyat.text.split("min ")[1]
  const [hasSwiped, setHasSwiped] = useState(false)

  const [isVisible, setIsVisible] = useState(true)

  const loadVisibility = async () => {
    const savedVisibility = await storage.loadString(`niyyat_visible_${day}`, "true")
    setIsVisible(savedVisibility !== "true")
  }

  const loadSwiped = async () => {
    const swiped = await storage.loadString(`niyyat_swiped`, "false")

    if (swiped !== null) {
      setHasSwiped(swiped === "true")
    }
  }

  const handleSwipeHint = async () => {
    if (!hasSwiped && swipeableRow.current) {
      const bounceRight = async () => {
        for (let i = 0; i < 2; i++) {
          await new Promise<void>((resolve) => {
            swipeableRow.current?.openRight()
            setTimeout(() => {
              swipeableRow.current?.close()
              resolve()
            }, 300)
          })
          if (i < 2) {
            await new Promise((resolve) => setTimeout(resolve, 150))
          }
        }
      }

      bounceRight()
      setHasSwiped(true)
      await storage.saveString(`niyyat_swiped`, "true")
    }
  }

  useEffect(() => {
    loadVisibility()
    loadSwiped()
  }, [])

  const handleClose = async () => {
    setIsVisible(false)
    await storage.saveString(`niyyat_visible_${day}`, "false")
  }

  useEffect(() => {
    if (!hasSwiped) {
      handleSwipeHint()
    }
  }, [hasSwiped])

  const renderRightActions = () => {
    return (
      <Pressable style={$rightAction} onPress={handleClose}>
        <Icon size={20} icon="x" color={colors.white} />
      </Pressable>
    )
  }

  if (!isVisible) return null
  const showArabic = true

  return (
    <Swipeable
      renderRightActions={renderRightActions}
      rightThreshold={5}
      friction={2}
      ref={swipeableRow}
      leftThreshold={30}
    >
      <View style={$container}>
        <Text style={$title}>Today's Roza Niyyat</Text>
        <View style={[!showArabic && $row, showArabic && $arabicRow]}>
          {showArabic ? (
            <Text weight="regular" style={[$text, $arabic]}>
              {niyyat.arabic}
            </Text>
          ) : (
            <>
              <Text style={$text}>{start}</Text>
              <Text weight="bold" style={$middle}>
                {middle}
              </Text>
              <Text style={$text}>{end}</Text>
            </>
          )}
        </View>
      </View>
    </Swipeable>
  )
}

const $arabicRow: ViewStyle = {
  justifyContent: "flex-start",
}

const $arabic: TextStyle = {
  fontSize: 30,
  textAlign: "center",
  lineHeight: 60,
  fontFamily: typography.arabic.kanz,
  writingDirection: "rtl",
}

const $rightAction: ViewStyle = {
  backgroundColor: colors.palette.primary500,
  justifyContent: "center",
  alignItems: "center",
  padding: spacing.md,
  width: 120,
  marginRight: spacing.lg,
  marginTop: spacing.lg,
  borderRadius: 10,
}

const $row: ViewStyle = {
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  flexWrap: "wrap",
  justifyContent: "center",
}

const $title: TextStyle = {
  fontSize: 13,
  fontWeight: "bold",
  color: colors.palette.primary500,
  marginBottom: spacing.sm,
  textAlign: "center",
}

const $text: TextStyle = {
  fontSize: 15,
  textAlign: "center",
}

const $middle: TextStyle = {
  fontSize: 18,
  color: colors.palette.primary500,
  fontWeight: "bold",
  textTransform: "uppercase",
}

const $container: ViewStyle = {
  marginHorizontal: spacing.lg,
  borderWidth: 1,
  marginTop: spacing.lg,
  borderRadius: 10,
  borderColor: colors.palette.primary500,
  backgroundColor: colors.palette.neutral100,
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.md,
  display: "flex",
  flexDirection: "column",
  position: "relative",
}
