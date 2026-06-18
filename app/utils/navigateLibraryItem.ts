import { ILibrary } from "app/models/LibraryStore"
import type { AppStackParamList } from "app/navigators/AppNavigator"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import {
  extractYouTubeVideoId,
  getLibraryAccessTag,
  hasPdfDocument,
  isAtsDeeplinkItem,
  isAtsPublicYouTubeItem,
  isPublicNativeAudioItem,
} from "app/utils/libraryAccess"
import { Alert, Linking } from "react-native"

type Navigation = NativeStackNavigationProp<AppStackParamList>

export function libraryItemToYouTubeVideo(item: ILibrary) {
  const videoId = extractYouTubeVideoId(item) ?? ""
  const watchUrl = item.youtube_url ?? `https://www.youtube.com/watch?v=${videoId}`

  return {
    id: item.youtube_id ?? item.id,
    video_id: videoId,
    title: item.name,
    description: item.description ?? null,
    duration: item.youtube_duration ?? null,
    view_count: item.view_count ?? null,
    upload_date: null,
    url: watchUrl,
    thumbnail: item.youtube_thumbnail ?? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
    thumbnail_default: null,
    thumbnail_medium: null,
    thumbnail_high: item.youtube_thumbnail ?? null,
    thumbnail_standard: null,
    thumbnail_maxres: null,
    channel_url: null,
    channel_handle: null,
    created_at: item.created_at,
    updated_at: item.updated_at,
    tags: item.tags ?? null,
    categories: item.categories ?? null,
    library_id: item.id,
  }
}

export async function openSautulimanDeeplink(item: ILibrary): Promise<boolean> {
  const url = item.deeplink_url?.trim()
  if (!url) {
    Alert.alert(
      "Open in Sautuliman",
      "This item is marked ATS but has no deeplink configured yet.",
    )
    return false
  }

  const canOpen = await Linking.canOpenURL(url)
  if (!canOpen) {
    Alert.alert("Cannot open link", "The Sautuliman app link could not be opened on this device.")
    return false
  }

  await Linking.openURL(url)
  return true
}

/** Route a library item tap from the audio library screen. */
export async function navigateLibraryAudioItem(
  navigation: Navigation,
  item: ILibrary,
  options?: { album?: string },
): Promise<void> {
  if (isAtsDeeplinkItem(item)) {
    await openSautulimanDeeplink(item)
    return
  }

  if (isAtsPublicYouTubeItem(item)) {
    navigation.navigate("YouTubePlayer", { video: libraryItemToYouTubeVideo(item) as any })
    return
  }

  if (isPublicNativeAudioItem(item)) {
    navigation.navigate("AudioPlayer", {
      album: options?.album || item.album || "",
      trackId: item.id,
    })
    return
  }

  if (hasPdfDocument(item)) {
    navigation.navigate("PdfViewer", item as any)
    return
  }

  Alert.alert("Unavailable", "This library item has no playable media attached.")
}

/** Route a library item tap from PDF / Dua flows — PDF always opens in-app. */
export function navigateLibraryPdfItem(navigation: Navigation, item: ILibrary): void {
  navigation.navigate("PdfViewer", item as any)
}

/** Route PDF-screen audio control press. */
export async function navigateLibraryPdfAudio(
  navigation: Navigation,
  item: ILibrary,
): Promise<void> {
  if (isAtsDeeplinkItem(item)) {
    await openSautulimanDeeplink(item)
    return
  }

  if (isAtsPublicYouTubeItem(item)) {
    navigation.navigate("YouTubePlayer", { video: libraryItemToYouTubeVideo(item) as any })
    return
  }
}

export function filterNativeAudioQueue(items: ILibrary[]): ILibrary[] {
  return items.filter(isPublicNativeAudioItem)
}

export function describeLibraryAccess(item: ILibrary): string {
  const tag = getLibraryAccessTag(item)
  if (tag === "ATS") return "Opens in Sautuliman app"
  if (tag === "ATS_PUBLIC") return "Plays on YouTube"
  return "Plays in MyBohra"
}
