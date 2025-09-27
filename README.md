# Anime & TV Series Tracker Mobile App

## Project Overview

This mobile application allows users to track their watchlists for anime and TV series, monitor their progress, and engage with other fans through community features. It aims to provide an intuitive, mobile-friendly, and responsive user experience with AI-powered recommendations.

## Core Features

- **Menu Categories**: Organize shows into 'All', 'Watching', 'Completed', 'On Hold', 'Dropped', and 'Plan to Watch'.
- **Progress Tracking**: Log watched episodes and view remaining ones.
- **Custom Clubs & Discussions**: Create and join clubs, participate in discussions.
- **Spoiler Protection**: Hide or reveal spoilers in discussions.
- **Polls & Ratings**: Vote on episodes, characters, and storylines.
- **User Reviews & Comments**: Rate and review shows.
- **Episode & Season Reminders**: Notifications for upcoming episodes.
- **Streaming Integration**: Direct access to streaming platforms.
- **Offline Watchlist & Notes**: Save shows and notes without internet.
- **Watchlist Sharing**: Share viewing lists with friends.
- **Dark & Light Mode**: Customizable themes.
- **Tags & Filters**: Filter shows by genre, language, release year.
- **Mobile Performance Optimization**: Smooth and lag-free experience.
- **Push Notifications**: Reminders for new episodes, discussions, and updates.
- **Analytics Dashboard**: Graphs displaying viewing history and total time spent.

## Technologies Used

- **Frontend**: React Native
- **Backend**: Firebase (Authentication, Firestore Database)
- **APIs**: Jikan API (for Anime), TVMaze API (for TV Series)

## Project Structure

```
AnimeSeriesTracker/
├── android/
├── ios/
├── node_modules/
├── src/
│   ├── api/             # API service integrations (Jikan, TVMaze)
│   ├── assets/          # Images, fonts, and other static assets
│   ├── components/      # Reusable UI components
│   ├── config/          # Firebase configuration, API keys
│   ├── context/         # React Context for global state management
│   ├── navigation/      # React Navigation setup
│   ├── screens/         # Individual screens/pages of the app
│   ├── services/        # Firebase services, utility functions
│   ├── styles/          # Global styles and theme definitions
│   └── App.js           # Main application entry point
├── .gitignore
├── app.json
├── babel.config.js
├── index.js
├── package.json
├── yarn.lock
├── README.md
```

## Setup Instructions

To get this project up and running on your local machine, follow these steps:

### Prerequisites

Make sure you have the following installed:

- Node.js (LTS version recommended)
- npm or Yarn
- React Native development environment set up (refer to the official React Native documentation for detailed instructions: [https://reactnative.dev/docs/environment-setup](https://reactnative.dev/docs/environment-setup))
- A Firebase project (you will create this in the next steps)

### Step 1: Clone the Repository (Not applicable as you've already initialized the project)

Since you've already run `npx @react-native-community/cli init AnimeSeriesTracker`, you should have the basic project structure. We will be adding files to this existing structure.

### Step 2: Install Dependencies

Navigate to your project directory (`AnimeSeriesTracker`) in the terminal and install the necessary Node.js packages:

```bash
npm install
# or if you use yarn
yarn install
```

### Step 3: Firebase Project Setup (Detailed in Phase 2)

You will need to create a Firebase project and configure it for your React Native application. This involves:

1. Creating a new project in the Firebase Console.
2. Setting up Firebase Authentication (Email/Password, Google, etc.).
3. Setting up Firestore Database.
4. Obtaining your Firebase configuration details.

Detailed instructions will be provided in Phase 2.

### Step 4: API Keys (Detailed in Phase 4)

You will need API keys for Jikan API and TVMaze API. Instructions on how to obtain these will be provided in Phase 4.

### Step 5: Running the Application

Once all configurations are done, you can run the application on an emulator or a physical device:

With Metro running, open a new terminal window/pane from the root of your React Native project, and use one of the following commands to build and run your Android or iOS app:

### Android

```sh
# Using npm
npm run android

# OR using Yarn
yarn android
```

### iOS

For iOS, remember to install CocoaPods dependencies (this only needs to be run on first clone or after updating native deps).

The first time you create a new project, run the Ruby bundler to install CocoaPods itself:

```sh
bundle install
```

Then, and every time you update your native dependencies, run:

```sh
bundle exec pod install
```

For more information, please visit [CocoaPods Getting Started guide](https://guides.cocoapods.org/using/getting-started.html).

```sh
# Using npm
npm run ios

# OR using Yarn
yarn ios
```

If everything is set up correctly, you should see your new app running in the Android Emulator, iOS Simulator, or your connected device.

This is one way to run your app — you can also build it directly from Android Studio or Xcode.

### Step 6: Modify your app

Now that you have successfully run the app, let's make changes!

Open `App.tsx` in your text editor of choice and make some changes. When you save, your app will automatically update and reflect these changes — this is powered by [Fast Refresh](https://reactnative.dev/docs/fast-refresh).

When you want to forcefully reload, for example to reset the state of your app, you can perform a full reload:

- **Android**: Press the <kbd>R</kbd> key twice or select **"Reload"** from the **Dev Menu**, accessed via <kbd>Ctrl</kbd> + <kbd>M</kbd> (Windows/Linux) or <kbd>Cmd ⌘</kbd> + <kbd>M</kbd> (macOS).
- **iOS**: Press <kbd>R</kbd> in iOS Simulator.

## Congratulations! :tada:

You've successfully run and modified your React Native App. :partying_face:

### Now what?

- If you want to add this new React Native code to an existing application, check out the [Integration guide](https://reactnative.dev/docs/integration-with-existing-apps).
- If you're curious to learn more about React Native, check out the [docs](https://reactnative.dev/docs/getting-started).

# Troubleshooting

If you're having issues getting the above steps to work, see the [Troubleshooting](https://reactnative.dev/docs/troubleshooting) page.

# Learn More

To learn more about React Native, take a look at the following resources:

- [React Native Website](https://reactnative.dev) - learn more about React Native.
- [Getting Started](https://reactnative.dev/docs/environment-setup) - an **overview** of React Native and how setup your environment.
- [Learn the Basics](https://reactnative.dev/docs/getting-started) - a **guided tour** of the React Native **basics**.
- [Blog](https://reactnative.dev/blog) - read the latest official React Native **Blog** posts.
- [`@facebook/react-native`](https://github.com/facebook/react-native) - the Open Source; GitHub **repository** for React Native.

