# 📝 Action Logger Setup Guide

## 🎯 Overview

The Action Logger is a high-performance local analytics system that:

- ✅ **Stores actions locally** without affecting app performance
- ✅ **Periodically uploads** data to your existing backend server
- ✅ **Merges with user data** when users log in
- ✅ **Works across all platforms** (iOS, Android, Web)
- ✅ **Handles offline scenarios** gracefully

## 🚀 Quick Start

### 1. **Environment Setup**

Add your backend server URL to `.env`:

```bash
# .env
EXPO_PUBLIC_ANALYTICS_SERVER_URL=https://your-backend-server.com/api/analytics/actions
```

### 2. **Basic Usage in Components**

```tsx
import { useActionLogger } from "../hooks/useActionLogger"

function MyComponent() {
  const { logAction, logButtonClick, logFeatureUsage } = useActionLogger()

  const handleButtonPress = async () => {
    // Log button click
    await logButtonClick("settings_button", "HomeScreen", {
      button_position: "top_right"
    })
    
    // Your button logic here
  }

  const handleFeatureUse = async () => {
    // Log feature usage
    await logFeatureUsage("prayer_times", {
      feature_type: "navigation",
      user_level: "beginner"
    })
  }

  return (
    <View>
      <Button onPress={handleButtonPress} title="Settings" />
    </View>
  )
}
```

### 3. **User Management**

```tsx
import { useActionLogger } from "../hooks/useActionLogger"

function LoginScreen() {
  const { setUserId, clearUserId } = useActionLogger()

  const handleLogin = async (userId: string) => {
    // Set user ID for all future actions
    await setUserId(userId)
    
    // All actions will now be associated with this user
  }

  const handleLogout = async () => {
    // Clear user ID
    await clearUserId()
  }
}
```

## 📊 **What Gets Tracked**

### **Automatic Tracking**

- ✅ **Screen views** - When users navigate between screens
- ✅ **App lifecycle** - Foreground/background transitions
- ✅ **User interactions** - Button clicks, taps, gestures
- ✅ **Feature usage** - When users access specific features
- ✅ **Errors** - App crashes and error conditions
- ✅ **Performance** - Load times, response times (optional)
- ❌ **Heartbeat events** - Excluded to reduce noise and storage

### **Custom Actions**

You can log any custom action:

```tsx
const { logAction } = useActionLogger()

// Log custom actions
await logAction("prayer_completed", "spiritual", {
  prayer_type: "fajr",
  duration_minutes: 5,
  location: "home"
})

await logAction("quran_reading", "spiritual", {
  surah: "Al-Fatiha",
  verses_read: 7,
  reading_time: 120
})
```

## 🔧 **Configuration Options**

### **Default Configuration**

```typescript
{
  maxLocalStorageSize: 1000,    // Store up to 1000 actions locally
  uploadIntervalMs: 30000,      // Upload every 30 seconds
  batchSize: 50,                // Upload up to 50 actions per batch
  retryAttempts: 3,             // Retry failed uploads 3 times
  serverEndpoint: "https://your-server.com/api/actions"
}
```

### **Custom Configuration**

```typescript
import { actionLoggerService } from "./services/analytics/action-logger.service"

// Initialize with custom config
actionLoggerService.initialize({
  maxLocalStorageSize: 2000,    // Store more actions
  uploadIntervalMs: 60000,      // Upload every minute
  batchSize: 100,               // Larger batches
  retryAttempts: 5,             // More retries
  serverEndpoint: "https://custom-server.com/analytics"
})
```

## 🖥️ **Backend Server Integration**

### **Server Endpoint Requirements**

Your existing backend server needs to handle POST requests to the analytics endpoint with this format:

```json
{
  "deviceId": "device_123",
  "userId": "user_456",
  "actions": [
    {
      "id": "action_789",
      "timestamp": 1640995200000,
      "action": "button_click",
      "category": "engagement",
      "parameters": {
        "button_name": "settings",
        "screen": "HomeScreen"
      },
      "sessionId": "session_abc",
      "platform": "ios",
      "appVersion": "1.0.0",
      "isUploaded": false
    }
  ],
  "batchId": "batch_xyz",
  "timestamp": 1640995200000
}
```

### **Expected Server Response**

Your server should respond with:

```json
{
  "success": true,
  "batchId": "batch_xyz",
  "processedCount": 1,
  "message": "Actions received successfully"
}
```

### **Error Response**

For errors, respond with:

```json
{
  "error": "Error message",
  "message": "Detailed error description"
}
```

## 📈 **Data Analysis**

### **Recommended Server Endpoints**

You can implement these endpoints in your existing backend:

- **`POST /api/analytics/actions`** - Receive action logs (required)
- **`GET /api/analytics`** - Get analytics data with filters (optional)
- **`GET /api/analytics/devices`** - Get device session information (optional)
- **`GET /api/analytics/export`** - Export data as JSON or CSV (optional)

### **Example Implementation**

Here's a simple example for your backend:

