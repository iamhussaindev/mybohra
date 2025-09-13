import AsyncStorage from "@react-native-async-storage/async-storage"
import { Platform } from "react-native"
import DeviceInfo from "react-native-device-info"

interface ActionLog {
  id: string
  timestamp: number
  action: string
  category: string
  parameters?: Record<string, any>
  userId?: string
  sessionId: string
  deviceId: string
  platform: string
  appVersion: string
  isUploaded: boolean
}

interface UploadBatch {
  deviceId: string
  userId?: string
  actions: ActionLog[]
  batchId: string
  timestamp: number
}

interface ActionLoggerConfig {
  maxLocalStorageSize: number // Maximum number of actions to store locally
  uploadIntervalMs: number // How often to attempt upload (in milliseconds)
  batchSize: number // Maximum actions per upload batch
  retryAttempts: number // Number of retry attempts for failed uploads
  serverEndpoint?: string // Server endpoint for uploading data
}

class ActionLoggerService {
  private config: ActionLoggerConfig
  private deviceId = ""
  private sessionId = ""
  private userId: string | null = null
  private isInitialized = false
  private uploadTimer: NodeJS.Timeout | null = null
  private isUploading = false
  private actionQueue: ActionLog[] = []
  private uploadQueue: ActionLog[] = []

  constructor(config?: Partial<ActionLoggerConfig>) {
    this.config = {
      maxLocalStorageSize: 1000, // Store up to 1000 actions locally
      uploadIntervalMs: 30000, // Upload every 30 seconds
      batchSize: 50, // Upload up to 50 actions per batch
      retryAttempts: 3,
      serverEndpoint: process.env.EXPO_PUBLIC_ANALYTICS_SERVER_URL,
      ...config,
    }
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return

    try {
      // Get device information
      this.deviceId = await this.getOrCreateDeviceId()
      this.sessionId = this.generateSessionId()

      // Load existing user ID
      this.userId = (await AsyncStorage.getItem("action_logger_user_id")) || null

      // Load pending actions from storage
      await this.loadPendingActions()

      // Start periodic upload
      this.startPeriodicUpload()

      this.isInitialized = true
      console.log("Action Logger initialized successfully")

      // Log initialization
      await this.logAction("action_logger_initialized", "system", {
        deviceId: this.deviceId,
        sessionId: this.sessionId,
        userId: this.userId,
        platform: Platform.OS,
      })
    } catch (error) {
      console.error("Failed to initialize Action Logger:", error)
    }
  }

  async logAction(
    action: string,
    category: string,
    parameters?: Record<string, any>,
    userId?: string,
  ): Promise<void> {
    // Skip heartbeat events
    if (action === "user_heartbeat") {
      return
    }

    if (!this.isInitialized) {
      console.warn("Action Logger not initialized, queuing action")
      // Queue action for when initialized
      this.actionQueue.push({
        id: this.generateActionId(),
        timestamp: Date.now(),
        action,
        category,
        parameters,
        userId: userId || this.userId || undefined,
        sessionId: this.sessionId,
        deviceId: this.deviceId,
        platform: Platform.OS,
        appVersion: "unknown",
        isUploaded: false, // Keep for backward compatibility, but not used
      })
      return
    }

    try {
      const actionLog: ActionLog = {
        id: this.generateActionId(),
        timestamp: Date.now(),
        action,
        category,
        parameters: this.sanitizeParameters(parameters),
        userId: userId || this.userId || undefined,
        sessionId: this.sessionId,
        deviceId: this.deviceId,
        platform: Platform.OS,
        appVersion: await this.getAppVersion(),
        isUploaded: false, // Keep for backward compatibility, but not used
      }

      // Store locally
      await this.storeActionLocally(actionLog)

      // Add to upload queue
      this.uploadQueue.push(actionLog)

      // Trigger immediate upload if queue is getting large
      if (this.uploadQueue.length >= this.config.batchSize) {
        this.uploadActions()
      }

      console.log(`📝 Action logged: ${action} (${category})`)
    } catch (error) {
      console.error("Failed to log action:", error)
    }
  }

