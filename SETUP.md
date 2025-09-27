# Anime & TV Series Tracker - Complete Setup Guide

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Project Structure](#project-structure)
3. [Firebase Setup](#firebase-setup)
4. [React Native Environment Setup](#react-native-environment-setup)
5. [Project Installation](#project-installation)
6. [Configuration](#configuration)
7. [Running the App](#running-the-app)
8. [Troubleshooting](#troubleshooting)

## Prerequisites

Before you begin, ensure you have the following installed on your development machine:

### Required Software
- **Node.js** (version 16.0 or higher)
- **npm** or **yarn** package manager
- **React Native CLI** (`npm install -g @react-native-community/cli`)
- **Android Studio** (for Android development)
- **Xcode** (for iOS development, macOS only)
- **Git** (for version control)

### Development Environment
- **macOS**: Required for iOS development
- **Windows/Linux**: Can be used for Android development only
- **Java Development Kit (JDK)** version 11 or higher

### Firebase Account
- A Google account to access Firebase Console
- Basic understanding of Firebase services (Authentication, Firestore, Cloud Messaging)

## Project Structure

The project follows a well-organized structure for maintainability and scalability:

```
AnimeSeriesTracker/
├── src/
│   ├── api/                    # API integration files
│   │   ├── contentApi.js       # Unified content API
│   │   ├── jikanApi.js         # Jikan API for anime
│   │   └── tvMazeApi.js        # TVMaze API for TV series
│   ├── components/             # Reusable UI components
│   │   ├── AnimatedCard.js     # Enhanced card component
│   │   ├── GradientBackground.js # Gradient backgrounds
│   │   └── LoadingSpinner.js   # Loading indicators
│   ├── config/                 # Configuration files
│   │   └── firebase.js         # Firebase configuration
│   ├── context/                # React Context providers
│   │   ├── AuthContext.js      # Authentication state
│   │   └── ThemeContext.js     # Theme management
│   ├── navigation/             # Navigation configuration
│   │   ├── AppNavigator.js     # Main app navigator
│   │   ├── AuthNavigator.js    # Authentication flow
│   │   ├── MainNavigator.js    # Main app tabs
│   │   └── [other navigators]  # Feature-specific navigators
│   ├── screens/                # Screen components
│   │   ├── auth/               # Authentication screens
│   │   ├── HomeScreen.js       # Main dashboard
│   │   ├── WatchlistScreen.js  # Watchlist management
│   │   ├── SearchScreen.js     # Content search
│   │   ├── CommunityScreen.js  # Community features
│   │   ├── ProfileScreen.js    # User profile
│   │   └── [other screens]     # Additional screens
│   ├── services/               # Business logic services
│   │   ├── authService.js      # Authentication service
│   │   ├── databaseService.js  # Database operations
│   │   └── notificationService.js # Push notifications
│   ├── styles/                 # Styling utilities
│   │   ├── themes.js           # Theme definitions
│   │   └── responsive.js       # Responsive design helpers
│   ├── utils/                  # Utility functions
│   │   └── animations.js       # Animation helpers
│   └── App.js                  # Main app component
├── android/                    # Android-specific files
├── ios/                        # iOS-specific files
├── package.json                # Dependencies and scripts
└── README.md                   # Project overview
```

## Firebase Setup

### Step 1: Create Firebase Project

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter project name: `anime-series-tracker`
4. Enable Google Analytics (recommended)
5. Choose or create a Google Analytics account
6. Click "Create project"

### Step 2: Enable Authentication

1. In the Firebase Console, navigate to "Authentication"
2. Click "Get started"
3. Go to the "Sign-in method" tab
4. Enable the following providers:
   - **Email/Password**: Click and toggle "Enable"
   - **Google** (optional): Click, toggle "Enable", and configure

### Step 3: Create Firestore Database

1. Navigate to "Firestore Database"
2. Click "Create database"
3. Choose "Start in test mode" (we'll secure it later)
4. Select a location closest to your users
5. Click "Done"

### Step 4: Set Up Security Rules

Replace the default Firestore rules with the following:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read and write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Watchlist items belong to users
    match /watchlist/{userId}/items/{itemId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Clubs are publicly readable, but only members can write
    match /clubs/{clubId} {
      allow read: if true;
      allow write: if request.auth != null;
      
      match /members/{userId} {
        allow read: if true;
        allow write: if request.auth != null;
      }
      
      match /discussions/{discussionId} {
        allow read: if true;
        allow write: if request.auth != null;
      }
    }
    
    // Notifications are private to users
    match /notifications/{userId}/items/{notificationId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### Step 5: Configure App Registration

#### For Android:
1. Click "Add app" and select Android
2. Enter package name: `com.animeseriestracker`
3. Enter app nickname: `Anime Series Tracker`
4. Download `google-services.json`
5. Place the file in `android/app/` directory

#### For iOS:
1. Click "Add app" and select iOS
2. Enter bundle ID: `com.animeseriestracker`
3. Enter app nickname: `Anime Series Tracker`
4. Download `GoogleService-Info.plist`
5. Add the file to your iOS project in Xcode

### Step 6: Enable Cloud Messaging (Optional)

1. Navigate to "Cloud Messaging"
2. Generate server key for push notifications
3. Save the server key for later configuration

## React Native Environment Setup

### Android Setup

1. **Install Android Studio**:
   - Download from [developer.android.com](https://developer.android.com/studio)
   - Install with default settings
   - Open Android Studio and install SDK components

2. **Configure Environment Variables**:
   Add to your shell profile (`.bashrc`, `.zshrc`, etc.):
   ```bash
   export ANDROID_HOME=$HOME/Library/Android/sdk
   export PATH=$PATH:$ANDROID_HOME/emulator
   export PATH=$PATH:$ANDROID_HOME/tools
   export PATH=$PATH:$ANDROID_HOME/tools/bin
   export PATH=$PATH:$ANDROID_HOME/platform-tools
   ```

3. **Create Virtual Device**:
   - Open Android Studio
   - Go to Tools → AVD Manager
   - Create a new virtual device (recommended: Pixel 4 with API 30+)

### iOS Setup (macOS only)

1. **Install Xcode**:
   - Download from Mac App Store
   - Install Xcode Command Line Tools: `xcode-select --install`

2. **Install CocoaPods**:
   ```bash
   sudo gem install cocoapods
   ```

3. **Configure iOS Simulator**:
   - Open Xcode
   - Go to Xcode → Preferences → Components
   - Download desired iOS simulators

## Project Installation

### Step 1: Clone or Create Project

Since you mentioned you already ran the init command:
```bash
cd AnimeSeriesTracker
```

### Step 2: Install Dependencies

```bash
npm install
```

Or if using yarn:
```bash
yarn install
```

### Step 3: Install iOS Dependencies (macOS only)

```bash
cd ios && pod install && cd ..
```

### Step 4: Install Required Packages

The project requires several additional packages. Install them using:

```bash
npm install @react-navigation/native @react-navigation/stack @react-navigation/bottom-tabs @react-navigation/drawer
npm install react-native-screens react-native-safe-area-context
npm install @react-native-firebase/app @react-native-firebase/auth @react-native-firebase/firestore @react-native-firebase/messaging
npm install react-native-paper react-native-vector-icons
npm install react-native-fast-image react-native-linear-gradient
npm install react-native-chart-kit react-native-svg
npm install @react-native-async-storage/async-storage
npm install react-native-push-notification
```

### Step 5: Link Native Dependencies

For React Native 0.60+, most packages auto-link. However, some may require manual linking:

#### Android Configuration

Add to `android/app/build.gradle`:
```gradle
dependencies {
    implementation project(':react-native-vector-icons')
    // ... other dependencies
}
```

Add to `android/settings.gradle`:
```gradle
include ':react-native-vector-icons'
project(':react-native-vector-icons').projectDir = new File(rootProject.projectDir, '../node_modules/react-native-vector-icons/android')
```

#### iOS Configuration

Most packages will be automatically linked through CocoaPods. Run:
```bash
cd ios && pod install && cd ..
```

## Configuration

### Step 1: Firebase Configuration

Create `src/config/firebase.js` with your Firebase configuration:

```javascript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getMessaging } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const messaging = getMessaging(app);

export default app;
```

### Step 2: Environment Variables

Create `.env` file in the root directory:
```
FIREBASE_API_KEY=your-firebase-api-key
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your-sender-id
FIREBASE_APP_ID=your-app-id
JIKAN_API_BASE_URL=https://api.jikan.moe/v4
TVMAZE_API_BASE_URL=https://api.tvmaze.com
```

### Step 3: Icon Configuration

Copy icon files to appropriate directories:
- Android: `android/app/src/main/res/drawable-*/`
- iOS: Add to Xcode project

### Step 4: Permissions Configuration

#### Android Permissions

Add to `android/app/src/main/AndroidManifest.xml`:
```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
<uses-permission android:name="android.permission.VIBRATE" />
<uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />
```

#### iOS Permissions

Add to `ios/AnimeSeriesTracker/Info.plist`:
```xml
<key>NSAppTransportSecurity</key>
<dict>
    <key>NSAllowsArbitraryLoads</key>
    <true/>
</dict>
```

## Running the App

### Start Metro Bundler

```bash
npx react-native start
```

### Run on Android

In a new terminal:
```bash
npx react-native run-android
```

### Run on iOS (macOS only)

In a new terminal:
```bash
npx react-native run-ios
```

### Alternative iOS Method

Open `ios/AnimeSeriesTracker.xcworkspace` in Xcode and click the Run button.

## Troubleshooting

### Common Issues and Solutions

#### Metro Bundler Issues
```bash
# Clear cache
npx react-native start --reset-cache

# Clean build
cd android && ./gradlew clean && cd ..
```

#### Android Build Issues
```bash
# Clean and rebuild
cd android
./gradlew clean
./gradlew assembleDebug
cd ..
```

#### iOS Build Issues
```bash
# Clean iOS build
cd ios
rm -rf build/
xcodebuild clean
pod install
cd ..
```

#### Firebase Connection Issues
1. Verify `google-services.json` is in `android/app/`
2. Verify `GoogleService-Info.plist` is added to Xcode project
3. Check Firebase configuration in `src/config/firebase.js`

#### Package Installation Issues
```bash
# Delete node_modules and reinstall
rm -rf node_modules
npm install

# For iOS, also reinstall pods
cd ios && rm -rf Pods && pod install && cd ..
```

### Performance Optimization

1. **Enable Hermes** (Android):
   In `android/app/build.gradle`:
   ```gradle
   project.ext.react = [
       enableHermes: true
   ]
   ```

2. **Optimize Images**:
   - Use WebP format for Android
   - Optimize PNG files for iOS
   - Use FastImage for better performance

3. **Bundle Size Optimization**:
   ```bash
   # Analyze bundle size
   npx react-native bundle --platform android --dev false --entry-file index.js --bundle-output android-bundle.js --analyze
   ```

### Development Tips

1. **Hot Reloading**: Shake device or press `Cmd+R` (iOS) / `R+R` (Android)
2. **Debug Menu**: Shake device or press `Cmd+D` (iOS) / `Ctrl+M` (Android)
3. **Remote Debugging**: Enable in debug menu, opens Chrome DevTools
4. **Flipper Integration**: Install Flipper for advanced debugging

### Production Build

#### Android APK
```bash
cd android
./gradlew assembleRelease
```

#### iOS Archive
1. Open Xcode
2. Select "Generic iOS Device"
3. Product → Archive
4. Follow App Store submission process

This completes the setup guide. The app should now be running with full functionality including authentication, watchlist management, community features, and analytics.
