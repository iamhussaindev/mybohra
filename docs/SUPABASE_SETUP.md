# Supabase Setup Guide

This guide will help you set up Supabase in your React Native Expo app.

## Overview

The app has been refactored to use **Supabase** as the backend database with **PostgREST API** for data fetching. This replaces the previous REST API implementation.

## What Changed?

### 1. Dependencies Added
- `@supabase/supabase-js` - Supabase client library
- `@apollo/client` - Apollo Client for GraphQL
- `graphql` - GraphQL core library

### 2. New Service Files

#### Supabase Service
- **Location**: `app/services/supabase/`
- **Files**:
  - `supabase.ts` - Supabase client configuration
  - `types.ts` - TypeScript types generated from database schema
  - `index.ts` - Export file

#### API Service (Refactored)
- **Location**: `app/services/api/`
- **New File**: `api-graphql.ts` - New Supabase-based API service (uses PostgREST)
- **Note**: Despite the filename, this uses PostgREST, NOT GraphQL
- **Note**: The old `api.ts` is still available for backward compatibility during migration

### 3. Stores Refactored

All stores have been updated to use the new `apiGraphQL` service:
- ✅ `DataStore` - Location and settings management
- ✅ `LibraryStore` - Library/Dua items
- ✅ `MiqaatStore` - Miqaat (religious events)
- ✅ `TasbeehStore` - Tasbeeh (prayer beads)
- ℹ️ `ReminderStore` - No changes (uses local storage and native modules)

### 4. Configuration Updates

Environment variables added to `env.example`:
```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
EXPO_PUBLIC_SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

Configuration files updated:
- `app/config/config.dev.ts`
- `app/config/config.prod.ts`

## Setup Instructions

### Step 1: Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Fill in the project details:
   - **Name**: Your project name (e.g., "MyBohra App")
   - **Database Password**: Choose a strong password
   - **Region**: Select the closest region to your users
5. Click "Create new project" and wait for it to initialize

### Step 2: Set Up Database Schema

1. In your Supabase dashboard, go to the **SQL Editor**
2. Copy the schema from `app/database/database.sql`
3. Paste it into the SQL Editor
4. Run the SQL to create all tables
5. Enable Row Level Security (RLS) if needed for your use case

### Step 3: Verify API Access

1. In your Supabase dashboard, go to **Settings** → **API**
2. Verify that the **Auto-generated REST API** is enabled (it's enabled by default)
3. Note: The app uses Supabase's PostgREST API via the JavaScript client

### Step 4: Get Your API Keys

1. Go to **Settings** → **API** in your Supabase dashboard
2. Copy the following values:
   - **Project URL**: `https://your-project.supabase.co`
   - **anon/public key**: Your public API key
   - **service_role key**: Your service role key (keep this secret!)

### Step 5: Configure Environment Variables

1. Create a `.env` file in the root of your project (copy from `env.example`)
2. Add your Supabase credentials:

```env
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=https://your-actual-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-actual-anon-key-here
EXPO_PUBLIC_SUPABASE_SERVICE_ROLE_KEY=your-actual-service-role-key-here
```

3. **Important**: Add `.env` to your `.gitignore` if not already there

### Step 6: Seed Your Database (Optional)

If you have existing data, you'll need to migrate it to Supabase:

1. Export data from your old API/database
2. Use Supabase's bulk insert or SQL commands to import data
3. Example SQL for bulk insert:

```sql
INSERT INTO location (type, city, country, latitude, longitude, timezone, state)
VALUES
  ('city', 'Mumbai', 'India', 19.076, 72.8777, 'Asia/Kolkata', 'Maharashtra'),
  ('city', 'Delhi', 'India', 28.6139, 77.2090, 'Asia/Kolkata', 'Delhi');
```

### Step 7: Test the Connection

1. Start your development server:
   ```bash
   yarn start
   ```

2. The app should now connect to Supabase
3. Check the console for any connection errors
4. Test data fetching in each screen

## Database Schema Overview

Your database includes the following tables:

