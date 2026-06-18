# Database types (no schema in this repo)

This app does **not** contain SQL migrations or schema files.

| What | Where |
|------|--------|
| Schema migrations | `mybohra-dashboard/supabase/migrations/` |
| Generated types | `app/services/supabase/database.types.ts` |
| Type imports | `app/services/supabase/types.ts` |

## Sync types after schema changes

```bash
cd mybohra-dashboard && npm run db:sync
```

Or from this repo:

```bash
npm run db:types
```

Full guide: `mybohra-dashboard/docs/SCHEMA_SYNC.md`
