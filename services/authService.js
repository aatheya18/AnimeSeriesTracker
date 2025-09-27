import { firebaseAuth, firebaseFirestore, COLLECTIONS } from '../config/firebase';

class AuthService {
  constructor() {
    this.auth = firebaseAuth();
    this.firestore = firebaseFirestore();
  }

  // Get current user
  getCurrentUser() {
    return this.auth.currentUser;
  }

  // Listen to authentication state changes
  onAuthStateChanged(callback) {
    return this.auth.onAuthStateChanged(callback);
  }

  // Sign up with email and password
  async signUp(email, password, displayName) {
    try {
      const userCredential = await this.auth.createUserWithEmailAndPassword(email, password);
      const user = userCredential.user;

      // Update user profile
      await user.updateProfile({
        displayName: displayName,
      });

      // Create user document in Firestore
      await this.createUserDocument(user.uid, {
        email: email,
        displayName: displayName,
        photoURL: user.photoURL || null,
        preferences: {
          theme: 'light',
          notifications: {
            newEpisodes: true,
            clubDiscussions: true,
            recommendations: true
          },
          language: 'en',
          timezone: 'UTC'
        },
        stats: {
          totalAnimeWatched: 0,
          totalTVSeriesWatched: 0,
          totalHoursWatched: 0,
          favoriteGenres: []
        },
        createdAt: firebaseFirestore.FieldValue.serverTimestamp(),
        updatedAt: firebaseFirestore.FieldValue.serverTimestamp()
      });

      return { success: true, user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Sign in with email and password
  async signIn(email, password) {
    try {
      const userCredential = await this.auth.signInWithEmailAndPassword(email, password);
      return { success: true, user: userCredential.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Sign out
  async signOut() {
    try {
      await this.auth.signOut();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Reset password
  async resetPassword(email) {
    try {
      await this.auth.sendPasswordResetEmail(email);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Update user profile
  async updateProfile(updates) {
    try {
      const user = this.getCurrentUser();
      if (!user) throw new Error('No user logged in');

      // Update Firebase Auth profile
      if (updates.displayName || updates.photoURL) {
        await user.updateProfile({
          displayName: updates.displayName || user.displayName,
          photoURL: updates.photoURL || user.photoURL,
        });
      }

      // Update Firestore user document
      await this.firestore
        .collection(COLLECTIONS.USERS)
        .doc(user.uid)
        .update({
          ...updates,
          updatedAt: firebaseFirestore.FieldValue.serverTimestamp()
        });

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Create user document in Firestore
  async createUserDocument(userId, userData) {
    try {
      await this.firestore
        .collection(COLLECTIONS.USERS)
        .doc(userId)
        .set(userData);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Get user document from Firestore
  async getUserDocument(userId) {
    try {
      const doc = await this.firestore
        .collection(COLLECTIONS.USERS)
        .doc(userId)
        .get();
      
      if (doc.exists) {
        return { success: true, data: doc.data() };
      } else {
        return { success: false, error: 'User document not found' };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Update user preferences
  async updatePreferences(preferences) {
    try {
      const user = this.getCurrentUser();
      if (!user) throw new Error('No user logged in');

      await this.firestore
        .collection(COLLECTIONS.USERS)
        .doc(user.uid)
        .update({
          preferences: preferences,
          updatedAt: firebaseFirestore.FieldValue.serverTimestamp()
        });

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Update user stats
  async updateStats(stats) {
    try {
      const user = this.getCurrentUser();
      if (!user) throw new Error('No user logged in');

      await this.firestore
        .collection(COLLECTIONS.USERS)
        .doc(user.uid)
        .update({
          stats: stats,
          updatedAt: firebaseFirestore.FieldValue.serverTimestamp()
        });

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Delete user account
  async deleteAccount() {
    try {
      const user = this.getCurrentUser();
      if (!user) throw new Error('No user logged in');

      // Delete user data from Firestore
      await this.firestore
        .collection(COLLECTIONS.USERS)
        .doc(user.uid)
        .delete();

      // Delete user from Firebase Auth
      await user.delete();

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

export default new AuthService();
