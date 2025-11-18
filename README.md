# Cupper App

Coffee Cupping & Tasting Tracker - A mobile app for professional coffee tasting sessions.

## 🚀 Technology Stack

- **Framework**: Expo (React Native)
- **Language**: TypeScript (strict mode)
- **State Management**: Zustand with persist middleware
- **Database**: expo-sqlite
- **Navigation**: React Navigation (bottom tabs + stack)
- **Animations**: Reanimated 3.6+ & Gesture Handler 2.14+
- **Graphics**: react-native-svg
- **Storage**: react-native-mmkv

## 📦 Project Structure

```
cupper-app/
├── src/
│   ├── components/       # Reusable UI components
│   ├── screens/          # Full-screen views
│   ├── navigation/       # Navigation setup
│   ├── services/         # Business logic layer
│   ├── stores/           # Zustand state management
│   ├── types/            # TypeScript definitions
│   ├── utils/            # Helper functions
│   ├── hooks/            # Custom React hooks
│   └── theme/            # Design system
├── assets/               # Images, fonts, data
└── __tests__/            # Test files
```

## 🛠️ Development

```bash
# Install dependencies
npm install

# Start development server
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android

# Type checking
npm run type-check

# Linting
npm run lint
```

## ✅ Setup Completed

- [x] Expo project initialization
- [x] TypeScript configuration (strict mode)
- [x] ESLint + Prettier setup
- [x] Reanimated 3.6+ plugin configured
- [x] Complete folder structure
- [x] All core dependencies installed

## 📱 App Configuration

- **Orientation**: Portrait only
- **Theme**: Dark mode
- **Platform**: iOS & Android

## 🔜 Next Steps

- Theme system & design tokens
- Database setup & migrations
- Flavor service & data import
- Navigation structure
- UI components

---

Built with ❤️ for coffee enthusiasts