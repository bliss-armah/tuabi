# Tuabi Frontend - React Native App

A modern debt management mobile application built with React Native, Expo, and TypeScript.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Expo CLI: `npm install -g @expo/cli`
- iOS Simulator (for iOS development)
- Android Studio (for Android development)

### Installation

```bash
cd client
npm install
```

### Development

```bash
# Start development server
npm start

# Run on specific platforms
npm run ios          # iOS simulator
npm run android      # Android emulator
npm run web          # Web browser
```

## 📱 Features

### Core Features

- **Debtor Management**: Add, edit, and track debtors
- **Payment Tracking**: Record payments and debt additions
- **Dashboard**: Overview of debt portfolio and statistics
- **User Authentication**: Secure login/registration system
- **Real-time Updates**: Live data synchronization

### AI-Powered Insights 🤖

- **Portfolio Analysis**: Comprehensive debt portfolio insights
- **Risk Assessment**: Individual debtor risk evaluation
- **Payment Predictions**: AI-powered payment timing predictions
- **Smart Recommendations**: Actionable debt management advice
- **Cash Flow Forecasting**: Future cash inflow predictions

### Subscription Management

- **Payment Integration**: Paystack payment processing
- **Subscription Plans**: Monthly and yearly plans
- **Usage Tracking**: Monitor subscription status

## 🏗️ Project Structure

```
client/
├── app/                    # Expo Router screens
│   ├── (tabs)/            # Tab navigation screens
│   ├── _layout.tsx        # Root layout
│   ├── login.tsx          # Authentication screens
│   └── index.tsx          # Entry point
├── Features/              # Feature modules
│   ├── Authentication/    # Login/Registration
│   │   ├── AuthAPI.ts     # Authentication API
│   │   ├── Login.tsx      # Login component
│   │   └── types.ts       # Auth types
│   ├── Debtors/          # Debtor management
│   │   ├── DebtorsApi.ts  # Debtor API
│   │   ├── DebtorModal.tsx # Add/Edit debtor
│   │   └── DashboardSummaryCard.tsx
│   ├── AI/               # AI insights
│   │   ├── AIApi.ts       # AI API integration
│   │   └── AIInsightsCard.tsx # AI insights display
│   ├── Subscription/     # Payment management
│   │   ├── SubscriptionAPI.ts
│   │   └── SubscriptionStatus.tsx
│   └── Reminders/        # Notification system
│       ├── RemindersApi.ts
│       └── RemindersList.tsx
├── Shared/               # Shared components & utilities
│   ├── Components/       # Reusable components
│   │   ├── UIKitten/     # UI components
│   │   ├── LoadingView.tsx
│   │   ├── ErrorView.tsx
│   │   └── Navbar.tsx
│   ├── Store/           # Redux store
│   │   └── store.ts
│   ├── Api/             # API configuration
│   │   └── config.ts
│   ├── Constants/       # App constants
│   │   ├── Colors.ts
│   │   └── UIKittenTheme.ts
│   └── Hooks/           # Custom hooks
│       ├── useAuth.ts
│       └── useColorScheme.ts
├── assets/              # Static assets
│   ├── images/
│   └── fonts/
├── app.json             # Expo configuration
├── package.json         # Dependencies
└── tsconfig.json        # TypeScript configuration
```

## 🎨 UI Components

### UIKitten Integration

The app uses UI Kitten for consistent design:

- **Theme System**: Light/dark mode support
- **Component Library**: Pre-built, customizable components
- **Design System**: Consistent spacing, colors, and typography

### Custom Components

- **Card Components**: Reusable card layouts
- **Loading States**: Consistent loading indicators
- **Error Handling**: User-friendly error displays
- **Navigation**: Tab-based navigation system

## 🔧 Development

### Available Scripts

```bash
npm start              # Start Expo development server
npm run ios            # Run on iOS simulator
npm run android        # Run on Android emulator
npm run web            # Run on web browser
npm run build          # Build for production
npm run lint           # Run ESLint
npm run type-check     # Run TypeScript checks
```

### Environment Configuration

Create `.env` file in the client directory:

