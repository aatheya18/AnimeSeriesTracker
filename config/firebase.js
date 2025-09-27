import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import messaging from '@react-native-firebase/messaging';

// Initialize Firebase services
export const firebaseAuth = auth();
export const firebaseFirestore = firestore();
export const firebaseMessaging = messaging();

// Database collections
export const COLLECTIONS = {
  USERS: 'users',
  WATCHLISTS: 'watchlists',
  CLUBS: 'clubs',
  DISCUSSIONS: 'discussions',
  REVIEWS: 'reviews',
  ANALYTICS: 'analytics',
  NOTIFICATIONS: 'notifications'
};

// User watchlist categories
export const WATCHLIST_CATEGORIES = {
  ALL: 'all',
  WATCHING: 'watching',
  COMPLETED: 'completed',
  ON_HOLD: 'on_hold',
  DROPPED: 'dropped',
  PLAN_TO_WATCH: 'plan_to_watch'
};

// Content types
export const CONTENT_TYPES = {
  ANIME: 'anime',
  TV_SERIES: 'tv_series'
};

export default firebaseConfig;
