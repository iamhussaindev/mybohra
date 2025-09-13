#!/usr/bin/env node

const fs = require("fs")
const path = require("path")

console.log("🔍 Firebase Analytics Connection Verification\n")

// Check if .env file exists
const envPath = path.join(__dirname, ".env")
if (!fs.existsSync(envPath)) {
  console.log("❌ .env file not found!")
  console.log("   Please create a .env file with your Firebase configuration.")
  console.log("   Run: yarn setup:env\n")
  process.exit(1)
}

// Read .env file
const envContent = fs.readFileSync(envPath, "utf8")
const envLines = envContent.split("\n")

// Parse environment variables
const envVars = {}
envLines.forEach((line) => {
  const [key, value] = line.split("=")
  if (key && value) {
    envVars[key.trim()] = value.trim()
  }
})

console.log("📋 Environment Variables Status:")
console.log("=".repeat(40))

const requiredVars = [
  "EXPO_PUBLIC_FIREBASE_API_KEY",
  "EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN",
  "EXPO_PUBLIC_FIREBASE_PROJECT_ID",
  "EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET",
  "EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
  "EXPO_PUBLIC_FIREBASE_APP_ID",
  "EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID",
]

const placeholderValues = [
  "your-api-key-here",
  "your-project.firebaseapp.com",
  "your-project-id",
  "your-project.appspot.com",
  "123456789",
  "your-app-id",
  "G-XXXXXXXXXX",
]

let allConfigured = true
let usingPlaceholders = false

requiredVars.forEach((varName) => {
  const value = envVars[varName]
  const isSet = value && value !== ""
  const isPlaceholder = placeholderValues.includes(value)

  if (isPlaceholder) {
    usingPlaceholders = true
  }

  const status = isSet && !isPlaceholder ? "✅" : "❌"
  const displayValue = isSet ? (isPlaceholder ? "Placeholder" : "Configured") : "Not set"

  console.log(`${status} ${varName}: ${displayValue}`)

  if (!isSet || isPlaceholder) {
    allConfigured = false
  }
})

console.log("\n📊 Overall Status:")
console.log("=".repeat(40))

if (allConfigured) {
  console.log("✅ All Firebase configuration variables are properly set!")
  console.log("✅ Ready to connect to Firebase Analytics")
} else {
  console.log("❌ Firebase configuration is incomplete")

  if (usingPlaceholders) {
    console.log("❌ Using placeholder values - need real Firebase configuration")
  }

  console.log("\n💡 Next Steps:")
  console.log("1. Go to Firebase Console: https://console.firebase.google.com/")
  console.log("2. Select your project and go to Project Settings")
  console.log("3. Copy the Firebase configuration values")
  console.log("4. Update your .env file with the real values")
  console.log("5. Restart your development server: yarn start --clear")
}

console.log("\n🔗 Firebase Console: https://console.firebase.google.com/")
console.log("📖 Setup Guide: ENV_SETUP.md")
