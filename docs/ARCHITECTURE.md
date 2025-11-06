# Architecture Overview

## Backend & Data Layer

### What We're Using: Supabase PostgREST

The app uses **Supabase's PostgREST API** (not GraphQL) through the Supabase JavaScript client.

```typescript
// Example query
const { data, error } = await supabase
  .from("library")
  .select("*")
  .eq("album", "Daily Duas")
  .order("name")
```

### Why PostgREST Instead of GraphQL?

| Feature | PostgREST (Current) | GraphQL |
|---------|---------------------|---------|
| **Setup** | ✅ Zero config | ❌ Requires pg_graphql extension |
| **Stability** | ✅ Production-ready | ⚠️ Less mature in Supabase |
| **Type Safety** | ✅ Full TypeScript types | ✅ Full TypeScript types |
| **Queries** | ✅ Simple & direct | ✅ Flexible & powerful |
| **Learning Curve** | ✅ Easy | ⚠️ Steeper |
| **Supabase Support** | ✅ Primary API | ⚠️ Secondary option |

**Decision**: PostgREST is Supabase's primary API and is simpler for this use case.

## API Service Layer

### Structure

```
app/services/
├── supabase/
│   ├── supabase.ts         # Supabase client instance
│   ├── types.ts            # Database TypeScript types
│   └── index.ts
├── api/
│   ├── api.ts              # Legacy REST API (for reference)
│   ├── api-graphql.ts      # New Supabase API (misnamed, uses PostgREST)
│   ├── api.types.ts        # API type definitions
│   └── index.ts
└── firebase/               # Analytics only
    └── firebase.ts
```

### API Service (`api-graphql.ts`)

Despite the name, this file uses **Supabase PostgREST**, not GraphQL.

Key methods:

- `fetchData(key)` - Fetch config data
- `fetchVersion(key)` - Get version numbers
- `fetchLocation(lat, lng)` - Find nearest location
- `fetchLocations()` - Get all locations
- `fetchMiqaats()` - Get Islamic calendar dates
- `fetch(endpoint)` - Generic fetch for migrations

### Why is it named "api-graphql.ts"?

Historical reasons from initial planning. The implementation uses PostgREST.

**Exports:**

```typescript
export const apiSupabase = new ApiSupabase()  // Actual instance
export const apiGraphQL = apiSupabase         // Alias for compatibility
```

## State Management

### MobX State Tree

All stores use MobX State Tree for reactive state management:

```
app/models/
├── DataStore.ts       # Locations, settings, config
├── LibraryStore.ts    # Duas and library items
├── MiqaatStore.ts     # Islamic calendar dates
├── TasbeehStore.ts    # Prayer bead counter
├── ReminderStore.ts   # Local reminders (no API)
└── RootStore.ts       # Root store combining all
```

### Data Flow

```
Component → Store Action → API Service → Supabase → PostgreSQL
                ↓                           ↓
          Local Storage ←─────────────── Response
```

## Database Schema

PostgreSQL tables in Supabase:

- **data** - Config key-value pairs (versions, settings)
- **location** - Cities with coordinates
- **library** - Duas, prayers, religious texts
- **daily_duas** - Daily assigned duas
- **miqaat** - Important Islamic dates
- **miqaat_library** - Relationship table
- **tasbeeh** - Dhikr/prayer bead items
- **user** - User profiles (future use)

### Type Generation

Types are manually created in `app/services/supabase/types.ts` based on the schema.

**Future**: Can be auto-generated using Supabase CLI:

```bash
supabase gen types typescript --project-id <project-id> > types.ts
```

## Caching Strategy

### Version-Based Caching

Each data type has a version number stored in the `data` table:

```typescript
// Check version
const version = await apiSupabase.fetchVersion("miqaat_version")

// Compare with stored version
if (cachedVersion === version) {
  // Use cached data
} else {
  // Fetch fresh data
}
```

Cached in:

- **AsyncStorage** - Persistent local storage
- **MobX Store** - In-memory for app session

## Authentication

Currently: **No authentication** (public read access)

**Future Options:**

- Supabase Auth (email, social providers)
- Row Level Security (RLS) policies
- User-specific data

## Real-time Subscriptions

Not currently implemented, but Supabase supports it:

```typescript
// Future: Real-time updates
supabase
  .channel('miqaat-changes')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'miqaat' },
    (payload) => {
      // Update store with new data
    }
  )
  .subscribe()
```

## Storage

For files (audio, PDFs):

- Currently: External URLs stored in database
- **Future**: Supabase Storage buckets

## Performance Optimizations

1. **Caching**: Version-based to minimize API calls
2. **Lazy Loading**: Data fetched on-demand
3. **Pagination**: Not yet implemented (future)
4. **Indexes**: Database indexes on frequently queried fields
5. **CDN**: For static assets (images, fonts)

## Error Handling

Consistent error response format:

```typescript
type GeneralApiProblem =
  | { kind: "timeout" }
  | { kind: "cannot-connect" }
  | { kind: "server" }
  | { kind: "unauthorized" }
  | { kind: "forbidden" }
  | { kind: "not-found" }
  | { kind: "bad-data" }
```

## Security

Current:

- ✅ Environment variables for secrets
- ✅ HTTPS for all API calls
- ✅ Public anon key (limited permissions)

Production TODO:

- [ ] Enable Row Level Security (RLS)
- [ ] Implement authentication
- [ ] Create security policies
- [ ] Rate limiting
- [ ] Input validation

## Migration from Old API

The migration maintains API compatibility:

```typescript
// Old API
import { api } from "app/services/api"
const response = await api.fetchLocations()

// New API (same interface!)
import { apiGraphQL } from "app/services/api"
const response = await apiGraphQL.fetchLocations()
```

## When Would We Need GraphQL?

Consider GraphQL if you need:

1. **Complex Nested Queries**

   ```graphql
   query {
     miqaat(id: 1) {
       name
       library_items {
         name
         audio_url
       }
     }
   }
   ```

2. **Precise Field Selection**
   - Reduce over-fetching
   - Custom response shapes

3. **Multiple Resources in One Request**
   - Batch queries
   - Reduce round trips

**Current Decision**: PostgREST is sufficient for current needs.

## Technology Stack Summary

- **Frontend**: React Native + Expo
- **State**: MobX State Tree
- **Database**: PostgreSQL (Supabase)
- **API**: PostgREST (via Supabase JS client)
- **Storage**: AsyncStorage (local)
- **Analytics**: Firebase
- **Types**: TypeScript throughout

## Future Enhancements

1. **Authentication** - Supabase Auth
2. **Real-time** - Live updates via Supabase Realtime
3. **Storage** - File hosting in Supabase Storage
4. **Search** - Full-text search using PostgreSQL
5. **Offline** - Better offline support with sync
6. **Push Notifications** - Server-side triggers

---

**Note**: Despite mentions of "GraphQL" in file names and docs, the app uses **Supabase PostgREST**, not GraphQL.
