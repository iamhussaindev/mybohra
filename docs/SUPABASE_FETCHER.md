# Supabase Fetcher Service

## Overview

The Supabase Fetcher Service provides a clean, type-safe way to fetch data from your Supabase database using PostgREST API. It replaces the need for manual SQL queries and provides TypeScript type safety.

## Features

- ✅ **Type-safe data fetching** - Full TypeScript support
- ✅ **PostgREST API** - Uses Supabase's auto-generated REST API
- ✅ **Relationship loading** - Automatically loads related data (e.g., library data for daily duas)
- ✅ **Error handling** - Consistent error handling across all methods
- ✅ **Ordering support** - Built-in ordering by creation date
- ✅ **Flexible queries** - Support for date-based filtering

## Installation

The service is already included in your project. No additional installation required.

## Usage

### Basic Import

```typescript
import { supabaseFetcherService } from "app/services/supabase/fetcher"
```

### Fetch Daily Duas by Date

This is the equivalent of your TypeORM query:

```typescript
// TypeORM (old way)
return await this.dailyDuaRepository.find({
  where: {
    date: getByDateDto.date,
    month: getByDateDto.month,
  },
  relations: { library: true },
  order: {
    createdAt: 'ASC',
  },
});

// Supabase (new way)
const result = await supabaseFetcherService.fetchDailyDuas({
  date: 15,
  month: 1
})

if (result.success) {
  console.log("Daily duas:", result.data)
} else {
  console.error("Error:", result.error)
}
```

### Fetch Today's Daily Duas

```typescript
const result = await supabaseFetcherService.fetchTodayDailyDuas()

if (result.success) {
  console.log("Today's daily duas:", result.data)
}
```

### Fetch All Daily Duas

```typescript
const result = await supabaseFetcherService.fetchAllDailyDuas()

if (result.success) {
  console.log("All daily duas:", result.data)
}
```

## API Reference

### `fetchDailyDuas(params: GetByDateDto)`

Fetches daily duas for a specific date and month.

**Parameters:**

- `params.date` - Day of the month (1-31)
- `params.month` - Month of the year (1-12)

**Returns:**

```typescript
{
  success: boolean
  data?: DailyDuaWithLibrary[]
  error?: string
}
```

### `fetchTodayDailyDuas()`

Fetches daily duas for the current date.

**Returns:**

```typescript
{
  success: boolean
  data?: DailyDuaWithLibrary[]
  error?: string
}
```

### `fetchDailyDuasByDate(date: number, month: number)`

Fetches daily duas for a specific date, filtered by library categories containing "daily_".

**Parameters:**

- `date` - Day of the month (1-31)
- `month` - Month of the year (1-12)

**Returns:**

```typescript
{
  success: boolean
  data?: DailyDuaWithLibrary[]
  error?: string
}
```

**Filter:** Only returns daily duas where `library.categories` contains "daily_"

### `fetchAllDailyDuas()`

Fetches all daily duas (for admin purposes).

**Returns:**

```typescript
{
  success: boolean
  data?: DailyDuaWithLibrary[]
  error?: string
}
```

## Data Structure

### DailyDuaWithLibrary

```typescript
interface DailyDuaWithLibrary {
  id: number
  date: number
  month: number
  library_id: number
  note: string | null
  created_at: string
  updated_at: string
  library: {
    id: number
    name: string
    description: string | null
    audio_url: string | null
    pdf_url: string | null
    youtube_url: string | null
    album: any
    metadata: any
    tags: string[]
    categories: string[]
    search_text: string | null
    created_at: string
    updated_at: string
  }
}
```

## Error Handling

### Success Response

```typescript
{
  success: true,
  data: DailyDuaWithLibrary[]
}
```

### Error Response

```typescript
{
  success: false,
  error: string
}
```

### Common Error Scenarios

1. **Permission denied** - User doesn't have access to the data
2. **Network error** - Connection to Supabase failed
3. **Invalid parameters** - Date/month values are invalid
4. **Database error** - Supabase database error

## Examples

### React Component Usage

