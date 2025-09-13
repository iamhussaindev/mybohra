import { Text } from "app/components"
import { ILibrary } from "app/models/LibraryStore"
import { colors, spacing } from "app/theme"
import LottieView from "lottie-react-native"
import React from "react"
import {
  Dimensions,
  TextStyle,
  View,
  ViewStyle,
  Image,
  ImageStyle,
  Pressable,
  FlatList,
} from "react-native"
import { Track } from "react-native-track-player"

const screenWidth = Dimensions.get("window").width

const convertListToGrid = (
  items: ILibrary[],
  duasScreen = false,
): ILibrary[][] | ILibrary[][][] => {
  if (duasScreen) {
    // For DuaListScreen: 2 rows of 3 items (6 total per page)
    const pages: ILibrary[][][] = []
    for (let i = 0; i < items.length; i += 6) {
      const page = items.slice(i, i + 6)
      const rows: ILibrary[][] = []
      for (let j = 0; j < page.length; j += 3) {
        rows.push(page.slice(j, j + 3))
      }
      pages.push(rows)
    }
    return pages
  } else {
    // For HomeScreen: 4-column grid
    const grid: ILibrary[][] = []
    for (let i = 0; i < items.length; i += 4) {
      grid.push(items.slice(i, i + 4))
    }
    return grid
  }
}

export default function DailyDuas({
  items,
  navigation,
  currentSound,
  duasScreen,
  title,
}: {
  items: ILibrary[]
  navigation: any
  currentSound?: Track
  duasScreen?: boolean
  title?: string
}) {
  const flatListRef = React.useRef<FlatList>(null)

  if (duasScreen) {
    // For DuaListScreen: Horizontal pagination with 2 rows of 3 items
    const pages = convertListToGrid(items, true) as ILibrary[][][]

    return (
      <View>
        <Text style={$header} text={title ?? "Daily Duas"} weight="bold" preset="subheading" />
        <View style={$container}>
          <FlatList
            ref={flatListRef}
            data={pages}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            renderItem={({
              item: page,
              index: pageIndex,
            }: {
              item: ILibrary[][]
              index: number
            }) => (
              <View key={pageIndex} style={$pageContainer}>
                {page.map((row: ILibrary[], rowIndex: number) => (
                  <View key={rowIndex} style={$duaRowContainer}>
                    {row.map((item: ILibrary, itemIndex: number) => (
                      <DailyCard
                        key={item.id}
                        currentSoundId={currentSound?.id ?? -1}
                        navigation={navigation}
                        item={item}
                        isFirstInRow={itemIndex === 0}
                        isLastInRow={itemIndex === row.length - 1}
                        isFirstRow={rowIndex === 0}
                        isLastRow={rowIndex === page.length - 1}
                        duasScreen={true}
                      />
                    ))}
                    {/* Fill remaining space if row has less than 3 items */}
                    {Array.from({ length: 3 - row.length }).map((_: any, emptyIndex: number) => (
                      <View key={`empty-${emptyIndex}`} style={$duaEmptySpace} />
                    ))}
                    {/* Add half-visible item to indicate scrollability */}
                    {rowIndex === 0 && page.length > 0 && (
                      <View style={$halfVisibleItem}>
                        <View style={$duaCardStyle}>
                          <Image
                            style={$cardPdfImage}
                            source={require("../../../../assets/images/pdf.png")}
                            alt=""
                          />
                        </View>
                        <Text style={$duaCardText} numberOfLines={1}>
                          ...
                        </Text>
                      </View>
                    )}
                  </View>
                ))}
              </View>
            )}
            keyExtractor={(_: any, index: number) => index.toString()}
            getItemLayout={(data: any, index: number) => ({
              length: screenWidth * 1.2,
              offset: screenWidth * 1.2 * index,
              index,
            })}
          />
        </View>
      </View>
    )
  }

  // For HomeScreen: 4-column grid
  return (
    <View style={$container}>
      <Text style={$header} text="Daily Duas" weight="bold" preset="subheading" />
      <View style={$container}>
        {(convertListToGrid(items, false) as ILibrary[][]).map((row, rowIndex) => (
          <View key={rowIndex} style={$rowContainer}>
            {row.map((item, itemIndex) => (
              <DailyCard
                key={item.id}
                currentSoundId={currentSound?.id ?? -1}
                navigation={navigation}
                item={item}
                isFirstInRow={itemIndex === 0}
                isLastInRow={itemIndex === row.length - 1}
                isFirstRow={rowIndex === 0}
                isLastRow={
                  rowIndex === (convertListToGrid(items, false) as ILibrary[][]).length - 1
                }
                duasScreen={false}
              />
            ))}
            {/* Fill remaining space if row has less than 4 items */}
            {Array.from({ length: 4 - row.length }).map((_, emptyIndex) => (
              <View key={`empty-${emptyIndex}`} style={$emptySpace} />
            ))}
          </View>
        ))}
      </View>
    </View>
  )
}

const $header: TextStyle = {
  marginStart: spacing.lg,
}

interface DailyCardProps {
  item: ILibrary
  navigation: any
  currentSoundId: number
  isFirstInRow: boolean
  isLastInRow: boolean
  isFirstRow: boolean
  isLastRow: boolean
  duasScreen: boolean
}

