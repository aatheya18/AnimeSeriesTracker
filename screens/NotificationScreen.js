import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, Alert } from 'react-native';
import { Text, Card, IconButton, Chip, Button, Menu } from 'react-native-paper';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import databaseService from '../services/databaseService';
import { useFocusEffect } from '@react-navigation/native';

const NotificationsScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const { user } = useAuth();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all');
  const [menuVisible, setMenuVisible] = useState(false);

  const filterOptions = [
    { value: 'all', label: 'All' },
    { value: 'unread', label: 'Unread' },
    { value: 'episode', label: 'Episodes' },
    { value: 'club', label: 'Clubs' },
    { value: 'discussion', label: 'Discussions' },
  ];

  useFocusEffect(
    useCallback(() => {
      loadNotifications();
    }, [filter])
  );

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const result = await databaseService.getUserNotifications(filter);
      
      if (result.success) {
        setNotifications(result.data);
      } else {
        console.error('Error loading notifications:', result.error);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  };

  const handleNotificationPress = async (notification) => {
    try {
      // Mark as read if unread
      if (!notification.read) {
        await databaseService.markNotificationAsRead(notification.id);
        setNotifications(prev => 
          prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
        );
      }

      // Navigate based on notification type
      switch (notification.type) {
        case 'episode_reminder':
          if (notification.data?.contentType === 'anime') {
            navigation.navigate('AnimeDetail', { 
              id: notification.data.contentId, 
              anime: notification.data 
            });
          } else {
            navigation.navigate('TVSeriesDetail', { 
              id: notification.data.contentId, 
              series: notification.data 
            });
          }
          break;
        case 'club_invitation':
        case 'club_update':
          navigation.navigate('ClubDetail', { 
            clubId: notification.data?.clubId 
          });
          break;
        case 'discussion_reply':
        case 'discussion_mention':
          navigation.navigate('DiscussionDetail', { 
            discussionId: notification.data?.discussionId 
          });
          break;
        case 'new_episode':
          navigation.navigate('Search');
          break;
        default:
          break;
      }
    } catch (error) {
      console.error('Error handling notification press:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const result = await databaseService.markAllNotificationsAsRead();
      if (result.success) {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      } else {
        Alert.alert('Error', 'Failed to mark all notifications as read');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
    }
  };

  const handleClearAll = () => {
    Alert.alert(
      'Clear All Notifications',
      'Are you sure you want to clear all notifications? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await databaseService.clearAllNotifications();
              if (result.success) {
                setNotifications([]);
              } else {
                Alert.alert('Error', 'Failed to clear notifications');
              }
            } catch (error) {
              Alert.alert('Error', 'An unexpected error occurred');
            }
          }
        }
      ]
    );
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'episode_reminder':
        return 'clock-outline';
      case 'new_episode':
        return 'play-circle-outline';
      case 'club_invitation':
        return 'account-group';
      case 'club_update':
        return 'bullhorn';
      case 'discussion_reply':
        return 'reply';
      case 'discussion_mention':
        return 'at';
      case 'system':
        return 'information';
      default:
        return 'bell';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'episode_reminder':
        return theme.colors.primary;
      case 'new_episode':
        return theme.colors.success;
      case 'club_invitation':
      case 'club_update':
        return theme.colors.secondary;
      case 'discussion_reply':
      case 'discussion_mention':
        return theme.colors.tertiary;
      case 'system':
        return theme.colors.warning;
      default:
        return theme.colors.textSecondary;
    }
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const notificationTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now - notificationTime) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return notificationTime.toLocaleDateString();
  };

  const renderNotification = ({ item }) => (
    <Card 
      style={[
        styles.notificationCard, 
        { 
          backgroundColor: theme.colors.card,
          borderLeftColor: item.read ? 'transparent' : theme.colors.primary,
          borderLeftWidth: item.read ? 0 : 4,
        }
      ]}
      onPress={() => handleNotificationPress(item)}
    >
      <Card.Content>
        <View style={styles.notificationHeader}>
          <View style={styles.notificationIcon}>
            <IconButton
              icon={getNotificationIcon(item.type)}
              size={20}
              iconColor={getNotificationColor(item.type)}
              style={styles.iconButton}
            />
          </View>
          <View style={styles.notificationContent}>
            <Text 
              variant="titleSmall" 
              style={[
                styles.notificationTitle, 
                { 
                  color: theme.colors.text,
                  fontWeight: item.read ? 'normal' : 'bold'
                }
              ]}
              numberOfLines={2}
            >
              {item.title}
            </Text>
            <Text 
              variant="bodySmall" 
              style={[styles.notificationMessage, { color: theme.colors.textSecondary }]}
              numberOfLines={3}
            >
              {item.message}
            </Text>
            <View style={styles.notificationMeta}>
              <Text variant="bodySmall" style={[styles.timeAgo, { color: theme.colors.textSecondary }]}>
                {formatTimeAgo(item.createdAt)}
              </Text>
              <Chip 
                mode="outlined" 
                compact 
                style={[styles.typeChip, { borderColor: getNotificationColor(item.type) }]}
                textStyle={[styles.chipText, { color: getNotificationColor(item.type) }]}
              >
                {filterOptions.find(f => f.value === item.type)?.label || item.type}
              </Chip>
            </View>
          </View>
          {!item.read && (
            <View style={[styles.unreadIndicator, { backgroundColor: theme.colors.primary }]} />
          )}
        </View>
      </Card.Content>
    </Card>
  );

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notification.read;
    return notification.type === filter;
  });

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <IconButton
          icon="arrow-left"
          size={24}
          iconColor={theme.colors.text}
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        />
        <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.text }]}>
          Notifications
        </Text>
        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={
            <IconButton
              icon="dots-vertical"
              size={24}
              iconColor={theme.colors.text}
              onPress={() => setMenuVisible(true)}
            />
          }
        >
          <Menu.Item
            onPress={() => {
              setMenuVisible(false);
              handleMarkAllAsRead();
            }}
            title="Mark all as read"
          />
          <Menu.Item
            onPress={() => {
              setMenuVisible(false);
              handleClearAll();
            }}
            title="Clear all"
            titleStyle={{ color: theme.colors.error }}
          />
        </Menu>
      </View>

      {/* Filter Buttons */}
      <View style={styles.filterContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={filterOptions}
          keyExtractor={(item) => item.value}
          contentContainerStyle={styles.filterButtons}
          renderItem={({ item }) => (
            <Chip
              mode={filter === item.value ? 'flat' : 'outlined'}
              selected={filter === item.value}
              onPress={() => setFilter(item.value)}
              style={[
                styles.filterChip,
                filter === item.value && { backgroundColor: theme.colors.primary }
              ]}
              textStyle={[
                styles.filterChipText,
                filter === item.value && { color: 'white' }
              ]}
            >
              {item.label}
            </Chip>
          )}
        />
      </View>

      {/* Notifications List */}
      <FlatList
        data={filteredNotifications}
        renderItem={renderNotification}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.notificationsList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <IconButton
              icon="bell-off"
              size={64}
              iconColor={theme.colors.textSecondary}
              style={styles.emptyIcon}
            />
            <Text variant="titleLarge" style={[styles.emptyTitle, { color: theme.colors.text }]}>
              {filter === 'unread' ? 'No unread notifications' : 'No notifications'}
            </Text>
            <Text variant="bodyMedium" style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
              {filter === 'unread' 
                ? 'All caught up! Check back later for new notifications.'
                : 'You\'ll see notifications here when you have updates about your shows, clubs, and discussions.'
              }
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingTop: 16,
    paddingBottom: 8,
  },
  backButton: {
    marginRight: 8,
  },
  title: {
    flex: 1,
    fontWeight: 'bold',
  },
  filterContainer: {
    paddingVertical: 8,
  },
  filterButtons: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    marginRight: 8,
  },
  filterChipText: {
    fontSize: 12,
  },
  notificationsList: {
    padding: 16,
    gap: 8,
  },
  notificationCard: {
    borderRadius: 12,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  notificationIcon: {
    marginRight: 12,
  },
  iconButton: {
    margin: 0,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    marginBottom: 4,
    lineHeight: 18,
  },
  notificationMessage: {
    lineHeight: 16,
    marginBottom: 8,
  },
  notificationMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timeAgo: {
    fontSize: 11,
  },
  typeChip: {
    height: 20,
  },
  chipText: {
    fontSize: 10,
  },
  unreadIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8,
    marginTop: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
    paddingHorizontal: 32,
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyTitle: {
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyText: {
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default NotificationsScreen;
