import { ILibrary } from "app/models/LibraryStore"
import { colors, spacing } from "app/theme"
import { typography } from "app/theme/typography"
import React, { useEffect, useMemo, useState } from "react"
import {
  Dimensions,
  Image,
  ImageStyle,
  Modal,
  Platform,
  Pressable,
  TextStyle,
  View,
  ViewStyle,
} from "react-native"
import Pdf from "react-native-pdf"
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated"

import { Icon, Text } from "./"

interface PDFPreviewModalProps {
  item: ILibrary | null
  visible: boolean
  onClose: () => void
  onOpen: (item: ILibrary) => void
  onPinToHomeScreen?: (item: ILibrary) => void
  onReportPDF?: (item: ILibrary) => void
  isPinned?: boolean
  anchorPosition?: { x: number; y: number; width: number; height: number } | null
}

export function PDFPreviewModal({
  item,
  visible,
  onClose,
  onOpen,
  onPinToHomeScreen,
  onReportPDF,
  isPinned = false,
  anchorPosition: _anchorPosition,
}: PDFPreviewModalProps) {
  const [loading, setLoading] = useState(true)
  const [showOptions, setShowOptions] = useState(false)

  // Memoize dimensions to prevent recalculation on every render
  const { screenHeight, previewWidth, previewHeight } = useMemo(() => {
    const width = Dimensions.get("window").width
    const height = Dimensions.get("window").height
    return {
      screenHeight: height,
      previewWidth: width * 0.9,
      previewHeight: width * 0.9 * 1.4,
    }
  }, [])

  // Memoize animation constants
  const { finalX, finalY, finalScale, initialX, initialY, initialScale } = useMemo(
    () => ({
      finalX: 0,
      finalY: screenHeight * 0.1, // 10% from top
      finalScale: 1,
      initialX: 0,
      initialY: screenHeight, // Start from bottom
      initialScale: 0.8,
    }),
    [screenHeight],
  )

  // Animation for options sheet
  const optionsTranslateY = useSharedValue(screenHeight)
  const optionsOpacity = useSharedValue(0)

  // Animation values
  const translateX = useSharedValue(0)
  const translateY = useSharedValue(0)
  const scale = useSharedValue(0.3)
  const opacity = useSharedValue(0)

  useEffect(() => {
    if (visible) {
      // Set initial values (from bottom)
      translateX.value = initialX
      translateY.value = initialY
      scale.value = initialScale
      opacity.value = 0

      // Animate to final position with faster, springier animation
      translateX.value = withSpring(finalX, {
        damping: 15,
        stiffness: 150,
        mass: 0.8,
      })
      translateY.value = withSpring(finalY, {
        damping: 15,
        stiffness: 150,
        mass: 0.8,
      })
      scale.value = withSpring(finalScale, {
        damping: 15,
        stiffness: 150,
        mass: 0.8,
      })
      opacity.value = withSpring(1, {
        damping: 12,
        stiffness: 200,
      })
    } else if (!visible) {
      // Animate back to bottom on close
      translateX.value = withSpring(initialX, {
        damping: 15,
        stiffness: 150,
        mass: 0.8,
      })
      translateY.value = withSpring(initialY, {
        damping: 15,
        stiffness: 150,
        mass: 0.8,
      })
      scale.value = withSpring(initialScale, {
        damping: 15,
        stiffness: 150,
        mass: 0.8,
      })
      opacity.value = withSpring(0, {
        damping: 12,
        stiffness: 200,
      })
    }
  }, [visible, finalX, finalY, finalScale, initialX, initialY, initialScale])

  const animatedContainerStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: scale.value },
      ],
      opacity: opacity.value,
    }
  })

  const animatedOverlayStyle = useAnimatedStyle(() => {
    return {
      opacity: 1,
    }
  })

  const source = useMemo(() => {
    if (!item || !item.pdf_url) return null
    return {
      uri: item.pdf_url,
      cache: true,
    }
  }, [item])

  const handleOpen = () => {
    if (!item) return
    // Animate zoom out before opening
    scale.value = withSpring(1.2, {
      damping: 15,
      stiffness: 200,
      mass: 0.8,
    })
    opacity.value = withSpring(0, {
      damping: 12,
      stiffness: 200,
    })

    // Small delay to see the zoom animation, then open
    setTimeout(() => {
      onOpen(item)
      onClose()
    }, 150)
  }

  const handleShowOptions = () => {
    setShowOptions(true)
    // Animate options sheet up
    optionsTranslateY.value = withSpring(0, {
      damping: 20,
      stiffness: 300,
    })
    optionsOpacity.value = withSpring(1, {
      damping: 15,
      stiffness: 200,
    })
  }

  const handleBookmark = () => {
    if (!item) return
    setShowOptions(false)
    if (onPinToHomeScreen) {
      onPinToHomeScreen(item)
    }
  }

  const handleReport = () => {
    if (!item) return
    setShowOptions(false)
    if (onReportPDF) {
      onReportPDF(item)
    }
  }

  const handleCloseOptions = () => {
    // Animate options sheet down
    optionsTranslateY.value = withSpring(screenHeight, {
      damping: 20,
      stiffness: 300,
    })
    optionsOpacity.value = withSpring(0, {
      damping: 15,
      stiffness: 200,
    })
    setTimeout(() => {
      setShowOptions(false)
    }, 200)
  }

  const animatedOptionsSheetStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: optionsTranslateY.value }],
    }
  })

  const animatedOptionsBackdropStyle = useAnimatedStyle(() => {
    return {
      opacity: optionsOpacity.value * 0.5,
    }
  })

  // Don't render modal if no item or no pdf_url
  if (!item || !item.pdf_url || !source) {
    return null
  }

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <Animated.View style={[$overlay, animatedOverlayStyle]}>
        <Pressable style={$overlayPressable} onPress={onClose}>
          <Animated.View
            style={[
              $previewContainer,
              { width: previewWidth, maxHeight: screenHeight * 0.8 },
              animatedContainerStyle,
            ]}
          >
            <Pressable onPress={handleOpen}>
              <View style={$previewHeader}>
                <View style={$previewHeaderContent}>
                  <Image source={require("../../assets/images/file.png")} style={$previewIcon} />
                  <View style={$previewTitleContainer}>
                    <Text
                      text={item.name}
                      style={$previewTitle}
                      numberOfLines={2}
                      weight="medium"
                    />
                  </View>
                </View>
                <Pressable onPress={onClose} style={$closeButton}>
                  <Text text="✕" style={$closeButtonText} />
                </Pressable>
              </View>

              <View style={$previewContent}>
                {loading && (
                  <View style={$loadingContainer}>
                    <Text text="Loading preview..." style={$loadingText} />
                  </View>
                )}
                <Pdf
                  source={source}
                  page={1}
                  style={[$previewPdf, { width: previewWidth, height: previewHeight }]}
                  fitPolicy={0}
                  enableAntialiasing={true}
                  onLoadComplete={() => setLoading(false)}
                  onError={(error) => {
                    console.log("PDF preview error:", error)
                    setLoading(false)
                  }}
                />
              </View>
            </Pressable>
          </Animated.View>
        </Pressable>

        {/* WhatsApp-style Options Bottom Sheet */}
        {showOptions && (
          <Animated.View style={$optionsSheet}>
            <Animated.View style={[$optionsBackdrop, animatedOptionsBackdropStyle]}>
              <Pressable style={$backdropPressable} onPress={handleCloseOptions} />
            </Animated.View>
            <Animated.View style={[$optionsContainer, animatedOptionsSheetStyle]}>
              <Pressable style={$optionItem} onPress={handleBookmark}>
                <Icon
                  icon={isPinned ? "bookmark" : "bookmarkOutline"}
                  size={24}
                  color={colors.palette.neutral100}
                />
                <Text
                  text={isPinned ? "Remove from Bookmarks" : "Add to Bookmarks"}
                  style={$optionText}
                  weight="medium"
                />
              </Pressable>
              <Pressable style={$optionItem} onPress={handleReport}>
                <Icon icon="x" size={24} color="#FF3B30" />
                <Text text="Report" style={[$optionText, $destructiveText]} weight="medium" />
              </Pressable>
              <Pressable style={[$optionItem, $cancelOption]} onPress={handleCloseOptions}>
                <Text text="Cancel" style={$cancelText} weight="medium" />
              </Pressable>
            </Animated.View>
          </Animated.View>
        )}
      </Animated.View>
    </Modal>
  )
}