  async setUserId(userId: string): Promise<void> {
    try {
      this.userId = userId
      await AsyncStorage.setItem("action_logger_user_id", userId)

      // Update all pending actions with new user ID
      await this.updatePendingActionsUserId(userId)

      console.log(`👤 User ID set for Action Logger: ${userId}`)
    } catch (error) {
      console.error("Failed to set user ID:", error)
    }
  }

  async clearUserId(): Promise<void> {
    try {
      this.userId = null
      await AsyncStorage.removeItem("action_logger_user_id")
      console.log("👤 User ID cleared for Action Logger")
    } catch (error) {
      console.error("Failed to clear user ID:", error)
    }
  }

  async getPendingActionsCount(): Promise<number> {
    try {
      const stored = await AsyncStorage.getItem("action_logger_pending")
      const actions: ActionLog[] = stored ? JSON.parse(stored) : []
      return actions.length
    } catch (error) {
      console.error("Failed to get pending actions count:", error)
      return 0
    }
  }

  async getUploadedActionsCount(): Promise<number> {
    try {
      const stored = await AsyncStorage.getItem("action_logger_uploaded")
      const count = stored ? parseInt(stored, 10) : 0
      return count
    } catch (error) {
      console.error("Failed to get uploaded actions count:", error)
      return 0
    }
  }

  async exportActions(limit = 100): Promise<ActionLog[]> {
    try {
      const stored = await AsyncStorage.getItem("action_logger_pending")
      const actions: ActionLog[] = stored ? JSON.parse(stored) : []
      return actions.slice(-limit) // Return most recent actions
    } catch (error) {
      console.error("Failed to export actions:", error)
      return []
    }
  }

  async clearAllActions(): Promise<void> {
    try {
      await AsyncStorage.removeItem("action_logger_pending")
      await AsyncStorage.removeItem("action_logger_uploaded")
      this.uploadQueue = []
      console.log("🗑️ All actions cleared")
    } catch (error) {
      console.error("Failed to clear actions:", error)
    }
  }

