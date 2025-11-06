# Documentation

Welcome to the MyBohra App documentation! This folder contains all setup guides, migration docs, and technical documentation.

## 📚 Quick Links

### Getting Started
- **[Quick Start Guide](SUPABASE_QUICK_START.md)** - Get up and running in 15 minutes ⚡
- **[Setup Checklist](SUPABASE_CHECKLIST.md)** - Complete step-by-step checklist
- **[Environment Setup](ENV_SETUP.md)** - Configure your development environment

### Supabase & Database
- **[Supabase Setup Guide](SUPABASE_SETUP.md)** - Comprehensive Supabase setup (15+ sections)
- **[Migration Summary](MIGRATION_SUMMARY.md)** - Overview of the Supabase migration
- **[Architecture](ARCHITECTURE.md)** - Technical architecture and design decisions
- **[GraphQL Removal](GRAPHQL_REMOVAL.md)** - Why we're using PostgREST, not GraphQL
- **[Supabase Fetcher](SUPABASE_FETCHER.md)** - Supabase data fetching service
- **Database Schema**: `../app/database/database.sql`

### Firebase Analytics
- **[Firebase Setup](FIREBASE_SETUP.md)** - Firebase Analytics configuration
- **[Analytics Cleanup](ANALYTICS_CLEANUP.md)** - Manual analytics removal details

### Development
- **[Analytics Cleanup](ANALYTICS_CLEANUP.md)** - Analytics architecture changes

## 🚀 Where to Start?

### New to the project?
1. Read [ENV_SETUP.md](ENV_SETUP.md) for environment configuration
2. Follow [SUPABASE_QUICK_START.md](SUPABASE_QUICK_START.md) for database setup
3. Use [SUPABASE_CHECKLIST.md](SUPABASE_CHECKLIST.md) to verify everything works

### Migrating from old API?
1. Start with [MIGRATION_SUMMARY.md](MIGRATION_SUMMARY.md) - understand what changed
2. Follow [SUPABASE_SETUP.md](SUPABASE_SETUP.md) - detailed setup instructions
3. Use [SUPABASE_CHECKLIST.md](SUPABASE_CHECKLIST.md) - ensure nothing is missed

### Need Firebase?
1. [FIREBASE_SETUP.md](FIREBASE_SETUP.md) - Initial setup
2. [FIREBASE_VERIFICATION.md](FIREBASE_VERIFICATION.md) - Test your setup
3. [FIREBASE_DASHBOARD_TROUBLESHOOTING.md](FIREBASE_DASHBOARD_TROUBLESHOOTING.md) - Fix issues

## 📖 Documentation Structure

```
docs/
├── README.md                              # This file - documentation overview
│
├── Supabase Documentation
│   ├── SUPABASE_QUICK_START.md           # 15-minute quick start guide
│   ├── SUPABASE_SETUP.md                  # Comprehensive setup guide
│   ├── SUPABASE_CHECKLIST.md             # Step-by-step checklist
│   └── MIGRATION_SUMMARY.md               # Migration details & changes
│
├── Environment & Setup
│   ├── ENV_SETUP.md                       # Environment configuration
│   └── ACTION_LOGGER_SETUP.md            # Action logging setup
│
├── Firebase Documentation
│   ├── FIREBASE_SETUP.md                  # Firebase setup guide
│   ├── FIREBASE_VERIFICATION.md          # Verification steps
│   └── FIREBASE_DASHBOARD_TROUBLESHOOTING.md  # Troubleshooting
│
└── Testing
    └── test-events.md                     # Test documentation
```

## 🔗 External Resources

### Supabase
- [Supabase Dashboard](https://app.supabase.com)
- [Supabase Documentation](https://supabase.com/docs)
- [Supabase React Native Guide](https://supabase.com/docs/guides/getting-started/tutorials/with-react-native)
- [Supabase Discord](https://discord.supabase.com)

### Firebase
- [Firebase Console](https://console.firebase.google.com)
- [Firebase Documentation](https://firebase.google.com/docs)

### Expo & React Native
- [Expo Documentation](https://docs.expo.dev)
- [React Native Documentation](https://reactnative.dev/docs/getting-started)

## 📝 Contributing to Documentation

When adding new documentation:

1. **Create MD files in this `docs/` folder**
2. **Use descriptive names** - e.g., `FEATURE_NAME_SETUP.md`
3. **Update this README** - Add your doc to the relevant section
4. **Follow the format** - Use clear headings, examples, and links
5. **Include troubleshooting** - Add common issues and solutions

### Documentation Template

```markdown
# Feature Name

Brief description of what this is about.

## Overview
What problem does this solve?

## Prerequisites
- What's needed before starting

## Setup Steps
1. Step one
2. Step two

## Usage
How to use this feature

## Troubleshooting
Common issues and solutions

## Additional Resources
Links to more info
```

## 🆘 Need Help?

- Check the relevant guide in this folder
- Look for troubleshooting sections
- Check console logs for detailed errors
- Review the Supabase/Firebase dashboard logs

## 📅 Last Updated

This documentation was last updated during the Supabase migration.

---

**Note**: Always refer to the most recent version of these docs. If you find outdated information, please update it!

