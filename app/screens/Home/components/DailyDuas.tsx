import React from "react"
import { Text } from "app/components"
import {
  Dimensions,
  FlatList,
  TextStyle,
  View,
  ViewStyle,
  Image,
  ImageStyle,
  Pressable,
} from "react-native"
import { colors, spacing } from "app/theme"
import { ILibrary } from "app/models/LibraryStore"
import LottieView from "lottie-react-native"
import { Track } from "react-native-track-player"

const screenWidth = Dimensions.get("window").width

const convertListToGrid = (items: ILibrary[]): ILibrary[][] => {
  const grid = []
  for (let i = 0; i < items.length; i += 2) {
    grid.push(items.slice(i, i + 2))
  }
  return grid
}

export default function DailyDuas({
  items,
  navigation,
  currentSound,
}: {
  items: ILibrary[]
  navigation: any
  currentSound?: Track
}) {
  const flatListRef = React.useRef<FlatList>(null)
  const activeItemIndex = 1

  return (
    <View>
      <Text style={$header} text="Daily Duas (PDF)" weight="bold" preset="subheading" />
      <View style={$container}>
        <FlatList
          style={$flatListStyle}
          ref={flatListRef}
          data={convertListToGrid(items)}
          ItemSeparatorComponent={() => <View style={$gap} />}
          renderItem={({ item, index }) => {
            return (
              <DailyCards
                currentSoundId={currentSound?.id ?? -1}
                navigation={navigation}
                items={item}
                total={items.length}
                index={index}
                activeIndex={activeItemIndex}
              />
            )
          }}
          getItemLayout={(data, index) => ({
            length: screenWidth / 4,
            offset: (screenWidth / 4) * index,
            index,
          })}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
        />
      </View>
    </View>
  )
}

const $header: TextStyle = {
  marginStart: spacing.lg,
}

interface DailyCardProps {
  index: number
  activeIndex: number
  total: number
  items: ILibrary[]
  navigation: any
  currentSoundId: number
}

function DailyCards(props: DailyCardProps) {
  return (
    <View
      style={[
        $mainContainer,
        props.index === 0 && $firstCard,
        props.index === Math.ceil(props.total / 2) - 1 && $lastCard,
      ]}
    >
      {props.items.map((item) => {
        const isCurrentPlaying = item.id === props.currentSoundId

        return (
          <Pressable
            onPress={() => {
              props.navigation.navigate("PdfViewer", { ...item })
            }}
            key={item.id}
            style={$pdfCard}
          >
            <View style={$cardStyle}>
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
            <Text className="mt-1 ml-1" style={$cardText} text={item.name} />
          </Pressable>
        )
      })}
    </View>
  )
}

const $mainContainer: ViewStyle = {
  flexDirection: "column",
  justifyContent: "space-between",
  marginTop: 10,
  marginBottom: 0,
  overflow: "visible",
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
  width: screenWidth / 4,
  height: screenWidth / 4,
  padding: 0,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",

  flex: 1,
  shadowColor: colors.gray,
  backgroundColor: colors.palette.neutral100,
  shadowOffset: {
    width: 2,
    height: 2,
  },
  shadowOpacity: 0.9,
  shadowRadius: 3.84,
  elevation: 5,
}

const $cardText: TextStyle = {
  fontSize: 11,
  maxWidth: 80,
  height: 50,
  lineHeight: 16,
  flexWrap: "wrap",
  textAlign: "center",
}

const $flatListStyle: ViewStyle = {
  overflow: "visible",
}

const $firstCard: ViewStyle = {
  marginLeft: spacing.lg,
}

const $lastCard: ViewStyle = {
  marginRight: spacing.lg,
}

const $pdfCard: ViewStyle = {
  width: screenWidth / 4,
  justifyContent: "center",
  alignItems: "center",
  flexDirection: "column",
  padding: 0,
  shadowOpacity: 0,
}

const $gap: ViewStyle = {
  width: 15,
}

const $container: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-between",
  marginTop: 10,
  overflow: "visible",
}