```javascript
// Express.js example
app.post('/api/analytics/actions', async (req, res) => {
  try {
    const { deviceId, userId, actions, batchId, timestamp } = req.body

    // Validate required fields
    if (!deviceId || !actions || !Array.isArray(actions)) {
      return res.status(400).json({ 
        error: 'Missing required fields: deviceId and actions array' 
      })
    }

    // Process and store actions in your database
    // ... your database logic here ...

    res.json({
      success: true,
      batchId,
      processedCount: actions.length,
      message: 'Actions received successfully'
    })
  } catch (error) {
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    })
  }
})
```

## 🔍 **Monitoring & Debugging**

### **Using AnalyticsDebugger**

1. **Long-press header** in development mode
2. **Check "Action Logger" section**:
   - Pending Actions: Actions waiting to be uploaded
   - Uploaded Actions: Successfully uploaded actions
   - Total Actions: All actions tracked

### **Console Logs**

Look for these messages:

```
📝 Action logged: button_click (engagement)
📤 Uploading 25 actions to server...
✅ Successfully uploaded 25 actions
❌ Failed to upload 10 actions, will retry later
```

### **Manual Testing**

```tsx
import { actionLoggerService } from "./services/analytics/action-logger.service"

// Test action logging
await actionLoggerService.logAction("test_action", "debug", {
  test_data: "This is a test"
})

// Check pending actions
const pendingCount = await actionLoggerService.getPendingActionsCount()
console.log(`Pending actions: ${pendingCount}`)

// Export actions for analysis
const actions = await actionLoggerService.exportActions(100)
console.log("Recent actions:", actions)
```

## 🚨 **Troubleshooting**

### **Issue: Actions Not Uploading**

**Check:**

1. Server URL is correct in `.env`
2. Your backend server is running and accessible
3. Network connectivity
4. Console logs for error messages

**Solutions:**

```bash
# Test server connectivity
curl -X POST https://your-backend-server.com/api/analytics/actions \
  -H "Content-Type: application/json" \
  -d '{"deviceId":"test","actions":[],"batchId":"test","timestamp":1640995200000}'
```

### **Issue: High Memory Usage**

**Check:**

1. `maxLocalStorageSize` setting
2. Upload frequency
3. Action data size

**Solutions:**

```typescript
// Reduce local storage size
actionLoggerService.initialize({
  maxLocalStorageSize: 500,  // Store fewer actions
  uploadIntervalMs: 15000,   // Upload more frequently
})
```

### **Issue: Actions Not Merging with User**

**Check:**

1. `setUserId()` is called after login
2. User ID is being passed correctly
3. Actions are logged after user ID is set

**Solutions:**

```tsx
// Ensure user ID is set before logging actions
await setUserId(userId)
await logAction("user_action", "engagement", { userId })
```

## 📊 **Performance Impact**

### **Minimal Performance Impact**

- ✅ **Async operations** - No blocking of UI
- ✅ **Local storage** - Fast read/write operations
- ✅ **Batch uploads** - Efficient network usage
- ✅ **Background processing** - No impact on user experience
- ✅ **Memory management** - Automatic cleanup of old data
- ✅ **Auto cleanup** - Deletes uploaded actions from local storage

### **Storage Usage**

- **Per action**: ~200-500 bytes
- **1000 actions**: ~200-500 KB
- **Automatic cleanup** when limit reached
- **Uploaded actions deleted** from local storage after successful upload

## 🔐 **Privacy & Security**

### **Data Sanitization**

- ✅ **Sensitive data filtered** - Passwords, tokens, secrets removed
- ✅ **Parameter limits** - Long strings truncated
- ✅ **Object serialization** - Complex objects simplified

### **User Control**

- ✅ **User ID management** - Can be set/cleared
- ✅ **Data export** - Users can export their data
- ✅ **Data clearing** - All data can be cleared

## 🎯 **Best Practices**

### **1. Log Meaningful Actions**

```tsx
// Good - meaningful action
await logAction("prayer_completed", "spiritual", {
  prayer_type: "fajr",
  completion_time: "06:30"
})

// Avoid - too granular
await logAction("scroll_pixel", "ui", { pixel: 150 })
```

### **2. Use Consistent Categories**

```tsx
// Standard categories
"engagement"    // User interactions
"navigation"    // Screen changes, routing
"spiritual"     // Prayer, Quran, religious activities
"error"         // Errors and crashes
"performance"   // Timing and performance metrics
"system"        // App lifecycle, initialization
```

### **3. Include Relevant Context**

```tsx
await logAction("feature_usage", "engagement", {
  feature_name: "qibla_compass",
  screen: "QiblaScreen",
  user_level: "intermediate",
  session_duration: 300
})
```

## 🚀 **Next Steps**

1. **Configure your backend server** to handle the analytics endpoint
2. **Set the server URL** in your `.env` file
3. **Start logging actions** in your components
4. **Monitor the data** using the AnalyticsDebugger
5. **Analyze user behavior** and improve your app

**Your action logger is now ready to work with your existing backend server!** 🎉
