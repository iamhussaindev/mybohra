#!/usr/bin/env node

const fs = require("fs")
const path = require("path")

console.log("🧪 Firebase Analytics Test Event Sender\n")

// Check if .env file exists
const envPath = path.join(__dirname, ".env")
if (!fs.existsSync(envPath)) {
  console.log("❌ .env file not found!")
  console.log("   Please create a .env file with your Firebase configuration.")
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

// Check if Firebase is configured
const requiredVars = [
  "EXPO_PUBLIC_FIREBASE_API_KEY",
  "EXPO_PUBLIC_FIREBASE_PROJECT_ID",
  "EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID",
]

let isConfigured = true
requiredVars.forEach((varName) => {
  const value = envVars[varName]
  if (!value || value.includes("your-") || value.includes("G-XXXXXXXXXX")) {
    isConfigured = false
  }
})

if (!isConfigured) {
  console.log("❌ Firebase not properly configured!")
  console.log("   Run: yarn verify:firebase")
  process.exit(1)
}

console.log("✅ Firebase configuration verified")
console.log("📱 Starting app to send test events...\n")

// Instructions for manual testing
console.log("🔍 Manual Test Instructions:")
console.log("=".repeat(50))
console.log("1. The app should start automatically")
console.log("2. Look for these console messages:")
console.log("   📊 Event: test_verification_event")
console.log("   📊 Event: screen_view")
console.log("   📊 Event: user_heartbeat")
console.log("3. Long-press the header to open AnalyticsDebugger")
console.log("4. Click 'Test Firebase' button")
console.log("5. Check Firebase Console > Analytics > Events")
console.log("=".repeat(50))

// Start the app
const { spawn } = require("child_process")

console.log("🚀 Starting development server...")
const child = spawn("yarn", ["start", "--clear"], {
  stdio: "inherit",
  shell: true,
})

child.on("error", (error) => {
  console.error("❌ Failed to start app:", error.message)
  process.exit(1)
})

child.on("close", (code) => {
  console.log(`\n📱 App closed with code ${code}`)
})

// Handle process termination
process.on("SIGINT", () => {
  console.log("\n🛑 Stopping test...")
  child.kill("SIGINT")
  process.exit(0)
})
