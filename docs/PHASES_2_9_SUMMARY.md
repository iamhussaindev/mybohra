# Phases 2–9 Implementation Summary

**Date:** June 2026

## Phase 2 — Data Fetching & Real-time Sync

- `app/services/cache/sqlite.service.ts` — expo-sqlite offline tables (mazaars, miqaat, library)
- `app/services/cache/sync.service.ts` — sync on launch with cache fallback
- `app/hooks/useOfflineSync.ts` — wired in `app.tsx`
- `app/services/supabase/subscriptions/` — business, post, miqaat Realtime
- `app/hooks/useRealtimeSubscriptions.ts` — invalidates TanStack Query on changes

## Phase 3 — Search & Universal Discovery

- `app/services/search/fuse.service.ts` — shared Fuse.js helpers
- `app/services/supabase/queries/search.query.ts` — Fuse + offline cache fallback
- `app/screens/Search/SearchScreen.tsx` — tabbed universal search UI

## Phase 4 — Location & Geofencing

- `app/services/location/geofence.utils.ts` — pure distance/radius logic
- `app/services/location/geofence.service.ts` — `watchLocation` via react-native-geolocation-service
- `app/hooks/useGeofencing.ts` + `app/components/GeofenceManager.tsx`
- `app/screens/Mazaars/MazaarContextualSheet.tsx` — auto bottom sheet near mazaar

## Phase 5 — Performance

- `MazaarScreen` — memoized cards, FlashList via `ListView`, navigation to `MazarDetail`
- `MarketScreen` — `useBusinesses` + `ListView`

## Phase 6 — Error Handling & Validation

- `app/services/api/errorHandler.ts`
- `app/schemas/business.schema.ts` (Zod)

## Phase 7 — Type Safety

- `app/services/supabase/typed-client.ts`
- `app/types/api.ts` — discriminated `ApiResponse<T>`

## Phase 8 — Testing

- `test/store/auth.store.test.ts`
- `test/services/fuse.service.test.ts`
- `test/services/geofence.service.test.ts`
- `test/services/errorHandler.test.ts`
- `test/schemas/business.schema.test.ts`

## Phase 9 — Integration

- Auth screens migrated to `useAuthStore`
- `GeofenceManager` + `MazaarContextualSheet` in `app.tsx`
- Mazaar list → detail navigation wired
- Mazaar search icon → Search tab

## Remaining (incremental)

- [x] Migrate `DuaListSearch` to `useLibrarySearch`
- [x] Replace nested FlatLists in `MazarDetailScreen`
- [x] Build out `AccountScreen`
- [x] `CachedImage` via expo-image (Mazaar, Market, MazarDetail)
- [x] Universal search edge function (`mybohra-dashboard/supabase/functions/search`)

## Deploy search edge function

```bash
# From mybohra-dashboard (or app repo copy)
supabase functions deploy search
```

The app calls `supabase.functions.invoke('search', { body: { query } })` and falls back to client-side Fuse search when unavailable.
