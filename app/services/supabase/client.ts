import { createClient, SupabaseClient } from "@supabase/supabase-js"
import Config from "app/config"

import { Database } from "./types"

export type TypedSupabaseClient = SupabaseClient<Database>

export const supabase: TypedSupabaseClient = createClient<Database>(
  Config.SUPABASE_URL,
  Config.SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  },
)

export function getTypedClient(): TypedSupabaseClient {
  return supabase
}
