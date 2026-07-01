import type { Tables } from "../types"
import { supabase } from "../client"

export type BusinessRow = Tables<"business">

export function subscribeToBusinessListings(
  onInsert: (business: BusinessRow) => void,
  onUpdate: (business: BusinessRow) => void,
  onDelete: (id: string) => void,
): () => void {
  const channel = supabase
    .channel("business-changes")
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "business" },
      (payload) => onInsert(payload.new as BusinessRow),
    )
    .on(
      "postgres_changes",
      { event: "UPDATE", schema: "public", table: "business" },
      (payload) => onUpdate(payload.new as BusinessRow),
    )
    .on(
      "postgres_changes",
      { event: "DELETE", schema: "public", table: "business" },
      (payload) => onDelete((payload.old as { id: string }).id),
    )
    .subscribe()

  return () => {
    void supabase.removeChannel(channel)
  }
}
