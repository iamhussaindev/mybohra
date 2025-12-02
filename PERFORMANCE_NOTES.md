# Performance Notes & Implementation Suggestions

## Summary of Changes

### ✅ Completed
1. **Bookmarks now store full objects** instead of just IDs
   - Changed `pinnedPdfIds` to `pinnedPdfs` in DataStore
   - Bookmarks are stored locally in AsyncStorage as full objects
   - Migration handles old format (IDs only) gracefully

2. **Removed all library caching**
   - Removed `fetchList()` caching logic
   - Removed `allLibraryData` from LibraryStore
   - All library data now fetched on-demand from Supabase

3. **Added new API methods**
   - `fetchAlbums()` - Get distinct albums with counts
   - `fetchCategories()` - Get distinct categories with counts
   - `fetchTags()` - Get distinct tags with counts
   - `fetchByAlbum(album)` - Fetch items by album
   - `fetchByCategories(categories[])` - Fetch items by categories
   - `fetchByTags(tags[])` - Fetch items by tags
   - `searchLibrary(query)` - Search using RPC function

4. **Updated LibraryStore**
   - Added `fetchCategories()`, `fetchAlbums()`, `fetchTags()` actions
   - Added `fetchByAlbum()`, `fetchByCategories()`, `fetchByTags()` actions
   - Added `searchLibrary()` action
   - All methods fetch from Supabase on-demand

5. **Updated all components**
   - All components now use `pinnedPdfs` instead of `pinnedPdfIds`
   - Components fetch data on-demand instead of using cached data

## Performance Considerations & Suggestions

### ⚠️ Potential Performance Issues

1. **Recent PDF History**
   - **Issue**: `DuaHomeScreen` currently has an empty array for `recentPdfItems` because we removed `allLibraryData`
   - **Solution**: Create a new API method `fetchLibraryItemsByIds(ids: number[])` to fetch specific items by IDs
   - **Implementation**:
   ```typescript
   async fetchLibraryItemsByIds(ids: number[]): Promise<...> {
     const { data, error } = await supabase
       .from("library")
       .select("*")
       .in("id", ids)
       .eq("album", "DUA")
     // ...
   }
   ```

2. **Category Fetching**
   - **Current**: Categories are fetched once and stored in LibraryStore
   - **Suggestion**: This is fine for categories as they don't change often
   - **Consider**: Add a refresh mechanism if categories change frequently

3. **Search RPC Function**
   - **Current**: Uses `search_library` RPC function
   - **Important**: Ensure this RPC function exists in your Supabase database
   - **If missing**, create it:
   ```sql
   CREATE OR REPLACE FUNCTION search_library(search_query TEXT)
   RETURNS TABLE(id INTEGER, name TEXT, ...) AS $$
   BEGIN
     RETURN QUERY
     SELECT * FROM library
     WHERE 
       album = 'DUA' AND
       (
         search_text ILIKE '%' || search_query || '%' OR
         name ILIKE '%' || search_query || '%' OR
         description ILIKE '%' || search_query || '%'
       )
     ORDER BY name;
   END;
   $$ LANGUAGE plpgsql;
   ```

4. **Query Efficiency**
   - ✅ **Good**: Using `.eq("album", "DUA")` filter at database level
   - ✅ **Good**: Using `.overlaps()` for array fields (categories, tags)
   - ✅ **Good**: Using `.in()` for ID lookups (when implemented)
   - ⚠️ **Watch**: Ensure database indexes exist:
     - Index on `album` column
     - Index on `categories` (GIN index for array)
     - Index on `tags` (GIN index for array)
     - Index on `search_text` for full-text search

5. **Network Requests**
   - **Current**: Each fetch is a separate network request
   - **Suggestion**: Consider batching requests where possible
   - **Example**: If fetching categories and albums together, create a combined endpoint

6. **Caching Strategy**
   - **Current**: No caching for library data (as requested)
   - **Suggestion**: Consider adding short-term in-memory cache (5-10 minutes) for:
     - Categories list
     - Albums list
     - Tags list
   - **Reason**: These change infrequently and are used in UI navigation

### 🔧 Recommended Database Indexes

```sql
-- Essential indexes for performance
CREATE INDEX IF NOT EXISTS idx_library_album ON library(album);
CREATE INDEX IF NOT EXISTS idx_library_categories ON library USING GIN(categories);
CREATE INDEX IF NOT EXISTS idx_library_tags ON library USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_library_search_text ON library USING GIN(to_tsvector('english', search_text));

-- Composite index for common queries
CREATE INDEX IF NOT EXISTS idx_library_album_categories ON library(album) WHERE categories IS NOT NULL;
```

### 📝 Additional Recommendations

1. **Error Handling**
   - All fetch methods return empty arrays on error
   - Consider adding retry logic for network failures
   - Add user-facing error messages for critical failures

2. **Loading States**
   - Components should show loading indicators while fetching
   - Consider using React Query or similar for better loading state management

3. **Pagination**
   - Current implementation fetches all items
   - Consider adding pagination for large result sets:
     ```typescript
     .range(offset, offset + limit - 1)
     ```

4. **Debouncing Search**
   - If implementing search in UI, add debouncing (300-500ms)
   - Prevents excessive API calls while user types

5. **Bookmark Storage Size**
   - Storing full objects increases storage size
   - Monitor AsyncStorage size if users bookmark many items
   - Consider compression or limiting bookmark count

## Migration Notes

- Old bookmarks (IDs only) will be cleared on first load
- Users will need to re-pin items after update
- Consider showing a migration message to users

## Testing Checklist

- [ ] Test bookmarking/unbookmarking items
- [ ] Test fetching by categories
- [ ] Test fetching by album
- [ ] Test fetching by tags
- [ ] Test search functionality
- [ ] Test with empty results
- [ ] Test with network errors
- [ ] Verify database indexes exist
- [ ] Verify RPC function exists

