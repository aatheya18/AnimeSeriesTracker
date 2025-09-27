import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, FlatList } from 'react-native';
import { Text, Searchbar, Card, Button, IconButton, Chip, SegmentedButtons } from 'react-native-paper';
import FastImage from 'react-native-fast-image';
import { useTheme } from '../context/ThemeContext';
import contentApi from '../api/contentApi';
import { CONTENT_TYPES } from '../config/firebase';

const SearchScreen = ({ navigation }) => {
  const { theme } = useTheme();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [trendingContent, setTrendingContent] = useState([]);
  const [loading, setLoading] = useState(false);
  const [contentType, setContentType] = useState('all');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const contentTypeOptions = [
    { value: 'all', label: 'All' },
    { value: CONTENT_TYPES.ANIME, label: 'Anime' },
    { value: CONTENT_TYPES.TV_SERIES, label: 'TV Series' },
  ];

  useEffect(() => {
    loadTrendingContent();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      performSearch();
    } else {
      setSearchResults([]);
      setPage(1);
      setHasMore(false);
    }
  }, [searchQuery, contentType]);

  const loadTrendingContent = async () => {
    try {
      const result = await contentApi.getTrendingContent(null, 1, 20);
      if (result.success) {
        setTrendingContent(result.data.results);
      }
    } catch (error) {
      console.error('Error loading trending content:', error);
    }
  };

  const performSearch = async (pageNum = 1, append = false) => {
    if (!searchQuery.trim()) return;

    try {
      setLoading(true);
      
      const searchContentType = contentType === 'all' ? null : contentType;
      const result = await contentApi.searchContent(searchQuery.trim(), searchContentType, pageNum, 25);
      
      if (result.success) {
        const newResults = result.data.results;
        
        if (append) {
          setSearchResults(prev => [...prev, ...newResults]);
        } else {
          setSearchResults(newResults);
        }
        
        setHasMore(result.data.pagination?.hasNextPage || false);
        setPage(pageNum);
      } else {
        console.error('Search error:', result.error);
      }
    } catch (error) {
      console.error('Error performing search:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      performSearch(page + 1, true);
    }
  };

  const handleContentPress = (item) => {
    if (item.contentType === CONTENT_TYPES.ANIME) {
      navigation.navigate('AnimeDetail', { id: item.id, anime: item });
    } else {
      navigation.navigate('TVSeriesDetail', { id: item.id, series: item });
    }
  };

  const renderContentItem = ({ item, index }) => (
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
            variant="titleMedium" 
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
            {(item.score || item.rating?.average) && (
              <Text variant="bodySmall" style={[styles.score, { color: theme.colors.textSecondary }]}>
                ⭐ {(item.score || item.rating?.average)?.toFixed(1)}
              </Text>
            )}
            {item.year && (
              <Text variant="bodySmall" style={[styles.year, { color: theme.colors.textSecondary }]}>
                {item.year}
              </Text>
            )}
          </View>

          <Text 
            variant="bodySmall" 
            style={[styles.synopsis, { color: theme.colors.textSecondary }]}
            numberOfLines={3}
          >
            {item.synopsis || item.summary?.replace(/<[^>]*>/g, '') || 'No description available.'}
          </Text>

          {/* Genres */}
          {item.genres && item.genres.length > 0 && (
            <View style={styles.genresContainer}>
              {item.genres.slice(0, 3).map((genre, genreIndex) => (
                <Chip 
                  key={genreIndex}
                  mode="flat" 
                  compact 
                  style={[styles.genreChip, { backgroundColor: theme.colors.surfaceVariant }]}
                  textStyle={[styles.genreText, { color: theme.colors.textSecondary }]}
                >
                  {genre.name || genre}
                </Chip>
              ))}
            </View>
          )}

          {/* Status and Episodes */}
          <View style={styles.statusContainer}>
            {item.status && (
              <Text variant="bodySmall" style={[styles.status, { color: theme.colors.textSecondary }]}>
                Status: {item.status}
              </Text>
            )}
            {item.episodes && (
              <Text variant="bodySmall" style={[styles.episodes, { color: theme.colors.textSecondary }]}>
                Episodes: {item.episodes}
              </Text>
            )}
          </View>
        </View>
      </View>
    </Card>
  );

  const renderTrendingItem = (item, index) => (
    <Card 
      key={`trending-${item.contentType}-${item.id}-${index}`}
      style={[styles.trendingCard, { backgroundColor: theme.colors.card }]}
      onPress={() => handleContentPress(item)}
    >
      <FastImage
        source={{ 
          uri: item.images?.jpg?.imageUrl || item.image?.medium || 'https://via.placeholder.com/150x200',
          priority: FastImage.priority.normal,
        }}
        style={styles.trendingPoster}
        resizeMode={FastImage.resizeMode.cover}
      />
      <View style={styles.trendingInfo}>
        <Text 
          variant="titleSmall" 
          style={[styles.trendingTitle, { color: theme.colors.text }]}
          numberOfLines={2}
        >
          {item.title || item.name}
        </Text>
        <Chip 
          mode="outlined" 
          compact 
          style={[styles.trendingTypeChip, { borderColor: theme.colors.primary }]}
          textStyle={[styles.trendingChipText, { color: theme.colors.primary }]}
        >
          {item.contentType === CONTENT_TYPES.ANIME ? 'Anime' : 'TV'}
        </Chip>
      </View>
    </Card>
  );

  const renderFooter = () => {
    if (!loading || !hasMore) return null;
    
    return (
      <View style={styles.loadingFooter}>
        <Text variant="bodyMedium" style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
          Loading more results...
        </Text>
      </View>
    );
  };

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
          Search
        </Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search anime and TV series..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={[styles.searchBar, { backgroundColor: theme.colors.surfaceVariant }]}
          inputStyle={{ color: theme.colors.text }}
          iconColor={theme.colors.textSecondary}
          placeholderTextColor={theme.colors.textSecondary}
        />
      </View>

      {/* Content Type Filter */}
      <View style={styles.filterContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterButtons}
        >
          {contentTypeOptions.map((option) => (
            <Chip
              key={option.value}
              mode={contentType === option.value ? 'flat' : 'outlined'}
              selected={contentType === option.value}
              onPress={() => setContentType(option.value)}
              style={[
                styles.filterChip,
                contentType === option.value && { backgroundColor: theme.colors.primary }
              ]}
              textStyle={[
                styles.filterChipText,
                contentType === option.value && { color: 'white' }
              ]}
            >
              {option.label}
            </Chip>
          ))}
        </ScrollView>
      </View>

      {/* Content */}
      {searchQuery.trim() ? (
        // Search Results
        <FlatList
          data={searchResults}
          renderItem={renderContentItem}
          keyExtractor={(item, index) => `${item.contentType}-${item.id}-${index}`}
          contentContainerStyle={styles.resultsList}
          showsVerticalScrollIndicator={false}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={
            !loading ? (
              <View style={styles.emptyContainer}>
                <Text variant="titleLarge" style={[styles.emptyTitle, { color: theme.colors.text }]}>
                  No results found
                </Text>
                <Text variant="bodyMedium" style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                  Try searching with different keywords
                </Text>
              </View>
            ) : null
          }
        />
      ) : (
        // Trending Content
        <ScrollView 
          style={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.section}>
            <Text variant="titleLarge" style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Trending Now
            </Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.trendingList}
            >
              {trendingContent.map(renderTrendingItem)}
            </ScrollView>
          </View>

          <View style={styles.section}>
            <Text variant="titleLarge" style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Popular Searches
            </Text>
            <View style={styles.popularSearches}>
              {['Attack on Titan', 'Demon Slayer', 'Breaking Bad', 'Game of Thrones', 'One Piece', 'Stranger Things'].map((search, index) => (
                <Chip
                  key={index}
                  mode="outlined"
                  onPress={() => setSearchQuery(search)}
                  style={styles.popularSearchChip}
                  textStyle={{ color: theme.colors.text }}
                >
                  {search}
                </Chip>
              ))}
            </View>
          </View>
        </ScrollView>
      )}
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
    paddingHorizontal: 8,
    paddingTop: 16,
    paddingBottom: 8,
  },
  backButton: {
    marginRight: 8,
  },
  title: {
    fontWeight: 'bold',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  searchBar: {
    elevation: 0,
    shadowOpacity: 0,
  },
  filterContainer: {
    paddingBottom: 16,
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
  content: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontWeight: 'bold',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  trendingList: {
    paddingHorizontal: 16,
    gap: 12,
  },
  trendingCard: {
    width: 120,
    borderRadius: 8,
  },
  trendingPoster: {
    width: '100%',
    height: 160,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  trendingInfo: {
    padding: 8,
  },
  trendingTitle: {
    fontWeight: '600',
    marginBottom: 4,
    lineHeight: 16,
  },
  trendingTypeChip: {
    height: 20,
    alignSelf: 'flex-start',
  },
  trendingChipText: {
    fontSize: 9,
  },
  popularSearches: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 8,
  },
  popularSearchChip: {
    marginBottom: 8,
  },
  resultsList: {
    padding: 16,
    gap: 12,
  },
  contentCard: {
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
  contentInfo: {
    flex: 1,
  },
  contentTitle: {
    fontWeight: '600',
    marginBottom: 6,
    lineHeight: 20,
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
  year: {
    fontSize: 12,
  },
  synopsis: {
    lineHeight: 16,
    marginBottom: 8,
  },
  genresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginBottom: 6,
  },
  genreChip: {
    height: 20,
  },
  genreText: {
    fontSize: 10,
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  status: {
    fontSize: 11,
  },
  episodes: {
    fontSize: 11,
  },
  loadingFooter: {
    padding: 16,
    alignItems: 'center',
  },
  loadingText: {
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyTitle: {
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyText: {
    textAlign: 'center',
  },
});

export default SearchScreen;