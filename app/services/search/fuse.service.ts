import Fuse from "fuse.js"

export const FUSE_DEFAULTS = {
  miqaat: {
    keys: ["name", "description", "location"],
    threshold: 0.3,
    ignoreLocation: true,
  },
  mazaar: {
    keys: ["name"],
    threshold: 0.4,
    ignoreLocation: true,
  },
  business: {
    keys: ["business_name", "description"],
    threshold: 0.35,
    ignoreLocation: true,
  },
} as const

export function createFuseIndex<T>(items: T[], options: Fuse.IFuseOptions<T>): Fuse<T> {
  return new Fuse(items, options)
}

export function fuzzySearch<T>(fuse: Fuse<T>, query: string, limit = 20): T[] {
  if (!query.trim()) return []
  return fuse.search(query.trim(), { limit }).map((r) => r.item)
}