| Table | Description |
|-------|-------------|
| `data` | Key-value store for app configuration and versions |
| `location` | Cities and locations with coordinates |
| `library` | Duas, prayers, and religious content |
| `daily_duas` | Daily assigned duas linked to library items |
| `miqaat` | Important dates and events in the Islamic calendar |
| `miqaat_library` | Junction table linking miqaats to library items |
| `tasbeeh` | Tasbeeh (dhikr) items with text and counts |
| `user` | User profile information |

## API Migration Guide

### Old API (REST)
```typescript
import { api } from "app/services/api"

// Fetch locations
const response = await api.fetchLocations()
if (response.kind === "ok") {
  const locations = response.data
}
```

### New API (Supabase PostgREST)
```typescript
import { apiGraphQL } from "app/services/api" // Name kept for compatibility

// Fetch locations (same interface!)
const response = await apiGraphQL.fetchLocations()
if (response.kind === "ok") {
  const locations = response.data
}
```

**Note**: The API interface remains the same, so minimal changes are needed in your stores!

## Direct Supabase Client Usage

You can also use the Supabase client directly for more advanced queries:

```typescript
import { supabase } from "app/services/supabase"

// Query with filters
const { data, error } = await supabase
  .from("library")
  .select("*")
  .eq("album", "Duas")
  .order("name")

// Insert data
const { data, error } = await supabase
  .from("location")
  .insert([
    { city: "New York", country: "USA", latitude: 40.7128, longitude: -74.0060, timezone: "America/New_York", type: "city" }
  ])

// Update data
const { data, error } = await supabase
  .from("data")
  .update({ value: "2" })
  .eq("key", "MIQAAT_VERSION")
```

## PostgREST API Examples

The app uses Supabase's auto-generated PostgREST API. You can query directly:

```typescript
import { supabase } from "app/services/supabase"

// Simple query
const { data, error } = await supabase
  .from("location")
  .select("*")
  .order("city")

// With filters
const { data, error } = await supabase
  .from("library")
  .select("*")
  .eq("album", "Daily Duas")
  .order("name")
```

## Troubleshooting

### Issue: "Invalid API key" error
- **Solution**: Double-check your `EXPO_PUBLIC_SUPABASE_ANON_KEY` in the `.env` file
- Make sure you copied the correct key from Supabase dashboard

### Issue: "Failed to fetch" or network errors
- **Solution**: Check your `EXPO_PUBLIC_SUPABASE_URL` is correct
- Ensure your internet connection is working
- Check if Supabase is having any outages at [status.supabase.com](https://status.supabase.com)

### Issue: "Table does not exist" errors
- **Solution**: Make sure you ran the schema SQL in your Supabase SQL Editor
- Verify all tables are created in the Supabase Table Editor

### Issue: "Table does not exist" in API calls
- **Solution**: Ensure you ran the schema SQL to create all tables
- Verify table names match exactly (case-sensitive)
- Check that the Supabase project is active

### Issue: Row Level Security (RLS) blocking queries
- **Solution**: If you enabled RLS, you'll need to create policies
- For development, you can disable RLS on tables:
  ```sql
  ALTER TABLE library DISABLE ROW LEVEL SECURITY;
  ```
- For production, create appropriate RLS policies

## Security Best Practices

1. **Never commit `.env` files** - Always use `.env.example` as a template
2. **Use environment-specific configs** - Different keys for dev/staging/production
3. **Enable RLS in production** - Protect your data with Row Level Security
4. **Use service role key carefully** - Only use it for admin operations, never expose it client-side
5. **Implement authentication** - Use Supabase Auth for user management

## Next Steps

1. ✅ Set up your Supabase project
2. ✅ Configure environment variables
3. ✅ Migrate/seed your data
4. ✅ Test the app thoroughly
5. 🔄 Enable Row Level Security policies
6. 🔄 Set up authentication (if needed)
7. 🔄 Deploy your Supabase project to production

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [PostgREST Documentation](https://postgrest.org)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript)
- [Supabase React Native Guide](https://supabase.com/docs/guides/getting-started/tutorials/with-react-native)

## Support

If you encounter any issues:
1. Check the console logs for detailed error messages
2. Review the Supabase dashboard logs
3. Ensure all environment variables are set correctly
4. Verify your database schema matches the provided SQL

---

**Migration Date**: $(date)
**Status**: ✅ Complete

