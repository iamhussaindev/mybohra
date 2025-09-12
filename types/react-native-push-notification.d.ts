declare module "react-native-push-notification" {
  import { Importance } from "react-native-push-notification"

  export interface LocalNotificationSchedule {
    id: string
    title: string
    message: string
    date: Date
    soundName?: string
    vibrate?: boolean
    vibration?: number
    priority?: "high" | "low" | "max" | "min" | "default"
    importance?: "high" | "low" | "max" | "min" | "default"
    channelId?: string
    userInfo?: any
    repeatType?: string
    repeatTime?: number
  }

  export interface NotificationChannel {
    channelId: string
    channelName: string
    channelDescription: string
    playSound?: boolean
    soundName?: string
    importance: Importance
    vibrate?: boolean
  }

  export interface NotificationConfig {
    onRegister?: (token: any) => void
    onNotification?: (notification: any) => void
    onAction?: (notification: any) => void
    onRegistrationError?: (err: any) => void
    permissions?: {
      alert?: boolean
      badge?: boolean
      sound?: boolean
    }
    popInitialNotification?: boolean
    requestPermissions?: boolean
  }

  export enum Importance {
    DEFAULT = 3,
    HIGH = 4,
    LOW = 2,
    MAX = 5,
    MIN = 1,
    NONE = 0,
    UNSPECIFIED = -1000,
  }

  const PushNotification: {
    configure: (config: NotificationConfig) => void
    createChannel: (channel: NotificationChannel, callback: (created: boolean) => void) => void
    localNotificationSchedule: (notification: LocalNotificationSchedule) => void
    cancelLocalNotifications: (options: { id: string }) => void
    cancelLocalNotification: (options: { id: string }) => void
    cancelAllLocalNotifications: () => void
    getScheduledLocalNotifications: (callback: (notifications: any[]) => void) => void
    setApplicationIconBadgeNumber: (count: number) => void
  }

  export default PushNotification
}
