# 🧪 Analytics Test Events Verification

## Test Events Added

I've added automatic test events that will be sent when the app initializes:

### 1. Analytics Service Initialization Event
- **Event Name**: `analytics_service_initialized`
- **Triggered**: When analytics service starts up
- **Contains**: Platform info, session ID, device info, verification flag

### 2. Real-time Monitoring Initialization Event
- **Event Name**: `realtime_monitoring_initialized`
- **Triggered**: When real-time monitoring starts up
- **Contains**: Session ID, device ID, verification flag

## 🔍 How to Verify Test Events

### 1. Check Console Logs
Look for these messages in your development console:

```
✅ Expo Analytics service initialized successfully
📊 Event: analytics_service_initialized
✅ Realtime monitoring initialized
📊 Event: realtime_monitoring_initialized
📊 Event: user_heartbeat
📊 Event: screen_view
```

### 2. Use AnalyticsDebugger
1. **Long-press the header** in the app (development mode)
2. **Check the "Analytics State" section**:
   - Should show "Initialized: ✅"
   - Should show session ID and user ID
3. **Click "Test Event" button** to send additional test events
4. **Click "Test Firebase" button** to test Firebase connection

### 3. Check Firebase Console (Web Platform Only)
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Analytics > Events**
4. Look for these events:
   - `analytics_service_initialized`
   - `realtime_monitoring_initialized`
   - `screen_view`
   - `user_heartbeat`

### 4. Check Real-time Analytics (Web Platform Only)
1. Go to **Analytics > Realtime**
2. Should show active users
3. Should show current screens being viewed

## 📱 Expected Behavior

### On App Startup:
1. ✅ Analytics service initializes
2. 📊 Sends `analytics_service_initialized` event
3. ✅ Real-time monitoring initializes
4. 📊 Sends `realtime_monitoring_initialized` event
5. 📊 Starts sending `user_heartbeat` events every 30 seconds
6. 📊 Sends `screen_view` event for current screen

### During App Usage:
1. 📊 `screen_view` events when navigating
2. 📊 `user_heartbeat` events every 30 seconds
3. 📊 Custom events for user interactions
4. 📊 Error events if any errors occur

## 🚨 Troubleshooting

### If No Events Appear:

1. **Check Console Logs**:
   ```
   ❌ Failed to initialize Expo analytics service
   ❌ Failed to initialize realtime monitoring
   ```

2. **Check Firebase Configuration**:
   ```bash
   yarn verify:firebase
   ```

3. **Check AnalyticsDebugger**:
   - Long-press header to open
   - Check "Firebase Connection" status
   - Check "Analytics State" status

4. **Restart Development Server**:
   ```bash
   yarn start --clear
   ```

### If Events Appear But Not in Firebase Console:

- **Native Platforms**: Events are stored locally (this is expected)
- **Web Platform**: Check Firebase project settings and Analytics enablement
- **Network Issues**: Check internet connection

## ✅ Success Indicators

You'll know the test events are working when you see:

1. **Console Messages**:
   ```
   📊 Event: analytics_service_initialized
   📊 Event: realtime_monitoring_initialized
   ```

2. **AnalyticsDebugger Shows**:
   - Firebase Connection: ✅ Connected
   - Analytics State: Initialized ✅
   - Events in the stored events list

3. **Firebase Console Shows** (Web only):
   - Events in Analytics > Events
   - Active users in Analytics > Realtime

## 🎯 Next Steps

1. **Monitor the console** for test event messages
2. **Use AnalyticsDebugger** to view detailed analytics data
3. **Check Firebase Console** for real-time events (web platform)
4. **Navigate through the app** to generate more events
5. **Test user interactions** to verify custom event tracking

The test events will help you verify that your Firebase Analytics is properly connected and working! 🎉
