/**
 * Supabase database types — synced from mybohra-dashboard.
 *
 * DO NOT edit database.types.ts manually.
 * Schema source of truth: mybohra-dashboard/supabase/migrations/
 *
 * Regenerate:
 *   cd mybohra-dashboard && npm run db:sync
 *   — or from app repo: npm run db:types
 */

export type {
  CompositeTypes,
  Database,
  Enums,
  Json,
  Tables,
  TablesInsert,
  TablesUpdate,
} from './database.types'

export { Constants } from './database.types'