```bash
# API Configuration
API_BASE_URL=http://localhost:3500
API_TIMEOUT=10000

# Feature Flags
ENABLE_AI_FEATURES=true
ENABLE_PUSH_NOTIFICATIONS=true
```

### State Management

- **Redux Toolkit**: Global state management
- **RTK Query**: API data fetching and caching
- **AsyncStorage**: Local data persistence

### API Integration

```typescript
// Example API usage
import { useGetUserInsightsQuery } from "@/Features/AI/AIApi";

const MyComponent = () => {
  const { data, isLoading, error } = useGetUserInsightsQuery();

  if (isLoading) return <LoadingView />;
  if (error) return <ErrorView error={error} />;

  return <Text>{data?.totalDebtors} debtors</Text>;
};
```

## 📱 Platform Support

### iOS

- **Minimum Version**: iOS 13.0
- **Simulator**: Xcode iOS Simulator
- **Device Testing**: Physical iOS devices

### Android

- **Minimum Version**: Android 6.0 (API 23)
- **Emulator**: Android Studio AVD
- **Device Testing**: Physical Android devices

### Web

- **Browser Support**: Chrome, Firefox, Safari, Edge
- **PWA Features**: Offline support, app-like experience

## 🎯 Testing

### Unit Testing

```bash
npm test               # Run all tests
npm run test:watch     # Run tests in watch mode
npm run test:coverage  # Generate coverage report
```

### E2E Testing

```bash
npm run test:e2e       # Run end-to-end tests
```

### Manual Testing

- **iOS Simulator**: Test on different iPhone/iPad models
- **Android Emulator**: Test on different Android versions
- **Physical Devices**: Test on real devices

## 🚀 Deployment

### Expo Build

```bash
# Install EAS CLI
npm install -g @expo/eas-cli

# Configure EAS
eas build:configure

# Build for platforms
eas build --platform ios
eas build --platform android
```

### App Store Deployment

```bash
# Submit to App Store
eas submit --platform ios

# Submit to Google Play
eas submit --platform android
```

### Web Deployment

```bash
# Build for web
npm run build:web

# Deploy to hosting service
npm run deploy:web
```

## 🔧 Configuration

### Expo Configuration (app.json)

```json
{
  "expo": {
    "name": "Tuabi",
    "slug": "tuabi-app",
    "version": "1.0.0",
    "platforms": ["ios", "android", "web"],
    "icon": "./assets/icon.png",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "updates": {
      "fallbackToCacheTimeout": 0
    },
    "assetBundlePatterns": ["**/*"],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.tuabi.app"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#FFFFFF"
      },
      "package": "com.tuabi.app"
    }
  }
}
```

## 🐛 Troubleshooting

### Common Issues

**Metro Bundler Issues**

```bash
# Clear cache
npm start -- --clear

# Reset Metro
npx react-native start --reset-cache
```

**iOS Build Issues**

```bash
# Clean iOS build
cd ios && xcodebuild clean
cd .. && npm run ios
```

**Android Build Issues**

```bash
# Clean Android build
cd android && ./gradlew clean
cd .. && npm run android
```

**Dependencies Issues**

```bash
# Clear all caches
rm -rf node_modules
rm -rf package-lock.json
npm install
```

### Debug Mode

```bash
# Enable debug logging
DEBUG=* npm start

# Enable React DevTools
npm install -g react-devtools
react-devtools
```

## 📊 Performance

### Optimization Tips

- **Image Optimization**: Use appropriate image formats and sizes
- **Bundle Size**: Monitor and optimize bundle size
- **Memory Management**: Properly dispose of resources
- **Network Requests**: Implement caching and retry logic

### Monitoring

- **Performance Metrics**: Track app performance
- **Crash Reporting**: Monitor app crashes
- **User Analytics**: Track user behavior
- **Error Tracking**: Monitor and fix errors

## 🤝 Contributing

### Code Style

- **TypeScript**: Use TypeScript for type safety
- **ESLint**: Follow ESLint configuration
- **Prettier**: Use Prettier for code formatting
- **Conventional Commits**: Use conventional commit messages

### Development Workflow

1. Create feature branch
2. Make changes with tests
3. Run linting and tests
4. Submit pull request
5. Code review and merge

---

**Built with React Native, Expo, and TypeScript** 🚀
