import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Text, Card, Button, IconButton, Chip } from 'react-native-paper';
import FastImage from 'react-native-fast-image';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import contentApi from '../api/contentApi';
import { CONTENT_TYPES } from '../config/firebase';

const HomeScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const { userProfile } = useAuth();

  const [trendingContent, setTrendingContent] = useState([]);
  const [topRatedContent, setTopRatedContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadHomeData();
  }, []);

  const loadHomeData = async () => {
    try {
      setLoading(true);
      
      // Load trending content
      const trendingResult = await contentApi.getTrendingContent(null, 1, 10);
      if (trendingResult.success) {
        setTrendingContent(trendingResult.data.results);
      }

      // Load top rated content
      const topRatedResult = await contentApi.getTopRatedContent(null, 1, 10);
      if (topRatedResult.success) {
        setTopRatedContent(topRatedResult.data.results);
      }
    } catch (error) {
      console.error('Error loading home data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadHomeData();
    setRefreshing(false);
  };

  const handleSearch = () => {
    navigation.navigate('Search');
  };

  const handleNotifications = () => {
    navigation.navigate('Notifications');
  };

  const handleContentPress = (item) => {
    if (item.contentType === CONTENT_TYPES.ANIME) {
      navigation.navigate('AnimeDetail', { id: item.id, anime: item });
    } else {
      navigation.navigate('TVSeriesDetail', { id: item.id, series: item });
    }
  };

  const renderContentCard = (item, index) => (
    <Card 
      key={`${item.contentType}-${item.id}-${index}`}
      style={[styles.contentCard, { backgroundColor: theme.colors.card }]}
      onPress={() => handleContentPress(item)}
    >
      <View style={styles.cardContent}>
        <FastImage
          source={{ 
            uri: item.images?.jpg?.imageUrl || item.image?.medium || 'https://via.placeholder.com/150x200',
            priority: FastImage.priority.normal,
          }}
          style={styles.poster}
          resizeMode={FastImage.resizeMode.cover}
        />
        <View style={styles.contentInfo}>
          <Text 
            variant="titleSmall" 
            style={[styles.contentTitle, { color: theme.colors.text }]}
            numberOfLines={2}
          >
            {item.title || item.name}
          </Text>
          <View style={styles.contentMeta}>
            <Chip 
              mode="outlined" 
              compact 
              style={[styles.typeChip, { borderColor: theme.colors.primary }]}
              textStyle={[styles.chipText, { color: theme.colors.primary }]}
            >
              {item.contentType === CONTENT_TYPES.ANIME ? 'Anime' : 'TV Series'}
            </Chip>
            {item.score && (
              <Text variant="bodySmall" style={[styles.score, { color: theme.colors.textSecondary }]}>
                ⭐ {item.score.toFixed(1)}
              </Text>
            )}
          </View>
          <Text 
            variant="bodySmall" 
            style={[styles.synopsis, { color: theme.colors.textSecondary }]}
            numberOfLines={3}
          >
            {item.synopsis || 'No description available.'}
          </Text>
        </View>
      </View>
    </Card>
  );

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text variant="headlineSmall" style={[styles.greeting, { color: theme.colors.text }]}>
            Welcome back,
          </Text>
          <Text variant="titleLarge" style={[styles.userName, { color: theme.colors.primary }]}>
            {userProfile?.displayName || 'User'}
          </Text>
        </View>
        <View style={styles.headerRight}>
          <IconButton
            icon="magnify"
            size={24}
            iconColor={theme.colors.text}
            onPress={handleSearch}
            style={styles.headerButton}
          />
          <IconButton
            icon="bell-outline"
            size={24}
            iconColor={theme.colors.text}
            onPress={handleNotifications}
            style={styles.headerButton}
          />
        </View>
      </View>

      {/* Quick Stats */}
      {userProfile?.stats && (
        <View style={styles.statsContainer}>
          <Card style={[styles.statCard, { backgroundColor: theme.colors.card }]}>
            <Text variant="titleMedium" style={[styles.statNumber, { color: theme.colors.primary }]}>
              {userProfile.stats.totalAnimeWatched + userProfile.stats.totalTVSeriesWatched}
            </Text>
            <Text variant="bodySmall" style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
              Total Shows
            </Text>
          </Card>
          <Card style={[styles.statCard, { backgroundColor: theme.colors.card }]}>
            <Text variant="titleMedium" style={[styles.statNumber, { color: theme.colors.primary }]}>
              {Math.round(userProfile.stats.totalHoursWatched)}h
            </Text>
            <Text variant="bodySmall" style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
              Hours Watched
            </Text>
          </Card>
          <Card style={[styles.statCard, { backgroundColor: theme.colors.card }]}>
            <Text variant="titleMedium" style={[styles.statNumber, { color: theme.colors.primary }]}>
              {userProfile.stats.favoriteGenres?.length || 0}
            </Text>
            <Text variant="bodySmall" style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
              Fav Genres
            </Text>
          </Card>
        </View>
      )}

      {/* Trending Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text variant="titleLarge" style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Trending Now
          </Text>
          <Button 
            mode="text" 
            onPress={() => navigation.navigate('Search')}
            labelStyle={[styles.seeAllButton, { color: theme.colors.primary }]}
          >
            See All
          </Button>
        </View>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalList}
        >
          {trendingContent.map(renderContentCard)}
        </ScrollView>
      </View>

      {/* Top Rated Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text variant="titleLarge" style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Top Rated
          </Text>
          <Button 
            mode="text" 
            onPress={() => navigation.navigate('Search')}
            labelStyle={[styles.seeAllButton, { color: theme.colors.primary }]}
          >
            See All
          </Button>
        </View>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalList}
        >
          {topRatedContent.map(renderContentCard)}
        </ScrollView>
      </View>

      {/* Continue Watching - This would be populated from user's watchlist */}
      <View style={styles.section}>
        <Text variant="titleLarge" style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Continue Watching
        </Text>
        <Card style={[styles.emptyCard, { backgroundColor: theme.colors.card }]}>
          <Text variant="bodyMedium" style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
            Start watching shows to see them here
          </Text>
          <Button 
            mode="contained" 
            onPress={() => navigation.navigate('Search')}
            style={[styles.exploreButton, { backgroundColor: theme.colors.primary }]}
          >
            Explore Shows
          </Button>
        </Card>
      </View>
    </ScrollView>
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
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
  },
  greeting: {
    fontWeight: '400',
  },
  userName: {
    fontWeight: 'bold',
  },
  headerButton: {
    marginLeft: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    borderRadius: 12,
  },
  statNumber: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontWeight: 'bold',
  },
  seeAllButton: {
    fontSize: 14,
  },
  horizontalList: {
    paddingHorizontal: 16,
    gap: 12,
  },
  contentCard: {
    width: 280,
    borderRadius: 12,
  },
  cardContent: {
    flexDirection: 'row',
    padding: 12,
  },
  poster: {
    width: 60,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  contentInfo: {
    flex: 1,
  },
  contentTitle: {
    fontWeight: '600',
    marginBottom: 6,
    lineHeight: 18,
  },
  contentMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 8,
  },
  typeChip: {
    height: 24,
  },
  chipText: {
    fontSize: 10,
  },
  score: {
    fontSize: 12,
  },
  synopsis: {
    lineHeight: 16,
  },
  emptyCard: {
    marginHorizontal: 16,
    padding: 24,
    alignItems: 'center',
    borderRadius: 12,
  },
  emptyText: {
    textAlign: 'center',
    marginBottom: 16,
  },
  exploreButton: {
    borderRadius: 8,
  },
});

export default HomeScreen;