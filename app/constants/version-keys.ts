/**
 * Version Keys Constants
 *
 * Centralized constants for all version keys used in the app.
 * This ensures consistency across the codebase and makes it easy to update.
 */

export const VERSION_KEYS = {
  // Alternative naming convention (if needed)
  DUA_VERSION: "dua_version",
  TASBEEH_VERSION: "tasbeeh_version",
  LOCATION_VERSION: "location_version",
  MIQAAT_VERSION: "miqaat_version",
} as const

export type VersionKey = (typeof VERSION_KEYS)[keyof typeof VERSION_KEYS]

/**
 * Default version values
 */
export const DEFAULT_VERSIONS = {
  [VERSION_KEYS.DUA_VERSION]: 1,
  [VERSION_KEYS.TASBEEH_VERSION]: 1,
  [VERSION_KEYS.LOCATION_VERSION]: 1,
  [VERSION_KEYS.MIQAAT_VERSION]: 1,
} as const

/**
 * Get version key for a specific module
 */
export function getVersionKey(module: keyof typeof DEFAULT_VERSIONS): string {
  return VERSION_KEYS[module as unknown as keyof typeof VERSION_KEYS]
}

/**
 * Get default version for a specific module
 */
export function getDefaultVersion(module: keyof typeof DEFAULT_VERSIONS): number {
  return DEFAULT_VERSIONS[module as unknown as keyof typeof DEFAULT_VERSIONS]
}
