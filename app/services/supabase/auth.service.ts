import type { Session, User } from "@supabase/supabase-js"

import { supabase } from "./client"

export type AuthResult = { user: User; session: Session } | { error: string }

export async function signInWithOtp(email: string): Promise<{ error: string | null }> {
  const trimmed = email.trim().toLowerCase()
  const { error } = await supabase.auth.signInWithOtp({
    email: trimmed,
    options: { shouldCreateUser: true },
  })
  return { error: error?.message ?? null }
}

export async function verifyOtp(email: string, token: string): Promise<AuthResult> {
  const { data, error } = await supabase.auth.verifyOtp({
    email: email.trim().toLowerCase(),
    token: token.trim().replace(/\s/g, ""),
    type: "email",
  })
  if (error) return { error: error.message }
  if (!data.user || !data.session) return { error: "Verification failed" }
  return { user: data.user, session: data.session }
}

export async function signOut(): Promise<{ error: string | null }> {
  const { error } = await supabase.auth.signOut()
  return { error: error?.message ?? null }
}

export async function getSession(): Promise<Session | null> {
  const { data } = await supabase.auth.getSession()
  return data.session
}

export async function getUser(): Promise<User | null> {
  const { data } = await supabase.auth.getUser()
  return data.user
}

export function onAuthStateChange(
  callback: (event: string, session: Session | null) => void,
): () => void {
  const { data } = supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session)
  })
  return () => data.subscription.unsubscribe()
}