```typescript
import React, { useEffect, useState } from 'react'
import { supabaseFetcherService } from 'app/services/supabase/fetcher'

export function DailyDuasScreen() {
  const [dailyDuas, setDailyDuas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function loadDailyDuas() {
      try {
        const result = await supabaseFetcherService.fetchTodayDailyDuas()
        
        if (result.success) {
          setDailyDuas(result.data || [])
        } else {
          setError(result.error)
        }
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadDailyDuas()
  }, [])

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div>
      {dailyDuas.map((dua) => (
        <div key={dua.id}>
          <h3>{dua.library.name}</h3>
          <p>{dua.library.description}</p>
          {dua.library.audio_url && (
            <audio controls src={dua.library.audio_url} />
          )}
        </div>
      ))}
    </div>
  )
}
```

### Service Class Usage

```typescript
export class DailyDuaService {
  async getDailyDuasForDate(date: number, month: number) {
    const result = await supabaseFetcherService.fetchDailyDuas({ date, month })
    
    if (result.success) {
      return result.data
    } else {
      throw new Error(result.error)
    }
  }

  async getTodayDailyDuas() {
    const result = await supabaseFetcherService.fetchTodayDailyDuas()
    
    if (result.success) {
      return result.data
    } else {
      throw new Error(result.error)
    }
  }
}
```

### Error Handling Patterns

```typescript
async function handleDailyDuas() {
  try {
    const result = await supabaseFetcherService.fetchDailyDuas({ date: 15, month: 1 })
    
    if (!result.success) {
      // Handle specific error cases
      if (result.error?.includes("permission")) {
        console.error("Permission denied")
      } else if (result.error?.includes("network")) {
        console.error("Network error")
      } else {
        console.error("Unknown error:", result.error)
      }
      return
    }

    // Process successful result
    const dailyDuas = result.data
    console.log(`Found ${dailyDuas?.length || 0} daily duas`)
    
  } catch (error) {
    console.error("Unexpected error:", error)
  }
}
```

## Testing

### Test Script

Run the test script to verify the service works:

```bash
node test-supabase-fetcher.js
```

### Manual Testing

```typescript
import { supabaseFetcherService } from 'app/services/supabase/fetcher'

// Test fetching daily duas
const result = await supabaseFetcherService.fetchDailyDuas({ date: 15, month: 1 })
console.log('Result:', result)
```

## Migration from TypeORM

### Before (TypeORM)

```typescript
return await this.dailyDuaRepository.find({
  where: {
    date: getByDateDto.date,
    month: getByDateDto.month,
  },
  relations: { library: true },
  order: {
    createdAt: 'ASC',
  },
});
```

### After (Supabase)

```typescript
const result = await supabaseFetcherService.fetchDailyDuas({
  date: getByDateDto.date,
  month: getByDateDto.month,
})

if (result.success) {
  return result.data
} else {
  throw new Error(result.error)
}
```

## Performance Considerations

1. **Caching** - Consider implementing caching for frequently accessed data
2. **Pagination** - For large datasets, implement pagination
3. **Indexing** - Ensure proper database indexes on date/month columns
4. **Connection pooling** - Supabase handles this automatically

## Troubleshooting

### Common Issues

1. **"Permission denied"** - Check Supabase RLS policies
2. **"Network error"** - Verify Supabase URL and API key
3. **"Invalid parameters"** - Ensure date/month values are valid
4. **"No data found"** - Check if data exists for the specified date

### Debug Mode

Enable debug logging:

```typescript
// Add to your app configuration
if (__DEV__) {
  console.log('Supabase Fetcher Debug Mode Enabled')
}
```

## Best Practices

1. **Always check success** - Always check the `success` field before using data
2. **Handle errors gracefully** - Implement proper error handling
3. **Use TypeScript** - Leverage TypeScript for type safety
4. **Cache when appropriate** - Cache frequently accessed data
5. **Test thoroughly** - Test all error scenarios

## Support

For issues or questions:

1. Check the [Supabase Documentation](https://supabase.com/docs)
2. Review the [PostgREST API Documentation](https://postgrest.org/)
3. Check the test examples in `app/services/supabase/examples.ts`

---

**Created**: $(date)
**Status**: ✅ Ready for use
**Version**: 1.0.0
