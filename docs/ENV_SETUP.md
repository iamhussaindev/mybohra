# Environment Variables Setup Guide

This guide will help you set up environment variables for your My Bohra app.

## Step 1: Create .env File

Create a `.env` file in your project root (`/Users/hussain/mybohra/app/.env`) with the following content:

```env
# Firebase Configuration
# Replace these with your actual Firebase project configuration
EXPO_PUBLIC_FIREBASE_API_KEY=your-api-key-here
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
EXPO_PUBLIC_FIREBASE_APP_ID=your-app-id
EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX

# App Configuration
EXPO_PUBLIC_APP_NAME=My Bohra
EXPO_PUBLIC_APP_VERSION=1.0.0

# Development Configuration
EXPO_PUBLIC_DEBUG_MODE=true
EXPO_PUBLIC_ANALYTICS_ENABLED=true
```

## Step 2: Get Firebase Configuration Values

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to Project Settings (gear icon)
4. Scroll down to "Your apps" section
5. Click on your web app
6. Copy the configuration values from the `firebaseConfig` object

Example Firebase config:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyC...",
  authDomain: "mybohra-app.firebaseapp.com",
  projectId: "mybohra-app",
  storageBucket: "mybohra-app.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456",
  measurementId: "G-XXXXXXXXXX"
};
```

## Step 3: Update .env File

Replace the placeholder values in your `.env` file with the actual Firebase configuration:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSyC...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=mybohra-app.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=mybohra-app
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=mybohra-app.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
EXPO_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef123456
EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

## Step 4: Environment Variable Naming Convention

**Important**: In Expo, environment variables must be prefixed with `EXPO_PUBLIC_` to be accessible in your app.

- ✅ `EXPO_PUBLIC_FIREBASE_API_KEY` - Accessible in app
- ❌ `FIREBASE_API_KEY` - Not accessible in app

## Step 5: Verify Setup

1. Restart your development server: `yarn start --clear`
2. Check the console for "Analytics service initialized successfully"
3. Use the AnalyticsDebugger to verify Firebase connection

## Step 6: Security Notes

- **Never commit `.env` files** to version control
- Add `.env` to your `.gitignore` file
- Use different Firebase projects for development and production
- Rotate API keys regularly

## Step 7: Production Deployment

For production builds, you can also set environment variables in:

### EAS Build

```bash
eas build --profile production --env-file .env.production
```

### Expo CLI

```bash
expo build --env-file .env.production
```

## Troubleshooting

### Environment variables not loading?

1. Make sure the variable names start with `EXPO_PUBLIC_`
2. Restart the development server
3. Check for typos in variable names

### Firebase not connecting?

1. Verify your Firebase project is set up correctly
2. Check that the API key has the correct permissions
3. Ensure the project ID matches exactly

### Analytics not working?

1. Check that `EXPO_PUBLIC_ANALYTICS_ENABLED=true`
2. Verify Firebase Analytics is enabled in your Firebase project
3. Check the console for error messages

## Example .env Files

### Development (.env.development)

```env
EXPO_PUBLIC_FIREBASE_API_KEY=dev-api-key
EXPO_PUBLIC_FIREBASE_PROJECT_ID=mybohra-dev
EXPO_PUBLIC_DEBUG_MODE=true
EXPO_PUBLIC_ANALYTICS_ENABLED=true
```

### Production (.env.production)

```env
EXPO_PUBLIC_FIREBASE_API_KEY=prod-api-key
EXPO_PUBLIC_FIREBASE_PROJECT_ID=mybohra-prod
EXPO_PUBLIC_DEBUG_MODE=false
EXPO_PUBLIC_ANALYTICS_ENABLED=true
```

## Next Steps

1. Create your `.env` file with the template above
2. Get your Firebase configuration values
3. Update the `.env` file with real values
4. Restart your development server
5. Test the analytics functionality

For more information, see the [Expo Environment Variables documentation](https://docs.expo.dev/guides/environment-variables/).
