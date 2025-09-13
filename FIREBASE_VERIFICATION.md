# Firebase Analytics Connection Verification Guide

This guide will help you verify that your Firebase Analytics is properly connected to your account.

## 🔍 Quick Verification

Run the verification script to check your Firebase configuration:

```bash
yarn verify:firebase
```

## 📱 In-App Verification

### Using AnalyticsDebugger

1. **Open the app** and navigate to the Home screen
2. **Long-press the header** (in development mode) to open the AnalyticsDebugger
3. **Check the "Firebase Connection" section** for connection status
4. **Click "Test Firebase"** to test the connection

### What to Look For

✅ **Connected Status**: Should show "✅ Connected"
✅ **Firebase App**: Should show "✅"
✅ **Analytics**: Should show "✅" (web) or "❌" (native - this is expected)
✅ **API Key**: Should show "✅"
✅ **Project ID**: Should show "✅"
✅ **Measurement ID**: Should show "✅"
✅ **Using Placeholders**: Should show "✅ No"

## 🌐 Web Platform Verification

If you're testing on web platform:

1. **Open browser developer tools** (F12)
2. **Go to Console tab**
3. **Look for Firebase initialization messages**:

   ```
   ✅ Firebase App initialized successfully
   ✅ Firebase Analytics initialized successfully
   ```

4. **Check Firebase Console**:
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Select your project
   - Go to Analytics > Events
   - Look for real-time events

## 📱 Native Platform Verification

For iOS/Android platforms:

1. **Check console logs** for analytics events:

   ```
   📊 Event: screen_view
   📊 Event: user_heartbeat
   ```

2. **Use AnalyticsDebugger** to view stored events
3. **Events are stored locally** and can be exported for analysis

## 🔧 Troubleshooting

### ❌ "Not Connected" Status

**Possible Causes:**

- Environment variables not set correctly
- Using placeholder values
- Firebase project not configured
- Network connectivity issues

**Solutions:**

1. Run `yarn verify:firebase` to check configuration
2. Update `.env` file with real Firebase values
3. Restart development server: `yarn start --clear`
4. Check Firebase Console project settings

### ❌ "Using Placeholders" Warning

**Cause:** Your `.env` file contains placeholder values instead of real Firebase configuration.

**Solution:**

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project → Project Settings
3. Copy the web app configuration
4. Update your `.env` file with real values

### ❌ "Analytics Not Available" on Native

**This is Expected:** Firebase Analytics is only available on web platform in Expo managed workflow.

**Alternative:** Use the Expo Analytics service which stores events locally and can be exported.

## 📊 Testing Analytics Events

### 1. Test Basic Events

Use the AnalyticsDebugger test buttons:

- **Test Event**: Creates a test analytics event
- **Test Error**: Creates a test error event
- **Test Activity**: Creates a test user activity
- **Test Firebase**: Tests Firebase connection

### 2. Test Real User Actions

Navigate through the app to generate real events:

- **Screen views**: Navigate between screens
- **User interactions**: Tap buttons, open drawers
- **Feature usage**: Use prayer times, Qibla, etc.

### 3. Check Event Logs

Look for these console messages:

```
📱 Screen View: Home
📊 Event: screen_view
🎯 Activity: button_click
❌ Error: error_occurred
```

## 🔗 Firebase Console Verification

### 1. Check Project Settings

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to Project Settings (gear icon)
4. Verify your web app is listed
5. Check that Analytics is enabled

### 2. Check Analytics Events

1. Go to Analytics > Events
2. Look for real-time events (may take a few minutes to appear)
3. Check for custom events like:
   - `screen_view`
   - `user_heartbeat`
   - `debug_test_event`

### 3. Check Real-time Data

1. Go to Analytics > Realtime
2. Look for active users
3. Check current screens being viewed

## 📈 Expected Analytics Events

Your app should be tracking these events:

### Screen Tracking

- `screen_view` - When users navigate to screens

### User Actions

- `user_heartbeat` - Every 30 seconds for active users
- `button_click` - When users tap buttons
- `drawer_opened` / `drawer_closed` - Drawer interactions

### App Features

- `prayer_time_viewed` - Prayer time usage
- `qibla_opened` - Qibla compass usage
- `pdf_opened` - PDF viewing
- `audio_played` - Audio playback

### Errors

- `error_occurred` - Any errors that occur

## 🚨 Common Issues

### Issue: No Events in Firebase Console

**Causes:**

- Using placeholder configuration
- Analytics not enabled in Firebase project
- Wrong project selected
- Events not being sent (check console logs)

**Solutions:**

1. Verify configuration with `yarn verify:firebase`
2. Check Firebase project settings
3. Enable Analytics in Firebase Console
4. Check console logs for event generation

### Issue: "Cannot read property 'logEvent' of undefined"

**Cause:** Analytics service not properly initialized

**Solution:**

1. Restart development server
2. Check for import errors
3. Verify analytics service initialization

### Issue: Events Not Appearing in Real-time

**Causes:**

- Firebase Analytics only works on web platform
- Events are stored locally on native platforms
- Network connectivity issues

**Solutions:**

1. Test on web platform for real-time Firebase events
2. Use AnalyticsDebugger to view local events on native
3. Check network connection

## ✅ Success Indicators

You'll know Firebase Analytics is working when:

1. **Verification script passes**: `yarn verify:firebase` shows all ✅
2. **AnalyticsDebugger shows "Connected"**: Firebase Connection status is ✅
3. **Console shows events**: You see 📊 Event messages in console
4. **Firebase Console shows data**: Events appear in Analytics > Events (web only)
5. **Real-time monitoring works**: User heartbeat events are generated

## 📞 Support

If you're still having issues:

1. **Check the logs**: Look for error messages in console
2. **Verify configuration**: Run `yarn verify:firebase`
3. **Test with AnalyticsDebugger**: Use the in-app debugging tools
4. **Check Firebase Console**: Verify project settings and Analytics enablement

## 🔗 Useful Links

- [Firebase Console](https://console.firebase.google.com/)
- [Firebase Analytics Documentation](https://firebase.google.com/docs/analytics)
- [Expo Environment Variables](https://docs.expo.dev/guides/environment-variables/)
- [Setup Guide](ENV_SETUP.md)
