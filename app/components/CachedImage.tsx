import { Image, ImageContentFit, ImageProps } from "expo-image"
import React from "react"
import { ImageStyle, StyleProp } from "react-native"

export interface CachedImageProps extends Omit<ImageProps, "source"> {
  uri: string | null | undefined
  style?: StyleProp<ImageStyle>
  contentFit?: ImageContentFit
}

/**
 * Remote image with memory-disk caching via expo-image.
 */
export function CachedImage({
  uri,
  style,
  contentFit = "cover",
  transition = 200,
  cachePolicy = "memory-disk",
  ...rest
}: CachedImageProps) {
  if (!uri) return null

  return (
    <Image
      source={{ uri }}
      style={style}
      contentFit={contentFit}
      transition={transition}
      cachePolicy={cachePolicy}
      {...rest}
    />
  )
}
