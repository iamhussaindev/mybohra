# Prayer Reminder System

A comprehensive reminder system that allows users to set notifications for prayer times based on their current location and prayer time calculations.

## Features

### 🕐 Smart Prayer Time Reminders

- **Location-based**: Reminders automatically adjust based on your current location
- **Dynamic timing**: Prayer times are calculated daily based on your coordinates
- **Flexible offsets**: Set reminders 30 minutes before, 15 minutes before, at prayer time, or up to 30 minutes after
- **Multiple prayer times**: Support for all prayer times (Fajr, Zawaal, Zohar, Asar, Sihori, Maghrib, Nisful-Layl)

### 🔄 Repeat Options

- **Daily**: Remind every day at the same prayer time
- **Weekly**: Choose specific days of the week
- **Monthly**: Remind monthly
- **Once only**: One-time reminder

### 📱 Native Notifications

- **Local notifications**: Works offline, no internet required
- **Customizable**: Set custom reminder names and descriptions
- **Persistent**: Reminders survive app restarts
- **Smart scheduling**: Automatically reschedules when location changes

## Architecture

### MobX State Tree Models

#### ReminderModel

```typescript
{
  id: string                    // Unique identifier
  name: string                  // User-defined reminder name
  prayerTime: PrayerTime        // Which prayer time to remind about
  offsetMinutes: number         // Minutes before/after prayer time
  isEnabled: boolean            // Whether reminder is active
  repeatType: RepeatType        // How often to repeat
  customDays: number[]          // Days of week for weekly repeat
  location: PlainLocation       // Location when reminder was created
  createdAt: number             // When reminder was created
  lastTriggered: number         // Last time reminder fired
  nextTriggerTime: number       // Next scheduled trigger time
}
```

#### ReminderStore

- Manages all reminders
- Handles CRUD operations
- Automatically reschedules when location changes
- Persists to AsyncStorage

### Hooks

#### useReminders()

Main hook for reminder management:

```typescript
const {
  reminders,                    // All reminders
  enabledReminders,            // Only active reminders
  remindersByPrayerTime,       // Grouped by prayer time
  createReminder,              // Create new reminder
  updateReminder,              // Update existing reminder
  deleteReminder,              // Delete reminder
  toggleReminder,              // Enable/disable reminder
  getRemindersForPrayerTime,   // Get reminders for specific prayer time
} = useReminders()
```

#### useReminderForm()

Form management hook:

```typescript
const {
  formData,                    // Current form state
  errors,                      // Validation errors
  updateField,                 // Update form field
  updatePrayerTime,            // Update prayer time selection
  updateOffset,                // Update timing offset
  updateRepeatType,            // Update repeat type
  toggleCustomDay,             // Toggle day for weekly repeat
  validateForm,                // Validate form data
  resetForm,                   // Reset form to initial state
  getOffsetDescription,        // Get human-readable offset
  getRepeatDescription,        // Get human-readable repeat type
} = useReminderForm()
```

### Notification Service

#### Features

- **Permission handling**: Automatically requests notification permissions
- **Channel management**: Creates Android notification channels
- **Scheduling**: Schedules local notifications with proper timing
- **Cancellation**: Cancels notifications when reminders are deleted/disabled
- **Badge management**: Manages app icon badge counts

#### Usage

```typescript
import { 
  schedulePrayerReminder, 
  cancelNotification,
  requestNotificationPermissions 
} from "app/services/notificationService"

// Schedule a reminder
await schedulePrayerReminder({
  id: "reminder_123",
  title: "Fajr Reminder",
  body: "Time for Fajr prayer",
  triggerTime: Date.now() + 3600000, // 1 hour from now
  repeatType: "daily",
})

// Cancel a reminder
await cancelNotification("reminder_123")
```

## Usage Examples

### Creating a Simple Daily Fajr Reminder

```typescript
const { createReminder } = useReminders()

await createReminder({
  name: "Fajr Prayer",
  prayerTime: "fajr",
  offsetMinutes: -15, // 15 minutes before
  repeatType: "daily",
})
```

### Creating a Weekly Reminder for Specific Days

```typescript
await createReminder({
  name: "Weekend Maghrib",
  prayerTime: "maghrib_safe",
  offsetMinutes: 0, // At prayer time
  repeatType: "weekly",
  customDays: [5, 6], // Friday and Saturday
})
```

### Quick Reminder from NamazScreen

```typescript
const handleQuickReminder = async (prayerTime: keyof ITimes) => {
  await createReminder({
    name: `${prayerTime} Reminder`,
    prayerTime: prayerTime as any,
    offsetMinutes: -5, // 5 minutes before
    repeatType: "daily",
  })
}
```

## Integration

### Adding to Navigation

The ReminderScreen is already exported from `app/screens/index.ts` and can be added to your navigation stack.

### Location Integration

The reminder system automatically integrates with the existing location system:

- Uses `dataStore.currentLocation` for prayer time calculations
- Automatically reschedules reminders when location changes significantly (>10km)
- Maintains location context for each reminder

### Prayer Time Integration

- Uses the existing `NativeModules.SalaatTimes.getPrayerTimes` for accurate calculations
- Integrates with `usePrayerTimes` and `useLocationPrayerTimes` hooks
- Supports all prayer times defined in `NamazTimes` interface

## Dependencies

- `react-native-push-notification`: For local notifications
- `mobx-state-tree`: For state management
- `@tabler/icons-react-native`: For UI icons
- Existing prayer time calculation system
- Existing location management system

## Future Enhancements

- **Smart reminders**: Suggest optimal reminder times based on user behavior
- **Location-based adjustments**: Automatically adjust for travel
- **Prayer time notifications**: Notify when prayer time starts/ends
- **Custom sounds**: Allow custom notification sounds
- **Widget support**: Show next prayer time on home screen
- **Apple Watch support**: Extend to wearable devices
