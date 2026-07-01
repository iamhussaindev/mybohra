import type { Tables } from "../types"
import { supabase } from "../client"

export type MiqaatRow = Tables<"miqaat">

export function subscribeToMiqaatChanges(
  onInsert: (miqaat: MiqaatRow) => void,
  onUpdate: (miqaat: MiqaatRow) => void,
  onDelete: (id: number) => void,
): () => void {
  const channel = supabase
    .channel("miqaat-changes")
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "miqaat" },
      (payload) => onInsert(payload.new as MiqaatRow),
    )
    .on(
      "postgres_changes",
      { event: "UPDATE", schema: "public", table: "miqaat" },
      (payload) => onUpdate(payload.new as MiqaatRow),
    )
    .on(
      "postgres_changes",
      { event: "DELETE", schema: "public", table: "miqaat" },
      (payload) => onDelete((payload.old as MiqaatRow).id),
    )
    .subscribe()

  return () => {
    void supabase.removeChannel(channel)
  }
}
