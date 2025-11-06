# Supabase Quick Start Guide

This is a condensed guide to get you up and running with Supabase in 15 minutes.

## ⚡ Quick Setup (15 minutes)

### Step 1: Create Supabase Project (5 min)
```
1. Go to https://supabase.com → Sign up
2. Click "New Project"
3. Name: "MyBohra App"
4. Set a database password
5. Choose region → Create
6. Wait for initialization
```

### Step 2: Create Database (3 min)
```
1. Go to SQL Editor in dashboard
2. Copy content from app/database/database.sql
3. Paste and click "Run"
4. Verify tables in Table Editor
```

### Step 3: Add Essential Data (2 min)
```sql
-- Run this in SQL Editor
INSERT INTO data (key, value) VALUES
  ('LOCATION', '1'),
  ('MIQAAT', '1'),
  ('TASBEEH', '1'),
  ('DUA_LIST', '1'),
  ('QIYAM', 'Default');

-- Add at least one location
INSERT INTO location (type, city, country, latitude, longitude, timezone)
VALUES ('city', 'Mumbai', 'India', 19.076, 72.8777, 'Asia/Kolkata');
```

### Step 4: Get API Keys (1 min)
```
1. Go to Settings → API
2. Copy "Project URL"
3. Copy "anon public" key
4. Save these values
```

### Step 5: Configure App (2 min)
```bash
# 1. Create .env file
cp env.example .env

# 2. Edit .env and add your credentials
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# 3. Install dependencies (if not already done)
yarn install
```

### Step 6: Test (2 min)
```bash
# Start the app
yarn start

# Check console for errors
# Test location selection
# Test loading data
```

Done! 🎉

---

## 📝 Common Tasks

### Add a Location
```sql
INSERT INTO location (type, city, country, latitude, longitude, timezone, state)
VALUES ('city', 'Delhi', 'India', 28.6139, 77.2090, 'Asia/Kolkata', 'Delhi');
```

### Add a Library Item
```sql
INSERT INTO library (name, description, audio_url, pdf_url, album)
VALUES (
  'Morning Dua',
  'Prayer for morning',
  'https://example.com/audio.mp3',
  'https://example.com/dua.pdf',
  'Daily Duas'
);
```

### Add a Miqaat
```sql
INSERT INTO miqaat (name, date, month, phase, important, type, priority)
VALUES ('Eid ul-Fitr', 1, 10, 'DAY', true, 'EID', 1);
```

### Add a Tasbeeh
```sql
INSERT INTO tasbeeh (name, text, arabic_text, count, type, tags)
VALUES (
  'Subhanallah',
  'Glory be to Allah',
  'سُبْحَانَ ٱللَّٰهِ',
  33,
  'DHIKR',
  ARRAY['daily', 'morning']
);
```

---

## 🔧 Using the API in Code

### Fetch Data
```typescript
import { apiGraphQL } from "app/services/api"

// In your store action
fetchData: flow(function* () {
  const response = yield apiGraphQL.fetchLocations()
  if (response.kind === "ok") {
    console.log(response.data)
  }
})
```

### Direct Supabase Queries
```typescript
import { supabase } from "app/services/supabase"

// Query with filters
const { data, error } = await supabase
  .from("library")
  .select("*")
  .eq("album", "Daily Duas")
  .order("name")

// Insert
const { data, error } = await supabase
  .from("location")
  .insert([{ city: "New York", country: "USA", ... }])

// Update
const { data, error } = await supabase
  .from("data")
  .update({ value: "2" })
  .eq("key", "MIQAAT_VERSION")

// Delete
const { data, error } = await supabase
  .from("tasbeeh")
  .delete()
  .eq("id", 123)
```

---

## 🐛 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| "Invalid API key" | Check `EXPO_PUBLIC_SUPABASE_ANON_KEY` in `.env` |
| "Table does not exist" | Run the schema SQL in Supabase dashboard |
| "Network request failed" | Check `EXPO_PUBLIC_SUPABASE_URL` is correct |
| "No data returned" | Check if tables have data, seed the database |
| App crashes on launch | Check console for errors, verify all env vars set |

---

## 📱 Testing Checklist

Quick test after setup:

- [ ] App launches without errors
- [ ] Can load locations
- [ ] Can select a location
- [ ] Can load library items
- [ ] Can view miqaat dates
- [ ] Can see tasbeeh list
- [ ] Settings persist after restart

---

## 🚀 Next Steps

After basic setup works:

1. **Seed more data** - Add your complete dataset
2. **Enable RLS** - Set up Row Level Security for production
3. **Add authentication** - If your app needs user accounts
4. **Set up storage** - For hosting audio/PDF files
5. **Monitor logs** - Check Supabase dashboard regularly

---

## 📚 Key Files

| File | Purpose |
|------|---------|
| `app/services/supabase/supabase.ts` | Supabase client |
| `app/services/api/api-graphql.ts` | Main API service |
| `app/models/DataStore.ts` | Location & settings |
| `app/models/LibraryStore.ts` | Duas & library |
| `app/models/MiqaatStore.ts` | Islamic dates |
| `app/models/TasbeehStore.ts` | Prayer beads |

---

## 🔗 Important Links

- **Supabase Dashboard**: [app.supabase.com](https://app.supabase.com)
- **Table Editor**: Dashboard → Table Editor
- **SQL Editor**: Dashboard → SQL Editor
- **API Docs**: Dashboard → API Docs
- **Logs**: Dashboard → Logs

---

## 💡 Pro Tips

1. **Use Table Editor** for quick data edits
2. **SQL Editor** has a query history
3. **Enable RLS** before going to production
4. **Backup regularly** - Settings → Database → Backups
5. **Monitor usage** - Settings → Usage
6. **Test with real data** as early as possible

---

**Need more details?** Check `SUPABASE_SETUP.md` for comprehensive guide.

**Stuck?** See `MIGRATION_SUMMARY.md` for troubleshooting.

**Ready to deploy?** Use `SUPABASE_CHECKLIST.md` for complete checklist.

