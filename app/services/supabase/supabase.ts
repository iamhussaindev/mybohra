import { createClient } from "@supabase/supabase-js"
import Config from "app/config"

import { Database } from "./types"

// Create a single supabase client for interacting with your database
export const supabase = createClient<Database>(Config.SUPABASE_URL, Config.SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
})