const $overlay: ViewStyle = {
  flex: 1,
  backgroundColor: "rgba(0, 0, 0, 0.7)",
  justifyContent: "flex-start",
  alignItems: "center",
  paddingTop: 0,
}

const $overlayPressable: ViewStyle = {
  flex: 1,
  width: "100%",
  justifyContent: "flex-start",
  alignItems: "center",
  paddingTop: 0,
}

const $previewContainer: ViewStyle = {
  backgroundColor: colors.white,
  borderRadius: 16,
  overflow: "hidden",
  position: "absolute",
}

const $previewHeader: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  padding: spacing.md,
  borderBottomWidth: 1,
  borderBottomColor: colors.border,
}

const $previewHeaderContent: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  flex: 1,
  marginRight: spacing.sm,
}

const $previewIcon: ImageStyle = {
  width: 32,
  height: 32,
  marginRight: spacing.sm,
}

const $previewTitleContainer: ViewStyle = {
  flex: 1,
}

const $previewTitle: TextStyle = {
  fontSize: 16,
  fontFamily: typography.primary.medium,
  color: colors.palette.neutral900,
}

const $closeButton: ViewStyle = {
  width: 32,
  height: 32,
  justifyContent: "center",
  alignItems: "center",
  borderRadius: 16,
  backgroundColor: colors.palette.neutral200,
}

