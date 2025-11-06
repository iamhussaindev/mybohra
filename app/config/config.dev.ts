/**
 * These are configuration settings for the dev environment.
 *
 * Do not include API secrets in this file or anywhere in your JS.
 *
 * https://reactnative.dev/docs/security#storing-sensitive-info
 */

const ip = "http://192.168.1.15"

export default {
  API_URL: `${ip}:3000/api/`,
  SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL || "https://your-project.supabase.co",
  SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "your-anon-key-here",
}
