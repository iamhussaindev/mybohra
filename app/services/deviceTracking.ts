import { supabase } from "app/services/supabase"
import type { Database } from "app/services/supabase/types"
import * as storage from "app/utils/storage"
import * as Application from "expo-application"
import Constants from "expo-constants"
import * as Device from "expo-device"
import { Platform } from "react-native"

type DeviceRow = Database["public"]["Tables"]["devices"]["Row"]
type DeviceInsert = Database["public"]["Tables"]["devices"]["Insert"]
type DeviceUpdate = Database["public"]["Tables"]["devices"]["Update"]

const DEVICE_ID_STORAGE_KEY = "DEVICE_ID"

/**
 * Generate or retrieve a unique device ID
 */
async function getOrCreateDeviceId(): Promise<string> {
  try {
    // Try to get existing device ID from storage
    const existingDeviceId = await storage.load(DEVICE_ID_STORAGE_KEY)
    if (existingDeviceId && typeof existingDeviceId === "string") {
      return existingDeviceId
    }

    // Generate new device ID using expo-application
    let applicationId: string | null = null

    try {
      if (Platform.OS === "android") {
        applicationId = await Application.getAndroidId()
      } else if (Platform.OS === "ios") {
        applicationId = await Application.getIosIdForVendorAsync()
      }
    } catch (error) {
      console.warn("Error getting application ID:", error)
    }

    if (applicationId) {
      await storage.save(DEVICE_ID_STORAGE_KEY, applicationId)
      return applicationId
    }

    // Fallback: Generate UUID-like string
    const fallbackId = `device_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
    await storage.save(DEVICE_ID_STORAGE_KEY, fallbackId)
    return fallbackId
  } catch (error) {
    console.error("Error getting device ID:", error)
    // Fallback device ID
    const fallbackId = `device_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
    await storage.save(DEVICE_ID_STORAGE_KEY, fallbackId)
    return fallbackId
  }
}

/**
 * Get current user ID from Supabase auth session
 */
async function getCurrentUserId(): Promise<string | null> {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    return session?.user?.id || null
  } catch (error) {
    console.error("Error getting user session:", error)
    return null
  }
}

/**
 * Get device IP address (optional, can be skipped)
 */
async function getDeviceIP(): Promise<string | null> {
  // For React Native, getting IP is complex and may require a service
  // For now, we'll skip this or you can integrate a service like ipify
  return null
}

/**
 * Calculate distance between two coordinates in meters (Haversine formula)
 */
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000 // Earth's radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c // Distance in meters
}

/**
 * Check if location has changed significantly (more than threshold in meters)
 */
function hasLocationChangedSignificantly(
  oldLat: number | null,
  oldLng: number | null,
  newLat: number | null,
  newLng: number | null,
  thresholdMeters = 1000, // Default 1km threshold
): boolean {
  if (!oldLat || !oldLng || !newLat || !newLng) {
    // If we don't have old location, consider it changed
    return !!(newLat && newLng)
  }

  const distance = calculateDistance(oldLat, oldLng, newLat, newLng)
  return distance > thresholdMeters
}

/**
 * Collect all device information
 */
async function collectDeviceInfo(
  location?: { latitude: number; longitude: number } | null,
): Promise<Omit<DeviceInsert, "id" | "device_id" | "user_id">> {
  const deviceInfo: Omit<DeviceInsert, "id" | "device_id" | "user_id"> = {
    model: Device.modelName || null,
    platform: Platform.OS || null,
    platform_version: Platform.Version?.toString() || null,
    manufacturer: Device.manufacturer || null,
    os_version: Device.osVersion || null,
    app_version: Constants.expoConfig?.version || Application.nativeApplicationVersion || null,
    user_agent:
      Platform.select({
        ios: `iOS/${Device.osVersion} ${Device.modelName}`,
        android: `Android/${Device.osVersion} ${Device.manufacturer} ${Device.modelName}`,
        default: `${Platform.OS}/${Platform.Version}`,
      }) || null,
    device_ip: await getDeviceIP(),
    metadata: {
      brand: Device.brand || null,
      deviceType: Device.deviceType || null,
      totalMemory: Device.totalMemory || null,
      isDevice: Device.isDevice,
      supportedCpuArchitectures: Device.supportedCpuArchitectures || null,
      expoVersion: Constants.expoConfig?.version || null,
      installationId: Constants.installationId || null,
    },
    last_seen_at: new Date().toISOString(),
    // Include location if provided
    current_lat: location?.latitude || null,
    current_lng: location?.longitude || null,
    location_updated_at: location ? new Date().toISOString() : null,
  }

  return deviceInfo
}