const $closeButtonText: TextStyle = {
  fontSize: 18,
  color: colors.palette.neutral700,
}

const $previewContent: ViewStyle = {
  alignItems: "center",
  justifyContent: "center",
  padding: spacing.md,
  maxHeight: 400,
}

const $previewPdf: ViewStyle = {
  backgroundColor: colors.white,
}

const $loadingContainer: ViewStyle = {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: colors.palette.neutral100,
}

const $loadingText: TextStyle = {
  fontSize: 14,
  color: colors.palette.neutral600,
}

const $previewActions: ViewStyle = {
  padding: spacing.md,
  borderTopWidth: 1,
  borderTopColor: colors.border,
  backgroundColor: colors.palette.neutral100,
}

const $actionButton: ViewStyle = {
  paddingVertical: spacing.sm,
  paddingHorizontal: spacing.md,
  borderRadius: 8,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: colors.white,
  borderWidth: 1,
  borderColor: colors.border,
}

const $actionButtonText: TextStyle = {
  fontSize: 16,
  color: colors.palette.primary500,
}

const $optionsSheet: ViewStyle = {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  justifyContent: "flex-end",
}

const $optionsBackdrop: ViewStyle = {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0, 0, 0, 0.5)",
}

const $backdropPressable: ViewStyle = {
  flex: 1,
}

const $optionsContainer: ViewStyle = {
  backgroundColor: "#2B2B2B",
  borderTopLeftRadius: 20,
  borderTopRightRadius: 20,
  paddingBottom: Platform.OS === "ios" ? 34 : 20, // Safe area for iOS
  paddingTop: spacing.sm,
}

const $optionItem: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  paddingVertical: spacing.md,
  paddingHorizontal: spacing.lg,
  gap: spacing.md,
}

const $optionText: TextStyle = {
  fontSize: 16,
  color: "#FFFFFF",
  flex: 1,
}

const $destructiveText: TextStyle = {
  color: "#FF3B30",
}

const $cancelOption: ViewStyle = {
  marginTop: spacing.xs,
  borderTopWidth: 1,
  borderTopColor: "#3A3A3A",
  paddingTop: spacing.md,
}

const $cancelText: TextStyle = {
  fontSize: 16,
  color: "#FFFFFF",
  textAlign: "center",
  width: "100%",
}
