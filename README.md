# MyBohra App

A React Native Expo application for the Bohra community, built with Ignite boilerplate, featuring Islamic calendar (Miqaat), prayer times, duas, tasbeeh counter, and more.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Yarn package manager
- Expo CLI
- iOS Simulator / Android Emulator

### Installation

```bash
# Install dependencies
yarn install

# Start development server
yarn start

# Run on iOS
yarn ios

# Run on Android
yarn android
```

### Environment Setup

1. Copy the example environment file:
   ```bash
   cp env.example .env
   ```

2. Configure your credentials in `.env`:
   - Supabase URL and API keys
   - Firebase credentials (for analytics)
   - Other app configuration

For detailed setup instructions, see **[docs/ENV_SETUP.md](docs/ENV_SETUP.md)**

## 📚 Documentation

All project documentation is located in the **[docs/](docs/)** folder:

### Getting Started
- **[Quick Start Guide](docs/SUPABASE_QUICK_START.md)** - Get up and running in 15 minutes
- **[Environment Setup](docs/ENV_SETUP.md)** - Configure your development environment
- **[Setup Checklist](docs/SUPABASE_CHECKLIST.md)** - Complete setup verification

### Backend & Database
- **[Supabase Setup Guide](docs/SUPABASE_SETUP.md)** - Comprehensive database setup
- **[Migration Summary](docs/MIGRATION_SUMMARY.md)** - Understanding the Supabase migration
- **[Firebase Setup](docs/FIREBASE_SETUP.md)** - Analytics and monitoring setup

### Development
- **[Action Logger Setup](docs/ACTION_LOGGER_SETUP.md)** - Configure action logging
- **[Test Events](docs/test-events.md)** - Testing documentation

👉 **See [docs/README.md](docs/README.md) for complete documentation index**

## 🏗️ Tech Stack

- **Framework**: React Native + Expo
- **State Management**: MobX State Tree
- **Navigation**: React Navigation
- **Database**: Supabase (PostgreSQL)
- **API**: GraphQL + PostgREST
- **Analytics**: Firebase Analytics
- **Styling**: NativeWind (Tailwind CSS)
- **Language**: TypeScript

## 📁 Project Structure

```
mybohra-app/
├── app/                          # Application source code
│   ├── components/              # Reusable UI components
│   ├── screens/                 # Screen components
│   ├── models/                  # MobX State Tree models
│   ├── services/               # API and external services
│   │   ├── api/                # API service layer
│   │   ├── supabase/          # Supabase client & types
│   │   └── graphql/           # GraphQL queries & Apollo
│   ├── navigators/            # Navigation configuration
│   ├── theme/                 # Colors, typography, spacing
│   ├── utils/                 # Helper functions
│   ├── i18n/                  # Internationalization
│   └── database/              # Database schema
├── docs/                      # 📚 All documentation
├── assets/                    # Images, fonts, icons
├── test/                      # Test files and setup
└── ...config files
```

## 🎯 Features

- **📅 Miqaat Calendar** - View important Islamic dates and events
- **🕌 Prayer Times** - Accurate prayer times based on location
- **📖 Library** - Collection of duas and religious texts
- **📿 Tasbeeh Counter** - Digital prayer bead counter
- **📍 Location Services** - Auto-detect or manually select location
- **🔔 Reminders** - Prayer time notifications
- **📱 Offline Support** - Works without internet connection
- **🌍 Multi-language** - Support for multiple languages

## 🛠️ Development

### Available Scripts

```bash
# Development
yarn start              # Start Expo development server
yarn ios                # Run on iOS simulator
yarn android            # Run on Android emulator
yarn web                # Run in web browser

# Code Quality
yarn lint               # Run ESLint
yarn lint:fix           # Fix linting issues
yarn format             # Format code with Prettier
yarn compile            # TypeScript type checking

# Testing
yarn test               # Run all tests
yarn test:watch         # Run tests in watch mode
yarn test:coverage      # Generate coverage report
yarn test:unit          # Run unit tests only
yarn test:integration   # Run integration tests only

# Build
yarn build:ios:dev      # Build iOS development
yarn build:android:dev  # Build Android development
yarn build:ios:prod     # Build iOS production
yarn build:android:prod # Build Android production
```

### Database Schema

The database schema is defined in `app/database/database.sql` and includes:
- **data** - Configuration and version management
- **location** - Cities and coordinates
- **library** - Duas and religious content
- **miqaat** - Islamic calendar dates
- **tasbeeh** - Prayer beads collection
- **user** - User profiles

## 🔐 Environment Variables

Required environment variables (see `.env.example`):

```env
# Supabase
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
EXPO_PUBLIC_SUPABASE_SERVICE_ROLE_KEY=

# Firebase (Analytics)
EXPO_PUBLIC_FIREBASE_API_KEY=
EXPO_PUBLIC_FIREBASE_PROJECT_ID=
EXPO_PUBLIC_FIREBASE_APP_ID=
# ... (see env.example for complete list)

# App Configuration
EXPO_PUBLIC_APP_NAME=My Bohra
EXPO_PUBLIC_APP_VERSION=1.0.0
EXPO_PUBLIC_DEBUG_MODE=true
```

## 🧪 Testing

```bash
# Run all tests
yarn test

# Run specific test suites
yarn test:models      # Test MobX models
yarn test:helpers     # Test helper functions
yarn test:utils       # Test utility functions
yarn test:components  # Test React components

# Coverage report
yarn test:coverage
```

## 🚢 Deployment

### iOS Deployment

```bash
# Build for development device
yarn build:ios:dev

# Build for production
yarn build:ios:prod
```

### Android Deployment

```bash
# Build for development device
yarn build:android:dev

# Build for production
yarn build:android:prod
```

For detailed deployment instructions, refer to the [Expo documentation](https://docs.expo.dev/build/introduction/).

## 📱 Supported Platforms

- ✅ iOS 13.0+
- ✅ Android 6.0+ (API 23+)
- 🚧 Web (limited support)

## 🤝 Contributing

1. Create a feature branch from `main`
2. Make your changes
3. Ensure tests pass: `yarn test`
4. Ensure no linting errors: `yarn lint`
5. Create a pull request

### Code Style

- Follow the existing code style
- Use TypeScript for all new files
- Write tests for new features
- Update documentation as needed
- Document all new MD files in `docs/` folder

## 📝 License

[Add your license here]

## 🆘 Support

For setup help and troubleshooting:
1. Check the [docs/](docs/) folder for relevant guides
2. Review console logs for error messages
3. Check Supabase dashboard for API issues
4. Verify environment variables are set correctly

## 🔗 Useful Links

- [Expo Documentation](https://docs.expo.dev)
- [React Native Documentation](https://reactnative.dev)
- [Supabase Documentation](https://supabase.com/docs)
- [MobX State Tree](https://mobx-state-tree.js.org)
- [React Navigation](https://reactnavigation.org)

## 📞 Contact

[Add your contact information here]

---

**Built with ❤️ for the Bohra community**

**Latest Update**: Migrated to Supabase backend - See [docs/MIGRATION_SUMMARY.md](docs/MIGRATION_SUMMARY.md)
