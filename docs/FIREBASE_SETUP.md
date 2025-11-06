# Firebase Analytics & Monitoring Setup Guide

This guide will help you set up Firebase Analytics and real-time monitoring for your My Bohra app using Expo-compatible packages.

## Prerequisites

1. A Firebase project (create one at <https://console.firebase.google.com/>)
2. Your app's bundle identifier: `com.muminoapp.all`
3. Expo managed workflow (this setup is optimized for Expo)

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter project name: "My Bohra Analytics" (or your preferred name)
4. Enable Google Analytics (recommended)
5. Choose or create a Google Analytics account

## Step 2: Add Web App (for Expo)

1. In Firebase Console, click "Add app" and select Web
2. Enter app nickname: "My Bohra Web"
3. Note down the configuration values (we'll use these in environment variables)
4. Enable Google Analytics when prompted

## Step 3: Add Android App (for future native builds)

1. In Firebase Console, click "Add app" and select Android
2. Enter package name: `com.muminoapp.all`
3. Enter app nickname: "My Bohra Android"
4. Note down the configuration values

## Step 4: Add iOS App (for future native builds)

1. In Firebase Console, click "Add app" and select iOS
2. Enter bundle ID: `com.muminoapp.all`
3. Enter app nickname: "My Bohra iOS"
4. Note down the configuration values

## Step 5: Configure Environment Variables

Create a `.env` file in your project root with the following variables:

```env
# Firebase Configuration
EXPO_PUBLIC_FIREBASE_API_KEY=your-api-key-here
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
EXPO_PUBLIC_FIREBASE_APP_ID=your-app-id
EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

## Step 6: Update Firebase Configuration

Update `app/services/firebase/firebase.config.ts` with your actual configuration values:

```typescript
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "your-actual-api-key",
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || "your-project.firebaseapp.com",
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "your-project-id",
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || "your-project.appspot.com",
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || "your-app-id",
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-XXXXXXXXXX"
}
```

## Step 7: Enable Firebase Services

### Analytics

1. Go to Firebase Console > Analytics
2. Enable Google Analytics
3. Set up data collection

### Remote Config

1. Go to Firebase Console > Remote Config
2. Click "Get started"
3. Create your first parameter

## Step 8: Test the Setup

1. Run your app: `yarn start`
2. Check the console for "Analytics service initialized successfully"
3. Navigate through the app to generate events
4. Use the AnalyticsDebugger (long-press header in dev mode) to view tracked events
5. Check Firebase Console > Analytics > Events to see tracked events (web platform)

### Note: Expo-Compatible Analytics

This setup uses Expo-compatible packages that work with the managed workflow:

- **Firebase Web SDK**: For web platform analytics
- **Local Storage**: Events are stored locally using AsyncStorage
- **Expo Analytics**: Additional analytics capabilities
- **Custom Analytics Service**: Handles event queuing and processing

The analytics service automatically:

- Stores events locally for debugging
- Queues events when offline
- Provides real-time monitoring capabilities
- Exports data for analysis

## Step 9: Monitor Real-time Data

### Active Users

- Go to Firebase Console > Analytics > Realtime
- View active users and their current screens

### Error Tracking

- Use the AnalyticsDebugger to view error events
- Check console logs for error tracking
- Events are stored locally and can be exported for analysis

### Custom Events

- Go to Firebase Console > Analytics > Events
- View all custom events being tracked

## Available Analytics Events

The app tracks the following events:

### Screen Tracking

- `screen_view` - When users navigate to different screens

### User Actions

- `user_login` - When users log in
- `user_logout` - When users log out
- `user_register` - When users register

### App Features

- `prayer_time_viewed` - When prayer times are viewed
- `qibla_opened` - When Qibla compass is opened
- `calendar_opened` - When calendar is opened
- `reminder_created` - When reminders are created
- `reminder_deleted` - When reminders are deleted
- `tasbeeh_started` - When tasbeeh counting starts
- `tasbeeh_completed` - When tasbeeh counting is completed
- `pdf_opened` - When PDFs are opened
- `audio_played` - When audio is played
- `audio_paused` - When audio is paused
- `search_performed` - When search is performed

### Navigation

- `navigation_tab_changed` - When bottom tab is changed
- `drawer_opened` - When drawer is opened
- `drawer_closed` - When drawer is closed

### Location

- `location_updated` - When location is updated
- `location_permission_granted` - When location permission is granted
- `location_permission_denied` - When location permission is denied

### Errors

- `error_occurred` - When any error occurs
- `api_error` - When API calls fail
- `network_error` - When network errors occur

### Performance

- `app_start_time` - App startup time
- `screen_load_time` - Screen loading time
- `api_response_time` - API response time

## Real-time Monitoring Features

### Live Page Tracking

- Track which pages users are currently on
- Monitor user session duration
- Track user activity patterns

### Active Users

- Real-time count of active users
- User session information
- Device and app version tracking

### User Activities

- Button clicks and interactions
- Feature usage patterns
- Navigation flows

### Error Reporting

- Automatic crash reporting
- Custom error tracking
- Error context and stack traces

## Troubleshooting

### Common Issues

1. **Analytics not working**: Check if Firebase configuration is correct
2. **Events not appearing**: Wait 24-48 hours for data to appear in Firebase Console
3. **Crashlytics not working**: Ensure proper setup for both Android and iOS
4. **Real-time data not showing**: Check if the app is properly connected to Firebase

### Debug Mode

To enable debug mode for testing:

1. For Android: `adb shell setprop debug.firebase.analytics.app com.muminoapp.all`
2. For iOS: Add `-FIRAnalyticsDebugEnabled` to your scheme's arguments

### Testing Analytics

1. Use Firebase Console > Analytics > DebugView
2. Check console logs for analytics events
3. Use the real-time monitoring dashboard

## Security Considerations

1. Never commit `.env` files to version control
2. Use environment variables for sensitive configuration
3. Regularly rotate API keys
4. Monitor for unusual activity in Firebase Console

## Next Steps

1. Set up custom dashboards in Firebase Console
2. Configure alerts for critical errors
3. Set up user segmentation
4. Create custom conversion funnels
5. Implement A/B testing with Remote Config

## Support

For issues with this setup:

1. Check Firebase Console for error messages
2. Review the console logs in your app
3. Consult Firebase documentation
4. Check the analytics service implementation in `app/services/analytics/`
