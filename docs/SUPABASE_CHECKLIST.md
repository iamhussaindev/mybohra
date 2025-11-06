# Supabase Setup Checklist

Use this checklist to ensure you've completed all necessary steps for the Supabase migration.

## 🎯 Phase 1: Supabase Project Setup

- [ ] **Create Supabase Account**
  - Go to [https://supabase.com](https://supabase.com)
  - Sign up or log in with GitHub/Google

- [ ] **Create New Project**
  - Click "New Project"
  - Choose organization
  - Enter project name: "MyBohra App" (or your preferred name)
  - Choose a strong database password (save it securely!)
  - Select region closest to your users
  - Click "Create new project"
  - Wait 2-3 minutes for project initialization

- [ ] **Save Project Credentials**
  - Go to Settings → API
  - Copy and save:
    - [ ] Project URL (e.g., `https://xxxxx.supabase.co`)
    - [ ] `anon` public key
    - [ ] `service_role` secret key (keep this secret!)

## 🗄️ Phase 2: Database Setup

- [ ] **Create Database Schema**
  - Go to SQL Editor in Supabase dashboard
  - Copy contents from `app/database/database.sql`
  - Paste into SQL Editor
  - Click "Run" to execute
  - Verify all tables are created (check Table Editor)

- [ ] **Verify Tables Created**
  - [ ] `data` table exists
  - [ ] `location` table exists
  - [ ] `library` table exists
  - [ ] `daily_duas` table exists
  - [ ] `miqaat` table exists
  - [ ] `miqaat_library` table exists
  - [ ] `tasbeeh` table exists
  - [ ] `user` table exists

- [ ] **Add Version Data**

  ```sql
  INSERT INTO data (key, value) VALUES
    ('LOCATION', '1'),
    ('MIQAAT', '1'),
    ('TASBEEH', '1'),
    ('DUA_LIST', '1'),
    ('QIYAM', 'Default value');
  ```

- [ ] **Seed Initial Data**
  - [ ] Add locations data
  - [ ] Add library/dua items
  - [ ] Add miqaat dates
  - [ ] Add tasbeeh items
  - [ ] Add daily duas mappings

## 🔧 Phase 3: App Configuration

- [ ] **Create Environment File**
  - Copy `env.example` to `.env`
  - Fill in Supabase credentials:

    ```env
    EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
    EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
    EXPO_PUBLIC_SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
    ```

  - Verify `.env` is in `.gitignore`

- [ ] **Verify Config Files**
  - Check `app/config/config.dev.ts` has Supabase config
  - Check `app/config/config.prod.ts` has Supabase config

- [ ] **Install Dependencies**

  ```bash
  yarn install
  ```

## 🧪 Phase 4: Testing

- [ ] **Start Development Server**

  ```bash
  yarn start
  ```

- [ ] **Test Basic Connection**
  - Open app on device/simulator
  - Check console for connection errors
  - Verify no API errors in logs

- [ ] **Test Location Features**
  - [ ] Load locations list
  - [ ] Select a location manually
  - [ ] Use auto-detect location (if you have location permissions)
  - [ ] Check location is persisted after app restart

- [ ] **Test Library/Dua Features**
  - [ ] Load all library items
  - [ ] Load daily duas
  - [ ] Open and read a dua
  - [ ] Play audio (if available)
  - [ ] Open PDF (if available)
  - [ ] Pin/unpin items

- [ ] **Test Miqaat Features**
  - [ ] Load miqaat calendar
  - [ ] View today's miqaats
  - [ ] View upcoming miqaats
  - [ ] Navigate through months

- [ ] **Test Tasbeeh Features**
  - [ ] Load tasbeeh list
  - [ ] Select a tasbeeh
  - [ ] Increment counter
  - [ ] Check counter persists

- [ ] **Test Settings**
  - [ ] Change reminder settings
  - [ ] Verify settings are saved
  - [ ] Check settings persist after app restart

## 🔒 Phase 5: Security (Production)

- [ ] **Enable Row Level Security**

  ```sql
  -- Enable RLS on all tables
  ALTER TABLE data ENABLE ROW LEVEL SECURITY;
  ALTER TABLE location ENABLE ROW LEVEL SECURITY;
  ALTER TABLE library ENABLE ROW LEVEL SECURITY;
  ALTER TABLE daily_duas ENABLE ROW LEVEL SECURITY;
  ALTER TABLE miqaat ENABLE ROW LEVEL SECURITY;
  ALTER TABLE miqaat_library ENABLE ROW LEVEL SECURITY;
  ALTER TABLE tasbeeh ENABLE ROW LEVEL SECURITY;
  ALTER TABLE user ENABLE ROW LEVEL SECURITY;
  ```

- [ ] **Create RLS Policies**

  ```sql
  -- Example: Allow public read access to library
  CREATE POLICY "Allow public read access"
    ON library
    FOR SELECT
    TO public
    USING (true);
  
  -- Repeat for other tables as needed
  ```

- [ ] **Set Up Authentication** (if needed)
  - Go to Authentication → Providers
  - Enable providers (Email, Google, Apple, etc.)
  - Configure redirect URLs

- [ ] **Configure Storage** (if needed)
  - Go to Storage
  - Create buckets for audio/PDF files
  - Set up storage policies

## 📱 Phase 6: Production Deployment

- [ ] **Create Production Supabase Project**
  - Create separate project for production
  - Use same database schema
  - Seed with production data

- [ ] **Update Production Config**
  - Update `app/config/config.prod.ts` with production Supabase URL
  - Set up production environment variables in build system

- [ ] **Test Production Build**
  - Create production build
  - Test all features thoroughly
  - Monitor Supabase logs for errors

- [ ] **Set Up Monitoring**
  - Enable Supabase project monitoring
  - Set up alerts for critical issues
  - Configure backup policies

## 🔄 Phase 7: Data Migration (if applicable)

- [ ] **Export Old Data**
  - Export all data from old API/database
  - Format data to match new schema

- [ ] **Import to Supabase**
  - Use SQL INSERT statements
  - Or use Supabase dashboard CSV import
  - Verify all data imported correctly

- [ ] **Verify Data Integrity**
  - Check row counts
  - Spot-check random records
  - Test relationships (foreign keys)

## ✅ Final Checks

- [ ] All API calls working correctly
- [ ] No errors in console/logs
- [ ] Data persisting correctly
- [ ] App performance is good
- [ ] Offline caching works
- [ ] Version checking works
- [ ] All features tested on iOS
- [ ] All features tested on Android
- [ ] Documentation reviewed
- [ ] Team trained on new setup

## 📚 Documentation

- [ ] Read `SUPABASE_SETUP.md`
- [ ] Read `MIGRATION_SUMMARY.md`
- [ ] Review Supabase dashboard
- [ ] Bookmark important links:
  - [ ] [Supabase Dashboard](https://app.supabase.com)
  - [ ] [Supabase Docs](https://supabase.com/docs)
  - [ ] [API Reference](https://supabase.com/docs/reference/javascript/introduction)

## 🆘 Troubleshooting

If you encounter issues, check:

1. ✅ Environment variables are set correctly
2. ✅ Supabase project is running (not paused)
3. ✅ Database tables are created
4. ✅ API keys are correct
5. ✅ Network connection is working
6. ✅ Console logs for detailed errors

## 📞 Need Help?

- Supabase Discord: [https://discord.supabase.com](https://discord.supabase.com)
- Supabase GitHub: [https://github.com/supabase/supabase](https://github.com/supabase/supabase)
- Stack Overflow: Tag with `supabase`

---

**Start Date**: ___________
**Completed Date**: ___________
**Completed By**: ___________
