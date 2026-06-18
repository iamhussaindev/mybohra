# Generated store models

**Do not edit files in this folder.**

These MobX-State-Tree models and row types are generated from `mybohra-dashboard/supabase/migrations/` via:

```bash
cd mybohra-dashboard && npm run db:sync
```

| File | Contents |
|------|----------|
| `db-rows.generated.ts` | `*Row`, `*Insert`, `*Update` type aliases |
| `db-models.generated.ts` | `*DbModel` MST models matching database columns |
| `index.ts` | Re-exports |

Hand-written store files (`LibraryStore.ts`, `YouTubeStore.ts`, etc.) import from here and add actions, views, and UI-only fields.

To add a table to generation, edit `mybohra-dashboard/scripts/schema/app-store-tables.json`.
