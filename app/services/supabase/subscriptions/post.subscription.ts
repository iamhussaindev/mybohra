import { supabase } from "../client"

/** Post table updates (business feed / announcements). */
export function subscribeToPosts(
  onInsert: (post: Record<string, unknown>) => void,
  onUpdate: (post: Record<string, unknown>) => void,
  onDelete: (id: string) => void,
): () => void {
  const channel = supabase
    .channel("post-changes")
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "post" },
      (payload) => onInsert(payload.new as Record<string, unknown>),
    )
    .on(
      "postgres_changes",
      { event: "UPDATE", schema: "public", table: "post" },
      (payload) => onUpdate(payload.new as Record<string, unknown>),
    )
    .on(
      "postgres_changes",
      { event: "DELETE", schema: "public", table: "post" },
      (payload) => onDelete(String((payload.old as { id: string }).id)),
    )
    .subscribe()

  return () => {
    void supabase.removeChannel(channel)
  }
}