function DailyCard(props: DailyCardProps) {
  const isCurrentPlaying = props.item.id === props.currentSoundId

  return (
    <Pressable
      onPress={() => {
        props.navigation.navigate("PdfViewer", { ...props.item })
      }}
      style={[
        props.duasScreen ? $duaPdfCard : $pdfCard,
        props.isFirstInRow && $firstCard,
        props.isLastInRow && $lastCard,
      ]}
    >
      <View style={props.duasScreen ? $duaCardStyle : $cardStyle}>
        {!isCurrentPlaying ? (
          <Image
            style={$cardPdfImage}
            source={require("../../../../assets/images/pdf.png")}
            alt=""
          />
        ) : (
          <LottieView
            style={$cardLottie}
            source={require("../../../../assets/animation/music.json")}
            autoPlay
            loop
          />
        )}
      </View>
      <Text
        className="mt-1 ml-1"
        style={props.duasScreen ? $duaCardText : $cardText}
        text={props.item.name}
      />
    </Pressable>
  )
}

const $rowContainer: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-between",
  paddingHorizontal: spacing.lg,
}

const $cardPdfImage: ImageStyle = {
  height: 50,
  width: 50,
  position: "relative",
  left: 5,
  zIndex: 100,
}

const $cardLottie: ViewStyle = {
  height: 50,
  width: 50,
  position: "relative",
  zIndex: 100,
}

const $cardStyle: ViewStyle = {
  borderWidth: 1,
  borderColor: colors.border,
  borderRadius: 20,
  borderCurve: "continuous",
  width: (screenWidth - spacing.lg * 2 - 30) / 4, // Account for padding and 3 gaps between 4 items
  height: (screenWidth - spacing.lg * 2 - 30) / 4,
  padding: 0,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  shadowColor: colors.gray,
  backgroundColor: colors.white,
  shadowOffset: {
    width: 2,
    height: 2,
  },
  shadowOpacity: 0.9,
  shadowRadius: 3.84,
  elevation: 5,
}

const $cardText: TextStyle = {
  fontSize: 12,
  maxWidth: (screenWidth - spacing.lg * 2 - 30) / 4 - 10, // Match card width minus padding
  height: 40,
  lineHeight: 14,
  flexWrap: "wrap",
  textAlign: "center",
}

const $firstCard: ViewStyle = {
  // No special margin needed with gap
}

const $lastCard: ViewStyle = {
  // No special margin needed with gap
}

const $pdfCard: ViewStyle = {
  width: (screenWidth - spacing.lg * 2 - 30) / 4,
  justifyContent: "center",
  alignItems: "center",
  flexDirection: "column",
  padding: 0,
  shadowOpacity: 0,
  backgroundColor: "transparent",
}

const $emptySpace: ViewStyle = {
  width: (screenWidth - spacing.lg * 2 - 30) / 4,
}

const $container: ViewStyle = {
  flexDirection: "column",
  marginTop: 10,
  overflow: "visible",
  marginBottom: 16,
}

// Styles for DuaListScreen (2 rows of 3.5 items with horizontal pagination)
const $pageContainer: ViewStyle = {
  width: screenWidth * 1.15, // Slightly less wide for better proportions
  flexDirection: "column",
  paddingHorizontal: spacing.lg,
  paddingRight: spacing.lg + 15, // Extra padding on right for better spacing
}

const $duaRowContainer: ViewStyle = {
  flexDirection: "row",
  justifyContent: "flex-start",
  marginBottom: 12,
  gap: 6,
}

const $duaCardStyle: ViewStyle = {
  borderWidth: 1,
  borderColor: colors.border,
  borderRadius: 20,
  borderCurve: "continuous",
  width: (screenWidth * 1.15 - spacing.lg * 2 - 18) / 3.5, // Account for 3 gaps of 6px each
  height: (screenWidth * 1.15 - spacing.lg * 2 - 18) / 3.5,
  padding: 0,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  shadowColor: colors.gray,
  backgroundColor: colors.white,
  shadowOffset: {
    width: 2,
    height: 2,
  },
  shadowOpacity: 0.9,
  shadowRadius: 3.84,
  elevation: 5,
}

const $duaCardText: TextStyle = {
  fontSize: 11,
  maxWidth: (screenWidth * 1.15 - spacing.lg * 2 - 18) / 3.5 - 10, // Match card width minus padding
  height: 45,
  lineHeight: 15,
  flexWrap: "wrap",
  textAlign: "center",
}

const $duaPdfCard: ViewStyle = {
  width: (screenWidth * 1.15 - spacing.lg * 2 - 18) / 3.5,
  justifyContent: "center",
  alignItems: "center",
  flexDirection: "column",
  padding: 0,
  shadowOpacity: 0,
  backgroundColor: "transparent",
}

const $duaEmptySpace: ViewStyle = {
  width: (screenWidth * 1.15 - spacing.lg * 2 - 18) / 3.5,
}

const $halfVisibleItem: ViewStyle = {
  width: ((screenWidth * 1.15 - spacing.lg * 2 - 18) / 3.5) * 0.5, // Half width
  justifyContent: "center",
  alignItems: "center",
  flexDirection: "column",
  padding: 0,
  opacity: 0.6, // Make it slightly transparent to indicate it's a preview
}
