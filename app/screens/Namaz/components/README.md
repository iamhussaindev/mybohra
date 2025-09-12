# Test Reminder System

This directory contains components and functionality for testing the reminder system with a 30-second trigger.

## Overview

The test reminder system allows you to create, manage, and test reminders that trigger after a specified delay (default 30 seconds). It's designed for testing and debugging the reminder functionality without affecting real prayer reminders.

## Components

### TestReminderButton

A React component that provides a user interface for managing test reminders. It includes:

- **Create Test Reminder**: Button to create a new test reminder with 30-second delay
- **Show Details**: Toggle to show/hide detailed information about scheduled reminders
- **Countdown Display**: Real-time countdown showing remaining time until trigger
- **Cancel Individual**: Cancel specific reminders
- **Clear All**: Cancel all scheduled test reminders
- **Status Indicators**: Visual feedback for reminder states

## Services

### TestReminderService

A singleton service that manages test reminders:

```typescript
// Create a test reminder
const reminder = await testReminderService.createTestReminder("Test Prayer Reminder", 30)

// Get all scheduled reminders
const reminders = testReminderService.getScheduledReminders()

// Cancel a specific reminder
await testReminderService.cancelTestReminder(reminder.id)

// Clear all reminders
await testReminderService.clearAllTestReminders()
```

## Hooks

### useTestReminders

A React hook that provides state management for test reminders:

```typescript
const {
  scheduledReminders,
  isLoading,
  error,
  createTestReminder,
  cancelTestReminder,
  clearAllTestReminders,
  getCountdown,
  hasTriggered,
} = useTestReminders()
```

## Features

### 1. **30-Second Test Reminders**

- Default delay of 30 seconds for quick testing
- Customizable delay for different test scenarios
- Real-time countdown display

### 2. **Console Logging**

- Detailed console output for debugging
- Notification trigger logs
- Scheduling confirmation logs
- Error handling logs

### 3. **Visual Feedback**

- Live countdown timers
- Status indicators (scheduled, triggered, cancelled)
- Error messages and success confirmations
- Alert dialogs for user interactions

### 4. **Management Features**

- Create multiple test reminders
- Cancel individual reminders
- Clear all reminders at once
- View detailed information about scheduled reminders

## Usage

### In Namaz Screen

The `TestReminderButton` component is integrated into the Namaz screen and provides:

1. **Quick Test**: Click "Create Test Reminder" to schedule a 30-second test
2. **Monitor Progress**: Use "Show Details" to see countdown timers
3. **Manage Reminders**: Cancel individual reminders or clear all
4. **View Logs**: Check the console for detailed notification logs

### Programmatic Usage

```typescript
import { testReminderService } from "app/services/testReminderService"

// Create a test reminder
const reminder = await testReminderService.createTestReminder("My Test", 30)

// Monitor countdown
const countdown = testReminderService.getCountdown(reminder.id)
console.log(`${countdown} seconds remaining`)

// Check if triggered
const hasTriggered = testReminderService.hasTriggered(reminder.id)
```

### Demo Functions

Use the demo functions for testing:

```typescript
import { runTestReminderDemo, runMultipleRemindersDemo } from "app/utils/testReminderDemo"

// Single reminder demo
await runTestReminderDemo()

// Multiple reminders demo
await runMultipleRemindersDemo()
```

## Console Output

When a test reminder is created, you'll see:

```
⏰ Test notification scheduled:
   ID: test-reminder-1234567890
   Title: Test Reminder: Test Prayer Reminder
   Body: This is a test reminder that was scheduled 30 seconds ago.
   Will trigger in: 30 seconds
   Trigger time: 1/15/2024, 10:30:45 AM
```

When the reminder triggers:

```
🔔 TEST NOTIFICATION TRIGGERED:
   ID: test-reminder-1234567890
   Title: Test Reminder: Test Prayer Reminder
   Body: This is a test reminder that was scheduled 30 seconds ago.
   Time: 1/15/2024, 10:30:45 AM
```

## Testing

### Manual Testing

1. Navigate to the Namaz screen
2. Scroll down to see the "Test Reminders" section
3. Click "Create Test Reminder"
4. Watch the countdown in the details section
5. Check the console for notification logs
6. Test cancellation and clearing functionality

### Automated Testing

Run the test suite:

```bash
yarn test test/services/testReminderService.test.ts
```

## Integration

The test reminder system is integrated into the Namaz screen and provides:

- **Non-intrusive Design**: Doesn't interfere with normal prayer reminder functionality
- **Clear Separation**: Test reminders are separate from real prayer reminders
- **Easy Access**: Available directly in the Namaz screen for quick testing
- **Visual Feedback**: Clear UI indicators for all reminder states

## Benefits

1. **Quick Testing**: 30-second delay allows for rapid testing cycles
2. **Safe Testing**: Doesn't affect real prayer reminders
3. **Debugging**: Detailed console logs for troubleshooting
4. **User-Friendly**: Simple interface for non-technical users
5. **Comprehensive**: Covers all reminder functionality scenarios

## Future Enhancements

- Integration with actual push notifications
- Sound alerts for test reminders
- Export/import test reminder configurations
- Automated test scenarios
- Performance metrics and analytics