/**
 * Upsert device information to Supabase
 * @param location - Optional location coordinates. If provided, will only update if location changed significantly
 * @param locationThresholdMeters - Distance threshold in meters to consider location changed (default: 1000m = 1km)
 */
export async function trackDevice(
  location?: { latitude: number; longitude: number } | null,
  locationThresholdMeters = 1000,
): Promise<{ success: boolean; error?: string; locationUpdated?: boolean }> {
  try {
    // Get device ID (persistent across sessions)
    const deviceId = await getOrCreateDeviceId()

    // Get user ID from auth session
    const userId = await getCurrentUserId()

    // Check if device exists and get current location
    let shouldUpdateLocation = true
    let existingLocation: { lat: number | null; lng: number | null } | null = null

    if (location) {
      try {
        // Fetch existing device to check current location
        const { data: existingDevice, error: fetchError } = await supabase
          .from("devices")
          .select("current_lat, current_lng")
          .eq("device_id", deviceId)
          .single()

        // If fetch fails due to network error, skip location check and proceed
        if (fetchError && fetchError.message?.includes("Network request failed")) {
          console.warn("Network error fetching existing device, proceeding without location check")
          shouldUpdateLocation = true // Update location anyway if we can't check
        } else if (existingDevice) {
          existingLocation = {
            lat: (existingDevice as DeviceRow).current_lat || null,
            lng: (existingDevice as DeviceRow).current_lng || null,
          }

          // Only update location if it changed significantly
          shouldUpdateLocation = hasLocationChangedSignificantly(
            existingLocation.lat,
            existingLocation.lng,
            location.latitude,
            location.longitude,
            locationThresholdMeters,
          )
        }
      } catch (fetchErr) {
        // If fetching existing device fails, proceed without location check
        console.warn("Error fetching existing device location:", fetchErr)
        shouldUpdateLocation = true
      }
    }

    // Collect device information (include location only if we should update it)
    const deviceInfo = await collectDeviceInfo(shouldUpdateLocation ? location : null)

    // Prepare device data
    const deviceData: DeviceInsert = {
      device_id: deviceId,
      user_id: userId,
      ...deviceInfo,
      last_seen_at: new Date().toISOString(),
    }

    // Upsert device (update if exists, insert if not)
    const { error } = await supabase.from("devices").upsert(
      [
        {
          ...deviceData,
          updated_at: new Date().toISOString(),
        },
      ],
      {
        onConflict: "device_id",
        ignoreDuplicates: false,
      },
    )

    if (error) {
      // Check if it's a network error
      if (error.message?.includes("Network request failed") || error.message?.includes("fetch")) {
        console.warn(
          "Network error tracking device (offline or network unavailable):",
          error.message,
        )
        // Return success: false but don't throw - this is expected when offline
        return {
          success: false,
          error: "Network unavailable",
        }
      }
      console.error("Error tracking device:", error)
      return { success: false, error: error.message }
    }

    // Update last_seen_at separately to ensure it's always updated
    try {
      const { error: updateError } = await supabase
        .from("devices")
        .update({ last_seen_at: new Date().toISOString() })
        .eq("device_id", deviceId)

      if (updateError) {
        // Don't fail if this is just a network error
        if (!updateError.message?.includes("Network request failed")) {
          console.error("Error updating last_seen_at:", updateError)
        }
      }
    } catch (updateErr) {
      // Silently ignore update errors - last_seen_at update is not critical
      if (__DEV__) {
        console.warn("Error updating last_seen_at:", updateErr)
      }
    }

    return { success: true, locationUpdated: shouldUpdateLocation && !!location }
  } catch (error) {
    // Handle network errors gracefully
    if (error instanceof Error) {
      if (error.message?.includes("Network request failed") || error.message?.includes("fetch")) {
        console.warn("Network error in trackDevice (offline):", error.message)
        return {
          success: false,
          error: "Network unavailable",
        }
      }
    }
    console.error("Error in trackDevice:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

/**
 * Get stored device ID
 */
export async function getDeviceId(): Promise<string | null> {
  try {
    const deviceId = await storage.load(DEVICE_ID_STORAGE_KEY)
    return typeof deviceId === "string" ? deviceId : null
  } catch (error) {
    console.error("Error getting device ID:", error)
    return null
  }
}
