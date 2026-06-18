# Phase 1 — State Management Audit

**Date:** June 2026  
**Status:** Foundation laid; MST remains source of truth for domain data until incremental migration.

## Current Architecture

| Layer | Technology | Location |
|-------|------------|----------|
| Domain state (remote + persisted) | MobX State Tree | `app/models/*.ts` |
| Auth session (new) | Zustand | `app/store/auth.store.ts` |
| UI / geofence / favorites (new) | Zustand | `app/store/app.store.ts`, `mazaar.store.ts`, `business.store.ts`, `user.store.ts` |
| Server cache (new) | TanStack Query | `app/services/supabase/queries/*.ts` |
| UI-only context | React Context | `app/contexts/`, `useAudio.tsx` |

## MST Stores → Migration Target

| MST Store | Remote Data | Migrate To | Priority | Notes |
|-----------|-------------|------------|----------|-------|
| `DataStore` | Locations, home location, qiyam, PDF activity, reminders settings | TanStack Query + Zustand (prefs) | Medium | Heavy AsyncStorage; split UI prefs from API |
| `MiqaatStore` | Miqaat calendar | `useMiqaats()` | High | Read-mostly; hook ready |
| `LibraryStore` | Duas, albums, categories, tags | `useDailyDuas()`, `useLibrarySearch()` | High | Search already RPC-backed |
| `InformationStore` | Mazaars, ziyarats, musafirkhanas, masjids | `useMazaars()` + new hooks | High | Geofence state → `useMazaarStore` |
| `TasbeehStore` | Tasbeeh list + counts | New `tasbeeh.query.ts` | Low | Local counts need SQLite sync |
| `ReminderStore` | Prayer reminders | Keep MST + `user.store` prefs | Low | Tied to `notificationService` |
| `YouTubeStore` | YouTube videos | New `youtube.query.ts` | Low | |

## `useState` / `useContext` Audit

### Keep as local UI state

- Form inputs (`AuthEmailScreen`, `AuthVerifyScreen`, `DuaListSearch`)
- Tab selection, modal visibility, search debounce timers
- Theme (`ThemeContext`) — no migration needed
- Location bottom sheet ref (`LocationBottomSheetContext`)
- Audio player (`SoundPlayerContext`)

### Replace with TanStack Query (when screens migrate)

| Screen / Hook | Current Pattern | Target Hook |
|---------------|-----------------|-------------|
| `MiqaatStore.fetchMiqaats` | MST flow in `app.tsx` boot | `useMiqaats()` |
| `LibraryStore.fetchHomeData` | MST flow in `app.tsx` boot | `useDailyDuas()` + albums |
| `InformationStore.fetchMazaars` | MST flow in screens | `useMazaars()` |
| `DuaListSearch` | `libraryStore.searchLibrary` | `useLibrarySearch()` |
| Future universal search tab | N/A | `useUniversalSearch()` |

### Replace with Zustand

| Concern | Current | Target |
|---------|---------|--------|
| Auth OTP flow | Inline `useState` in auth screens | `useAuthStore` |
| Geofence / current mazaar | Not centralized | `useMazaarStore` |
| Business favorites / filters | Not implemented | `useBusinessStore` |
| User preferences | Scattered in `DataStore` / `ReminderStore` | `useUserStore` (gradual) |

## What Phase 1 Delivered

- [x] `zustand` + `@tanstack/react-query` installed
- [x] `app/store/` — auth, app, mazaar, business, user stores
- [x] `app/services/supabase/client.ts` — typed Supabase client
- [x] `app/services/supabase/auth.service.ts` — OTP auth (matches existing flow)
- [x] Query hooks: mazaar, miqaat, library, business, search
- [x] `QueryProvider` + `useAuthInit` wired in `app.tsx`
- [x] **No MST stores removed** — zero feature regression risk

## Next Steps (Phase 1 continuation)

1. Migrate `AuthEmailScreen` / `AuthVerifyScreen` to `useAuthStore`
2. Opt-in one screen (e.g. Mazaar list) to `useMazaars()` alongside MST; compare parity
3. Add `test/store/auth.store.test.ts`
4. Phase 2: SQLite cache + realtime subscriptions (separate PR)

## Files Added

```
app/store/
  auth.store.ts, app.store.ts, mazaar.store.ts, business.store.ts, user.store.ts, index.ts
app/providers/QueryProvider.tsx
app/hooks/useAuthInit.ts
app/services/supabase/
  client.ts, auth.service.ts
  queries/mazaar.query.ts, miqaat.query.ts, library.query.ts, business.query.ts, search.query.ts, query-utils.ts
docs/PHASE1_STATE_AUDIT.md
```