  private async getOrCreateDeviceId(): Promise<string> {
    try {
      let deviceId = await AsyncStorage.getItem("action_logger_device_id")
      if (!deviceId) {
        deviceId = await DeviceInfo.getUniqueId()
        await AsyncStorage.setItem("action_logger_device_id", deviceId)
      }
      return deviceId
    } catch (error) {
      console.error("Failed to get device ID:", error)
      return `device_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
    }
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
  }

  private generateActionId(): string {
    return `action_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
  }

  private async getAppVersion(): Promise<string> {
    try {
      return await DeviceInfo.getVersion()
    } catch (error) {
      return "unknown"
    }
  }

  private sanitizeParameters(parameters?: Record<string, any>): Record<string, any> | undefined {
    if (!parameters) return undefined

    const sanitized: Record<string, any> = {}

    for (const [key, value] of Object.entries(parameters)) {
      // Remove sensitive data
      if (
        key.toLowerCase().includes("password") ||
        key.toLowerCase().includes("token") ||
        key.toLowerCase().includes("secret")
      ) {
        continue
      }

      // Sanitize value
      if (typeof value === "string" && value.length > 500) {
        sanitized[key] = value.substring(0, 500) + "..."
      } else if (typeof value === "object" && value !== null) {
        sanitized[key] = "[object]"
      } else {
        sanitized[key] = value
      }
    }

    return sanitized
  }

  private async storeActionLocally(action: ActionLog): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem("action_logger_pending")
      const actions: ActionLog[] = stored ? JSON.parse(stored) : []

      actions.push(action)

      // Keep only the most recent actions to prevent storage bloat
      if (actions.length > this.config.maxLocalStorageSize) {
        actions.splice(0, actions.length - this.config.maxLocalStorageSize)
      }

      await AsyncStorage.setItem("action_logger_pending", JSON.stringify(actions))
    } catch (error) {
      console.error("Failed to store action locally:", error)
    }
  }

  private async loadPendingActions(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem("action_logger_pending")
      const actions: ActionLog[] = stored ? JSON.parse(stored) : []

      // All actions in storage are pending since we delete uploaded ones
      this.uploadQueue = actions

      console.log(`📦 Loaded ${actions.length} pending actions`)
    } catch (error) {
      console.error("Failed to load pending actions:", error)
    }
  }

  private async updatePendingActionsUserId(userId: string): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem("action_logger_pending")
      const actions: ActionLog[] = stored ? JSON.parse(stored) : []

      // Update all actions with new user ID (all are pending since we delete uploaded ones)
      const updatedActions = actions.map((action) => ({
        ...action,
        userId,
      }))

      await AsyncStorage.setItem("action_logger_pending", JSON.stringify(updatedActions))
    } catch (error) {
      console.error("Failed to update pending actions user ID:", error)
    }
  }

  private startPeriodicUpload(): void {
    if (this.uploadTimer) {
      clearInterval(this.uploadTimer)
    }

    this.uploadTimer = setInterval(() => {
      this.uploadActions()
    }, this.config.uploadIntervalMs)
  }

  private async uploadActions(): Promise<void> {
    if (this.isUploading || this.uploadQueue.length === 0) {
      return
    }

    this.isUploading = true

    try {
      // Take a batch of actions to upload
      const batch = this.uploadQueue.splice(0, this.config.batchSize)

      if (batch.length === 0) {
        this.isUploading = false
        return
      }

      const uploadBatch: UploadBatch = {
        deviceId: this.deviceId,
        userId: this.userId || undefined,
        actions: batch,
        batchId: `batch_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`,
        timestamp: Date.now(),
      }

      console.log(`📤 Uploading ${batch.length} actions to server...`)

      const success = await this.sendToServer(uploadBatch)

      if (success) {
        // Mark actions as uploaded
        await this.markActionsAsUploaded(batch)
        console.log(`✅ Successfully uploaded ${batch.length} actions`)
      } else {
        // Put actions back in queue for retry
        this.uploadQueue.unshift(...batch)
        console.log(`❌ Failed to upload ${batch.length} actions, will retry later`)
      }
    } catch (error) {
      console.error("Failed to upload actions:", error)
    } finally {
      this.isUploading = false
    }
  }

  private async sendToServer(batch: UploadBatch): Promise<boolean> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const response = await fetch(this.config.serverEndpoint!, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Device-ID": this.deviceId,
          "X-Platform": Platform.OS,
        },
        body: JSON.stringify(batch),
      })

      return response.ok
    } catch (error) {
      console.error("Server upload failed:", error)
      return false
    }
  }

  private async markActionsAsUploaded(actions: ActionLog[]): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem("action_logger_pending")
      const allActions: ActionLog[] = stored ? JSON.parse(stored) : []

      // Remove uploaded actions from local storage instead of just marking them
      const actionIds = new Set(actions.map((a) => a.id))
      const remainingActions = allActions.filter((action) => !actionIds.has(action.id))

      // Update local storage with remaining actions
      await AsyncStorage.setItem("action_logger_pending", JSON.stringify(remainingActions))

      // Update uploaded count
      const currentCount = await this.getUploadedActionsCount()
      await AsyncStorage.setItem(
        "action_logger_uploaded",
        (currentCount + actions.length).toString(),
      )

      console.log(`🗑️ Removed ${actions.length} uploaded actions from local storage`)
    } catch (error) {
      console.error("Failed to remove uploaded actions:", error)
    }
  }

  // Cleanup method
  destroy(): void {
    if (this.uploadTimer) {
      clearInterval(this.uploadTimer)
      this.uploadTimer = null
    }
  }
}

// Export singleton instance
export const actionLoggerService = new ActionLoggerService()
export default actionLoggerService
