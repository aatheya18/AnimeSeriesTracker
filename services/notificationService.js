import { firebaseMessaging, firebaseFirestore, COLLECTIONS } from '../config/firebase';
import authService from './authService';
import { Platform, PermissionsAndroid } from 'react-native';

class NotificationService {
  constructor() {
    this.messaging = firebaseMessaging();
    this.firestore = firebaseFirestore();
  }

  // Initialize notifications
  async initialize() {
    try {
      // Request permission for iOS
      if (Platform.OS === 'ios') {
        const authStatus = await this.messaging.requestPermission();
        const enabled =
          authStatus === firebaseMessaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === firebaseMessaging.AuthorizationStatus.PROVISIONAL;

        if (!enabled) {
          console.log('Push notification permission denied');
          return { success: false, error: 'Permission denied' };
        }
      }

      // Request permission for Android
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          console.log('Push notification permission denied');
          return { success: false, error: 'Permission denied' };
        }
      }

      // Get FCM token
      const token = await this.messaging.getToken();
      console.log('FCM Token:', token);

      // Save token to user document
      await this.saveTokenToDatabase(token);

      // Set up message handlers
      this.setupMessageHandlers();

      return { success: true, token };
    } catch (error) {
      console.error('Error initializing notifications:', error);
      return { success: false, error: error.message };
    }
  }

  // Save FCM token to user document
  async saveTokenToDatabase(token) {
    try {
      const user = authService.getCurrentUser();
      if (!user) return;

      await this.firestore
        .collection(COLLECTIONS.USERS)
        .doc(user.uid)
        .update({
          fcmToken: token,
          updatedAt: firebaseFirestore.FieldValue.serverTimestamp()
        });
    } catch (error) {
      console.error('Error saving FCM token:', error);
    }
  }

  // Set up message handlers
  setupMessageHandlers() {
    // Handle background messages
    this.messaging.setBackgroundMessageHandler(async remoteMessage => {
      console.log('Message handled in the background!', remoteMessage);
      await this.saveNotificationToDatabase(remoteMessage);
    });

    // Handle foreground messages
    this.messaging.onMessage(async remoteMessage => {
      console.log('Message handled in the foreground!', remoteMessage);
      await this.saveNotificationToDatabase(remoteMessage);
      
      // You can show an in-app notification here
      this.showInAppNotification(remoteMessage);
    });

    // Handle notification opened app
    this.messaging.onNotificationOpenedApp(remoteMessage => {
      console.log('Notification caused app to open from background state:', remoteMessage);
      this.handleNotificationNavigation(remoteMessage);
    });

    // Check whether an initial notification is available
    this.messaging.getInitialNotification().then(remoteMessage => {
      if (remoteMessage) {
        console.log('Notification caused app to open from quit state:', remoteMessage);
        this.handleNotificationNavigation(remoteMessage);
      }
    });
  }

  // Save notification to database
  async saveNotificationToDatabase(remoteMessage) {
    try {
      const user = authService.getCurrentUser();
      if (!user) return;

      const notificationData = {
        userId: user.uid,
        type: remoteMessage.data?.type || 'general',
        title: remoteMessage.notification?.title || 'Notification',
        message: remoteMessage.notification?.body || '',
        data: remoteMessage.data || {},
        isRead: false,
        actionUrl: remoteMessage.data?.actionUrl || null,
        createdAt: firebaseFirestore.FieldValue.serverTimestamp(),
        expiresAt: null // Set expiration if needed
      };

      await this.firestore
        .collection(COLLECTIONS.NOTIFICATIONS)
        .add(notificationData);
    } catch (error) {
      console.error('Error saving notification to database:', error);
    }
  }

  // Show in-app notification
  showInAppNotification(remoteMessage) {
    // Implement your in-app notification UI here
    // This could be a toast, modal, or custom notification component
    console.log('Show in-app notification:', remoteMessage.notification);
  }

  // Handle notification navigation
  handleNotificationNavigation(remoteMessage) {
    // Implement navigation logic based on notification data
    const actionUrl = remoteMessage.data?.actionUrl;
    if (actionUrl) {
      // Navigate to the appropriate screen
      console.log('Navigate to:', actionUrl);
    }
  }

  // Get user notifications
  async getUserNotifications(limit = 50) {
    try {
      const user = authService.getCurrentUser();
      if (!user) throw new Error('No user logged in');

      const snapshot = await this.firestore
        .collection(COLLECTIONS.NOTIFICATIONS)
        .where('userId', '==', user.uid)
        .orderBy('createdAt', 'desc')
        .limit(limit)
        .get();

      const notifications = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      return { success: true, data: notifications };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Mark notification as read
  async markAsRead(notificationId) {
    try {
      await this.firestore
        .collection(COLLECTIONS.NOTIFICATIONS)
        .doc(notificationId)
        .update({
          isRead: true
        });

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Mark all notifications as read
  async markAllAsRead() {
    try {
      const user = authService.getCurrentUser();
      if (!user) throw new Error('No user logged in');

      const snapshot = await this.firestore
        .collection(COLLECTIONS.NOTIFICATIONS)
        .where('userId', '==', user.uid)
        .where('isRead', '==', false)
        .get();

      const batch = this.firestore.batch();
      snapshot.docs.forEach(doc => {
        batch.update(doc.ref, { isRead: true });
      });

      await batch.commit();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Delete notification
  async deleteNotification(notificationId) {
    try {
      await this.firestore
        .collection(COLLECTIONS.NOTIFICATIONS)
        .doc(notificationId)
        .delete();

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Schedule local notification (for episode reminders)
  async scheduleLocalNotification(notificationData, scheduleDate) {
    try {
      // This would typically use a library like @react-native-async-storage/async-storage
      // and react-native-push-notification or similar for local notifications
      
      console.log('Schedule local notification:', notificationData, scheduleDate);
      
      // Implementation would depend on the chosen local notification library
      // For now, we'll just log the data
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Send notification to specific user (server-side function would be needed)
  async sendNotificationToUser(userId, notificationData) {
    try {
      // This would typically be done through a cloud function
      // For now, we'll just save it to the database
      
      const notification = {
        userId: userId,
        type: notificationData.type || 'general',
        title: notificationData.title,
        message: notificationData.message,
        data: notificationData.data || {},
        isRead: false,
        actionUrl: notificationData.actionUrl || null,
        createdAt: firebaseFirestore.FieldValue.serverTimestamp(),
        expiresAt: notificationData.expiresAt || null
      };

      await this.firestore
        .collection(COLLECTIONS.NOTIFICATIONS)
        .add(notification);

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Get unread notification count
  async getUnreadCount() {
    try {
      const user = authService.getCurrentUser();
      if (!user) throw new Error('No user logged in');

      const snapshot = await this.firestore
        .collection(COLLECTIONS.NOTIFICATIONS)
        .where('userId', '==', user.uid)
        .where('isRead', '==', false)
        .get();

      return { success: true, count: snapshot.size };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

export default new NotificationService();
