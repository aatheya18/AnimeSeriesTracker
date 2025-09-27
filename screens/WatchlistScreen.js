import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Alert } from 'react-native';
import { Text, Card, Button, IconButton, Chip, SegmentedButtons, FAB, Menu } from 'react-native-paper';
import FastImage from 'react-native-fast-image';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import databaseService from '../services/databaseService';
import { WATCHLIST_CATEGORIES, CONTENT_TYPES } from '../config/firebase';
import { useFocusEffect } from '@react-navigation/native';

const WatchlistScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const { user } = useAuth();

  const [watchlistItems, setWatchlistItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(WATCHLIST_CATEGORIES.ALL);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [menuVisible, setMenuVisible] = useState({});

  const categoryOptions = [
    { value: WATCHLIST_CATEGORIES.ALL, label: 'All' },
    { value: WATCHLIST_CATEGORIES.WATCHING, label: 'Watching' },
    { value: WATCHLIST_CATEGORIES.COMPLETED, label: 'Completed' },
    { value: WATCHLIST_CATEGORIES.ON_HOLD, label: 'On Hold' },
    { value: WATCHLIST_CATEGORIES.DROPPED, label: 'Dropped' },
    { value: WATCHLIST_CATEGORIES.PLAN_TO_WATCH, label: 'Plan to Watch' },
  ];

  useFocusEffect(
    useCallback(() => {
      loadWatchlist();
    }, [selectedCategory])
  );

  const loadWatchlist = async () => {
    try {
      setLoading(true);
      const result = await databaseService.getWatchlist(selectedCategory);
      
      if (result.success) {
        setWatchlistItems(result.data);
        setFilteredItems(result.data);
      } else {
        console.error('Error loading watchlist:', result.error);
      }
    } catch (error) {
      console.error('Error loading watchlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadWatchlist();
    setRefreshing(false);
  };

  const handleAddToWatchlist = () => {
    navigation.navigate('Search');
  };

  const handleItemPress = (item) => {
    if (item.contentType === CONTENT_TYPES.ANIME) {
      navigation.navigate('AnimeDetail', { id: item.contentId, anime: item });
    } else {
      navigation.navigate('TVSeriesDetail', { id: item.contentId, series: item });
    }
  };

  const handleUpdateProgress = async (item, newProgress) => {
    try {
      const updates = {
        progress: {
          ...item.progress,
          currentEpisode: newProgress
        }
      };

      // If completed all episodes, update category
      if (newProgress >= item.progress.totalEpisodes) {
        updates.category = WATCHLIST_CATEGORIES.COMPLETED;
        updates.completedDate = new Date().toISOString();
      }

      const result = await databaseService.updateWatchlistItem(item.id, updates);
      
      if (result.success) {
        loadWatchlist(); // Reload to get updated data
      } else {
        Alert.alert('Error', 'Failed to update progress');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
    }
  };

  const handleUpdateCategory = async (item, newCategory) => {
    try {
      const updates = { category: newCategory };
      
      if (newCategory === WATCHLIST_CATEGORIES.COMPLETED) {
        updates.completedDate = new Date().toISOString();
        updates.progress = {
          ...item.progress,
          currentEpisode: item.progress.totalEpisodes
        };
      }

      const result = await databaseService.updateWatchlistItem(item.id, updates);
      
      if (result.success) {
        loadWatchlist();
        setMenuVisible(prev => ({ ...prev, [item.id]: false }));
      } else {
        Alert.alert('Error', 'Failed to update category');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
    }
  };

  const handleRemoveFromWatchlist = async (item) => {
    Alert.alert(
      'Remove from Watchlist',
      `Are you sure you want to remove "${item.title}" from your watchlist?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await databaseService.removeFromWatchlist(item.id);
              if (result.success) {
                loadWatchlist();
              } else {
                Alert.alert('Error', 'Failed to remove from watchlist');
              }
            } catch (error) {
              Alert.alert('Error', 'An unexpected error occurred');
            }
          }
        }
      ]
    );
  };

  const renderWatchlistItem = (item) => (
    <Card 
      key={item.id}
      style={[styles.itemCard, { backgroundColor: theme.colors.card }]}
      onPress={() => handleItemPress(item)}
    >
      <View style={styles.cardContent}>
        <FastImage
          source={{ 
            uri: item.poster || 'https://via.placeholder.com/150x200',
            priority: FastImage.priority.normal,
          }}
          style={styles.poster}
          resizeMode={FastImage.resizeMode.cover}
        />
        <View style={styles.itemInfo}>
          <View style={styles.itemHeader}>
            <Text 
              variant="titleMedium" 
              style={[styles.itemTitle, { color: theme.colors.text }]}
              numberOfLines={2}
            >
              {item.title}
            </Text>
            <Menu
              visible={menuVisible[item.id]}
              onDismiss={() => setMenuVisible(prev => ({ ...prev, [item.id]: false }))}
              anchor={
                <IconButton
                  icon="dots-vertical"
                  size={20}
                  iconColor={theme.colors.textSecondary}
                  onPress={() => setMenuVisible(prev => ({ ...prev, [item.id]: true }))}
                />
              }
            >
              {categoryOptions
                .filter(option => option.value !== WATCHLIST_CATEGORIES.ALL && option.value !== item.category)
                .map(option => (
                  <Menu.Item
                    key={option.value}
                    onPress={() => handleUpdateCategory(item, option.value)}
                    title={`Move to ${option.label}`}
                  />
                ))
              }
              <Menu.Item
                onPress={() => handleRemoveFromWatchlist(item)}
                title="Remove from Watchlist"
                titleStyle={{ color: theme.colors.error }}
              />
            </Menu>
          </View>

          <View style={styles.itemMeta}>
            <Chip 
              mode="outlined" 
              compact 
              style={[styles.typeChip, { borderColor: theme.colors.primary }]}
              textStyle={[styles.chipText, { color: theme.colors.primary }]}
            >
              {item.contentType === CONTENT_TYPES.ANIME ? 'Anime' : 'TV Series'}
            </Chip>
            {item.rating && (
              <Text variant="bodySmall" style={[styles.rating, { color: theme.colors.textSecondary }]}>
                ⭐ {item.rating}/10
              </Text>
            )}
          </View>

          {/* Progress Bar */}
          {item.progress && (
            <View style={styles.progressContainer}>
              <View style={styles.progressInfo}>
                <Text variant="bodySmall" style={[styles.progressText, { color: theme.colors.textSecondary }]}>
                  Episode {item.progress.currentEpisode} of {item.progress.totalEpisodes || '?'}
                </Text>
                <Text variant="bodySmall" style={[styles.progressPercent, { color: theme.colors.primary }]}>
                  {item.progress.totalEpisodes ? 
                    Math.round((item.progress.currentEpisode / item.progress.totalEpisodes) * 100) : 0}%
                </Text>
              </View>
              <View style={[styles.progressBar, { backgroundColor: theme.colors.surfaceVariant }]}>
                <View 
                  style={[
                    styles.progressFill, 
                    { 
                      backgroundColor: theme.colors.primary,
                      width: item.progress.totalEpisodes ? 
                        `${(item.progress.currentEpisode / item.progress.totalEpisodes) * 100}%` : '0%'
                    }
                  ]} 
                />
              </View>
              <View style={styles.progressButtons}>
                <Button
                  mode="outlined"
                  compact
                  onPress={() => handleUpdateProgress(item, Math.max(0, item.progress.currentEpisode - 1))}
                  disabled={item.progress.currentEpisode <= 0}
                  style={styles.progressButton}
                >
                  -1
                </Button>
                <Button
                  mode="contained"
                  compact
                  onPress={() => handleUpdateProgress(item, item.progress.currentEpisode + 1)}
                  disabled={item.progress.totalEpisodes && item.progress.currentEpisode >= item.progress.totalEpisodes}
                  style={styles.progressButton}
                >
                  +1
                </Button>
              </View>
            </View>
          )}

          {/* Tags */}
          {item.tags && item.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {item.tags.slice(0, 3).map((tag, index) => (
                <Chip 
                  key={index}
                  mode="flat" 
                  compact 
                  style={[styles.tag, { backgroundColor: theme.colors.surfaceVariant }]}
                  textStyle={[styles.tagText, { color: theme.colors.textSecondary }]}
                >
                  {tag}
                </Chip>
              ))}
            </View>
          )}
        </View>
      </View>
    </Card>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.text }]}>
          My Watchlist
        </Text>
        <IconButton
          icon="magnify"
          size={24}
          iconColor={theme.colors.text}
          onPress={() => navigation.navigate('Search')}
        />
      </View>

      {/* Category Filter */}
      <View style={styles.filterContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryButtons}
        >
          {categoryOptions.map((option) => (
            <Chip
              key={option.value}
              mode={selectedCategory === option.value ? 'flat' : 'outlined'}
              selected={selectedCategory === option.value}
              onPress={() => setSelectedCategory(option.value)}
              style={[
                styles.categoryChip,
                selectedCategory === option.value && { backgroundColor: theme.colors.primary }
              ]}
              textStyle={[
                styles.categoryChipText,
                selectedCategory === option.value && { color: 'white' }
              ]}
            >
              {option.label}
            </Chip>
          ))}
        </ScrollView>
      </View>

      {/* Watchlist Items */}
      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text variant="bodyMedium" style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
              Loading your watchlist...
            </Text>
          </View>
        ) : filteredItems.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text variant="headlineSmall" style={[styles.emptyTitle, { color: theme.colors.text }]}>
              {selectedCategory === WATCHLIST_CATEGORIES.ALL ? 
                'Your watchlist is empty' : 
                `No ${categoryOptions.find(c => c.value === selectedCategory)?.label.toLowerCase()} shows`
              }
            </Text>
            <Text variant="bodyMedium" style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
              {selectedCategory === WATCHLIST_CATEGORIES.ALL ? 
                'Start adding anime and TV series to track your progress' :
                `Add shows to this category to see them here`
              }
            </Text>
            <Button 
              mode="contained" 
              onPress={handleAddToWatchlist}
              style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
            >
              Browse Shows
            </Button>
          </View>
        ) : (
          <View style={styles.itemsList}>
            {filteredItems.map(renderWatchlistItem)}
          </View>
        )}
      </ScrollView>

      {/* Floating Action Button */}
      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={handleAddToWatchlist}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontWeight: 'bold',
  },
  filterContainer: {
    paddingVertical: 8,
  },
  categoryButtons: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryChip: {
    marginRight: 8,
  },
  categoryChipText: {
    fontSize: 12,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  loadingText: {
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 100,
  },
  emptyTitle: {
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyText: {
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  addButton: {
    borderRadius: 8,
  },
  itemsList: {
    padding: 16,
    gap: 12,
  },
  itemCard: {
    borderRadius: 12,
  },
  cardContent: {
    flexDirection: 'row',
    padding: 12,
  },
  poster: {
    width: 80,
    height: 120,
    borderRadius: 8,
    marginRight: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  itemTitle: {
    flex: 1,
    fontWeight: '600',
    lineHeight: 20,
  },
  itemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  typeChip: {
    height: 24,
  },
  chipText: {
    fontSize: 10,
  },
  rating: {
    fontSize: 12,
  },
  progressContainer: {
    marginBottom: 8,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  progressText: {
    fontSize: 12,
  },
  progressPercent: {
    fontSize: 12,
    fontWeight: '600',
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  progressButton: {
    flex: 1,
    borderRadius: 6,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 8,
  },
  tag: {
    height: 20,
  },
  tagText: {
    fontSize: 10,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

export default WatchlistScreen;
