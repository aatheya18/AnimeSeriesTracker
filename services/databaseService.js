import { firebaseFirestore, COLLECTIONS, WATCHLIST_CATEGORIES } from '../config/firebase';
import authService from './authService';

class DatabaseService {
  constructor() {
    this.firestore = firebaseFirestore();
  }

  // WATCHLIST OPERATIONS

  // Add item to watchlist
  async addToWatchlist(contentData) {
    try {
      const user = authService.getCurrentUser();
      if (!user) throw new Error('No user logged in');

      const itemId = `${contentData.contentType}_${contentData.contentId}`;
      
      await this.firestore
        .collection(COLLECTIONS.WATCHLISTS)
        .doc(user.uid)
        .collection('items')
        .doc(itemId)
        .set({
          ...contentData,
          addedAt: firebaseFirestore.FieldValue.serverTimestamp(),
          updatedAt: firebaseFirestore.FieldValue.serverTimestamp()
        });

      return { success: true, itemId };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Update watchlist item
  async updateWatchlistItem(itemId, updates) {
    try {
      const user = authService.getCurrentUser();
      if (!user) throw new Error('No user logged in');

      await this.firestore
        .collection(COLLECTIONS.WATCHLISTS)
        .doc(user.uid)
        .collection('items')
        .doc(itemId)
        .update({
          ...updates,
          updatedAt: firebaseFirestore.FieldValue.serverTimestamp()
        });

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Remove item from watchlist
  async removeFromWatchlist(itemId) {
    try {
      const user = authService.getCurrentUser();
      if (!user) throw new Error('No user logged in');

      await this.firestore
        .collection(COLLECTIONS.WATCHLISTS)
        .doc(user.uid)
        .collection('items')
        .doc(itemId)
        .delete();

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Get user's watchlist
  async getWatchlist(category = WATCHLIST_CATEGORIES.ALL) {
    try {
      const user = authService.getCurrentUser();
      if (!user) throw new Error('No user logged in');

      let query = this.firestore
        .collection(COLLECTIONS.WATCHLISTS)
        .doc(user.uid)
        .collection('items')
        .orderBy('updatedAt', 'desc');

      if (category !== WATCHLIST_CATEGORIES.ALL) {
        query = query.where('category', '==', category);
      }

      const snapshot = await query.get();
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      return { success: true, data: items };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // CLUB OPERATIONS

  // Create a new club
  async createClub(clubData) {
    try {
      const user = authService.getCurrentUser();
      if (!user) throw new Error('No user logged in');

      const clubRef = await this.firestore
        .collection(COLLECTIONS.CLUBS)
        .add({
          ...clubData,
          members: [user.uid],
          moderators: [user.uid],
          createdBy: user.uid,
          stats: {
            memberCount: 1,
            discussionCount: 0,
            pollCount: 0
          },
          createdAt: firebaseFirestore.FieldValue.serverTimestamp(),
          updatedAt: firebaseFirestore.FieldValue.serverTimestamp()
        });

      return { success: true, clubId: clubRef.id };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Join a club
  async joinClub(clubId) {
    try {
      const user = authService.getCurrentUser();
      if (!user) throw new Error('No user logged in');

      await this.firestore
        .collection(COLLECTIONS.CLUBS)
        .doc(clubId)
        .update({
          members: firebaseFirestore.FieldValue.arrayUnion(user.uid),
          'stats.memberCount': firebaseFirestore.FieldValue.increment(1),
          updatedAt: firebaseFirestore.FieldValue.serverTimestamp()
        });

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Leave a club
  async leaveClub(clubId) {
    try {
      const user = authService.getCurrentUser();
      if (!user) throw new Error('No user logged in');

      await this.firestore
        .collection(COLLECTIONS.CLUBS)
        .doc(clubId)
        .update({
          members: firebaseFirestore.FieldValue.arrayRemove(user.uid),
          'stats.memberCount': firebaseFirestore.FieldValue.increment(-1),
          updatedAt: firebaseFirestore.FieldValue.serverTimestamp()
        });

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Get user's clubs
  async getUserClubs() {
    try {
      const user = authService.getCurrentUser();
      if (!user) throw new Error('No user logged in');

      const snapshot = await this.firestore
        .collection(COLLECTIONS.CLUBS)
        .where('members', 'array-contains', user.uid)
        .orderBy('updatedAt', 'desc')
        .get();

      const clubs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      return { success: true, data: clubs };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Search clubs
  async searchClubs(searchTerm, category = null) {
    try {
      let query = this.firestore
        .collection(COLLECTIONS.CLUBS)
        .where('isPrivate', '==', false);

      if (category) {
        query = query.where('category', '==', category);
      }

      const snapshot = await query.get();
      let clubs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Filter by search term (client-side filtering)
      if (searchTerm) {
        clubs = clubs.filter(club => 
          club.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          club.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      return { success: true, data: clubs };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // DISCUSSION OPERATIONS

  // Create a new discussion
  async createDiscussion(discussionData) {
    try {
      const user = authService.getCurrentUser();
      if (!user) throw new Error('No user logged in');

      const userDoc = await authService.getUserDocument(user.uid);
      const userData = userDoc.data;

      const discussionRef = await this.firestore
        .collection(COLLECTIONS.DISCUSSIONS)
        .add({
          ...discussionData,
          author: user.uid,
          authorName: userData.displayName || 'Anonymous',
          authorPhoto: userData.photoURL || null,
          stats: {
            replyCount: 0,
            likeCount: 0,
            viewCount: 0
          },
          replies: {},
          createdAt: firebaseFirestore.FieldValue.serverTimestamp(),
          updatedAt: firebaseFirestore.FieldValue.serverTimestamp()
        });

      // Update club discussion count
      await this.firestore
        .collection(COLLECTIONS.CLUBS)
        .doc(discussionData.clubId)
        .update({
          'stats.discussionCount': firebaseFirestore.FieldValue.increment(1)
        });

      return { success: true, discussionId: discussionRef.id };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Get club discussions
  async getClubDiscussions(clubId) {
    try {
      const snapshot = await this.firestore
        .collection(COLLECTIONS.DISCUSSIONS)
        .where('clubId', '==', clubId)
        .orderBy('isPinned', 'desc')
        .orderBy('createdAt', 'desc')
        .get();

      const discussions = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      return { success: true, data: discussions };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Add reply to discussion
  async addReply(discussionId, replyData) {
    try {
      const user = authService.getCurrentUser();
      if (!user) throw new Error('No user logged in');

      const userDoc = await authService.getUserDocument(user.uid);
      const userData = userDoc.data;

      const replyId = this.firestore.collection('temp').doc().id;

      await this.firestore
        .collection(COLLECTIONS.DISCUSSIONS)
        .doc(discussionId)
        .update({
          [`replies.${replyId}`]: {
            ...replyData,
            author: user.uid,
            authorName: userData.displayName || 'Anonymous',
            authorPhoto: userData.photoURL || null,
            likeCount: 0,
            createdAt: firebaseFirestore.FieldValue.serverTimestamp()
          },
          'stats.replyCount': firebaseFirestore.FieldValue.increment(1),
          updatedAt: firebaseFirestore.FieldValue.serverTimestamp()
        });

      return { success: true, replyId };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // REVIEW OPERATIONS

  // Add a review
  async addReview(reviewData) {
    try {
      const user = authService.getCurrentUser();
      if (!user) throw new Error('No user logged in');

      const userDoc = await authService.getUserDocument(user.uid);
      const userData = userDoc.data;

      const reviewRef = await this.firestore
        .collection(COLLECTIONS.REVIEWS)
        .add({
          ...reviewData,
          userId: user.uid,
          userName: userData.displayName || 'Anonymous',
          userPhoto: userData.photoURL || null,
          isHelpful: {
            helpful: 0,
            notHelpful: 0
          },
          createdAt: firebaseFirestore.FieldValue.serverTimestamp(),
          updatedAt: firebaseFirestore.FieldValue.serverTimestamp()
        });

      return { success: true, reviewId: reviewRef.id };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Get reviews for content
  async getReviews(contentId, contentType) {
    try {
      const snapshot = await this.firestore
        .collection(COLLECTIONS.REVIEWS)
        .where('contentId', '==', contentId)
        .where('contentType', '==', contentType)
        .orderBy('createdAt', 'desc')
        .get();

      const reviews = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      return { success: true, data: reviews };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // ANALYTICS OPERATIONS

  // Update user analytics
  async updateAnalytics(analyticsData) {
    try {
      const user = authService.getCurrentUser();
      if (!user) throw new Error('No user logged in');

      const today = new Date().toISOString().split('T')[0];

      await this.firestore
        .collection(COLLECTIONS.ANALYTICS)
        .doc(user.uid)
        .set({
          [`watchingHistory.${today}`]: analyticsData
        }, { merge: true });

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Get user analytics
  async getAnalytics() {
    try {
      const user = authService.getCurrentUser();
      if (!user) throw new Error('No user logged in');

      const doc = await this.firestore
        .collection(COLLECTIONS.ANALYTICS)
        .doc(user.uid)
        .get();

      if (doc.exists) {
        return { success: true, data: doc.data() };
      } else {
        return { success: true, data: {} };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

export default new DatabaseService();
