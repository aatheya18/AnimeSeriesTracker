import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, Dimensions } from 'react-native';
import { Text, Card, Button, IconButton, Chip, Divider, List } from 'react-native-paper';
import FastImage from 'react-native-fast-image';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import contentApi from '../api/contentApi';
import databaseService from '../services/databaseService';
import { CONTENT_TYPES, WATCHLIST_CATEGORIES } from '../config/firebase';

const { width: screenWidth } = Dimensions.get('window');

const AnimeDetailScreen = ({ route, navigation }) => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const { id, anime: initialAnime } = route.params;

  const [anime, setAnime] = useState(initialAnime || null);
  const [episodes, setEpisodes] = useState([]);
  const [characters, setCharacters] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(!initialAnime);
  const [inWatchlist, setInWatchlist] = useState(false);
  const [watchlistCategory, setWatchlistCategory] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadAnimeDetails();
    checkWatchlistStatus();
  }, [id]);

  const loadAnimeDetails = async () => {
    try {
      setLoading(true);

      // Load anime details if not provided
      if (!anime) {
        const animeResult = await contentApi.getContentById(id, CONTENT_TYPES.ANIME);
        if (animeResult.success) {
          setAnime(animeResult.data);
        }
      }

      // Load episodes
      const episodesResult = await contentApi.getContentEpisodes(id, CONTENT_TYPES.ANIME);
      if (episodesResult.success) {
        setEpisodes(episodesResult.data.episodes || []);
      }

      // Load characters
      const charactersResult = await contentApi.getContentCast(id, CONTENT_TYPES.ANIME);
      if (charactersResult.success) {
        setCharacters(charactersResult.data.slice(0, 10) || []);
      }

      // Load reviews
      const reviewsResult = await contentApi.getContentReviews(id, CONTENT_TYPES.ANIME);
      if (reviewsResult.success) {
        setReviews(reviewsResult.data.reviews?.slice(0, 5) || []);
      }

      // Load recommendations
      const recommendationsResult = await contentApi.getContentRecommendations(id, CONTENT_TYPES.ANIME);
      if (recommendationsResult.success) {
        setRecommendations(recommendationsResult.data.slice(0, 10) || []);
      }
    } catch (error) {
      console.error('Error loading anime details:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkWatchlistStatus = async () => {
    try {
      const result = await databaseService.getWatchlist();
      if (result.success) {
        const watchlistItem = result.data.find(item => 
          item.contentId === id.toString() && item.contentType === CONTENT_TYPES.ANIME
        );
        if (watchlistItem) {
          setInWatchlist(true);
          setWatchlistCategory(watchlistItem.category);
        }
      }
    } catch (error) {
      console.error('Error checking watchlist status:', error);
    }
  };

  const handleAddToWatchlist = async (category = WATCHLIST_CATEGORIES.PLAN_TO_WATCH) => {
    if (!anime) return;

    try {
      const watchlistData = {
        contentId: id.toString(),
        contentType: CONTENT_TYPES.ANIME,
        title: anime.title,
        poster: anime.images?.jpg?.imageUrl,
        category: category,
        progress: {
          currentEpisode: 0,
          totalEpisodes: anime.episodes || null,
          currentSeason: 1,
          totalSeasons: 1
        },
        rating: null,
        notes: '',
        tags: anime.genres?.map(g => g.name) || [],
        startDate: category === WATCHLIST_CATEGORIES.WATCHING ? new Date().toISOString() : null,
        completedDate: null
      };

      const result = await databaseService.addToWatchlist(watchlistData);
      
      if (result.success) {
        setInWatchlist(true);
        setWatchlistCategory(category);
        Alert.alert('Success', 'Added to your watchlist!');
      } else {
        Alert.alert('Error', 'Failed to add to watchlist');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
    }
  };

  const handleRemoveFromWatchlist = async () => {
    try {
      const itemId = `${CONTENT_TYPES.ANIME}_${id}`;
      const result = await databaseService.removeFromWatchlist(itemId);
      
      if (result.success) {
        setInWatchlist(false);
        setWatchlistCategory(null);
        Alert.alert('Success', 'Removed from your watchlist');
      } else {
        Alert.alert('Error', 'Failed to remove from watchlist');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
    }
  };

  const handleWatchlistAction = () => {
    if (inWatchlist) {
      Alert.alert(
        'Remove from Watchlist',
        'Are you sure you want to remove this anime from your watchlist?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Remove', style: 'destructive', onPress: handleRemoveFromWatchlist }
        ]
      );
    } else {
      Alert.alert(
        'Add to Watchlist',
        'Choose a category:',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Plan to Watch', onPress: () => handleAddToWatchlist(WATCHLIST_CATEGORIES.PLAN_TO_WATCH) },
          { text: 'Watching', onPress: () => handleAddToWatchlist(WATCHLIST_CATEGORIES.WATCHING) }
        ]
      );
    }
  };

  const renderOverviewTab = () => (
    <View style={styles.tabContent}>
      {/* Synopsis */}
      <Card style={[styles.card, { backgroundColor: theme.colors.card }]}>
        <Card.Content>
          <Text variant="titleMedium" style={[styles.cardTitle, { color: theme.colors.text }]}>
            Synopsis
          </Text>
          <Text variant="bodyMedium" style={[styles.synopsis, { color: theme.colors.textSecondary }]}>
            {anime?.synopsis || 'No synopsis available.'}
          </Text>
        </Card.Content>
      </Card>

      {/* Information */}
      <Card style={[styles.card, { backgroundColor: theme.colors.card }]}>
        <Card.Content>
          <Text variant="titleMedium" style={[styles.cardTitle, { color: theme.colors.text }]}>
            Information
          </Text>
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text variant="bodySmall" style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>
                Type
              </Text>
              <Text variant="bodyMedium" style={[styles.infoValue, { color: theme.colors.text }]}>
                {anime?.type || 'Unknown'}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Text variant="bodySmall" style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>
                Episodes
              </Text>
              <Text variant="bodyMedium" style={[styles.infoValue, { color: theme.colors.text }]}>
                {anime?.episodes || 'Unknown'}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Text variant="bodySmall" style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>
                Status
              </Text>
              <Text variant="bodyMedium" style={[styles.infoValue, { color: theme.colors.text }]}>
                {anime?.status || 'Unknown'}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Text variant="bodySmall" style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>
                Aired
              </Text>
              <Text variant="bodyMedium" style={[styles.infoValue, { color: theme.colors.text }]}>
                {anime?.aired?.string || 'Unknown'}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Text variant="bodySmall" style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>
                Duration
              </Text>
              <Text variant="bodyMedium" style={[styles.infoValue, { color: theme.colors.text }]}>
                {anime?.duration || 'Unknown'}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Text variant="bodySmall" style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>
                Rating
              </Text>
              <Text variant="bodyMedium" style={[styles.infoValue, { color: theme.colors.text }]}>
                {anime?.rating || 'Unknown'}
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Genres */}
      {anime?.genres && anime.genres.length > 0 && (
        <Card style={[styles.card, { backgroundColor: theme.colors.card }]}>
          <Card.Content>
            <Text variant="titleMedium" style={[styles.cardTitle, { color: theme.colors.text }]}>
              Genres
            </Text>
            <View style={styles.genresContainer}>
              {anime.genres.map((genre, index) => (
                <Chip 
                  key={index}
                  mode="outlined" 
                  style={[styles.genreChip, { borderColor: theme.colors.primary }]}
                  textStyle={[styles.genreText, { color: theme.colors.primary }]}>
                  {genre.name}
                </Chip>
              ))}
            </View>
          </Card.Content>
        </Card>
      )}

      {/* Studios */}
      {anime?.studios && anime.studios.length > 0 && (
        <Card style={[styles.card, { backgroundColor: theme.colors.card }]}>
          <Card.Content>
            <Text variant="titleMedium" style={[styles.cardTitle, { color: theme.colors.text }]}>
              Studios
            </Text>
            <View style={styles.studiosContainer}>
              {anime.studios.map((studio, index) => (
                <Text key={index} variant="bodyMedium" style={[styles.studioName, { color: theme.colors.text }]}>
                  {studio.name}
                </Text>
              ))}
            </View>
          </Card.Content>
        </Card>
      )}
    </View>
  );

  const renderEpisodesTab = () => (
    <View style={styles.tabContent}>
      {episodes.length > 0 ? (
        episodes.map((episode, index) => (
          <Card key={index} style={[styles.episodeCard, { backgroundColor: theme.colors.card }]}>
            <Card.Content>
              <Text variant="titleSmall" style={[styles.episodeTitle, { color: theme.colors.text }]}>
                Episode {episode.number}: {episode.title}
              </Text>
              {episode.aired && (
                <Text variant="bodySmall" style={[styles.episodeAired, { color: theme.colors.textSecondary }]}>
                  Aired: {new Date(episode.aired).toLocaleDateString()}
                </Text>
              )}
              {episode.score && (
                <Text variant="bodySmall" style={[styles.episodeScore, { color: theme.colors.primary }]}>
                  Score: {episode.score}
                </Text>
              )}
            </Card.Content>
          </Card>
        ))
      ) : (
        <Card style={[styles.card, { backgroundColor: theme.colors.card }]}>
          <Card.Content>
            <Text variant="bodyMedium" style={[styles.noDataText, { color: theme.colors.textSecondary }]}>
              No episode information available.
            </Text>
          </Card.Content>
        </Card>
      )}
    </View>
  );

  const renderCharactersTab = () => (
    <View style={styles.tabContent}>
      {characters.length > 0 ? (
        <View style={styles.charactersGrid}>
          {characters.map((character, index) => (
            <Card key={index} style={[styles.characterCard, { backgroundColor: theme.colors.card }]}>
              <FastImage
                source={{ 
                  uri: character.image || 'https://via.placeholder.com/100x150',
                  priority: FastImage.priority.normal,
                }}
                style={styles.characterImage}
                resizeMode={FastImage.resizeMode.cover}
              />
              <Card.Content style={styles.characterInfo}>
                <Text variant="bodySmall" style={[styles.characterName, { color: theme.colors.text }]} numberOfLines={2}>
                  {character.name}
                </Text>
                <Text variant="bodySmall" style={[styles.characterRole, { color: theme.colors.textSecondary }]}>
                  {character.role}
                </Text>
              </Card.Content>
            </Card>
           ))}
        </View>
      ) : (
        <Card style={[styles.card, { backgroundColor: theme.colors.card }]}>
          <Card.Content>
            <Text variant="bodyMedium" style={[styles.noDataText, { color: theme.colors.textSecondary }]}>
              No character information available.
            </Text>
          </Card.Content>
        </Card>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <Text variant="bodyMedium" style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
          Loading anime details...
        </Text>
      </View>
    );
  }

  if (!anime) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: theme.colors.background }]}>
        <Text variant="titleLarge" style={[styles.errorText, { color: theme.colors.text }]}>
          Anime not found
        </Text>
        <Button onPress={() => navigation.goBack()}>Go Back</Button>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header with backdrop */}
        <View style={styles.header}>
          <FastImage
            source={{ 
              uri: anime.images?.jpg?.largeImageUrl || anime.images?.jpg?.imageUrl || 'https://via.placeholder.com/400x600',
              priority: FastImage.priority.high,
            }}
            style={styles.backdrop}
            resizeMode={FastImage.resizeMode.cover}
          />
          <LinearGradient
            colors={['transparent', theme.colors.background]}
            style={styles.gradient}
          />
          <View style={styles.headerContent}>
            <IconButton
              icon="arrow-left"
              size={24}
              iconColor="white"
              onPress={( ) => navigation.goBack()}
              style={styles.backButton}
            />
            <View style={styles.animeInfo}>
              <FastImage
                source={{ 
                  uri: anime.images?.jpg?.imageUrl || 'https://via.placeholder.com/150x200',
                  priority: FastImage.priority.high,
                }}
                style={styles.poster}
                resizeMode={FastImage.resizeMode.cover}
              />
              <View style={styles.animeDetails}>
                <Text variant="headlineSmall" style={[styles.animeTitle, { color: 'white' }]}>
                  {anime.title}
                </Text>
                {anime.titleEnglish && anime.titleEnglish !== anime.title && (
                  <Text variant="titleMedium" style={[styles.animeTitleEnglish, { color: 'rgba(255,255,255,0.8 )' }]}>
                    {anime.titleEnglish}
                  </Text>
                )}
                <View style={styles.animeStats}>
                  {anime.score && (
                    <View style={styles.statItem}>
                      <Text variant="bodySmall" style={[styles.statLabel, { color: 'rgba(255,255,255,0.7)' }]}>
                        Score
                      </Text>
                      <Text variant="titleMedium" style={[styles.statValue, { color: 'white' }]}>
                        {anime.score}
                      </Text>
                    </View>
                  )}
                  {anime.rank && (
                    <View style={styles.statItem}>
                      <Text variant="bodySmall" style={[styles.statLabel, { color: 'rgba(255,255,255,0.7)' }]}>
                        Rank
                      </Text>
                      <Text variant="titleMedium" style={[styles.statValue, { color: 'white' }]}>
                        #{anime.rank}
                      </Text>
                    </View>
                  )}
                  {anime.popularity && (
                    <View style={styles.statItem}>
                      <Text variant="bodySmall" style={[styles.statLabel, { color: 'rgba(255,255,255,0.7)' }]}>
                        Popularity
                      </Text>
                      <Text variant="titleMedium" style={[styles.statValue, { color: 'white' }]}>
                        #{anime.popularity}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <Button
            mode="contained"
            onPress={handleWatchlistAction}
            style={[styles.watchlistButton, { backgroundColor: inWatchlist ? theme.colors.accent : theme.colors.primary }]}>
            {inWatchlist ? `In Watchlist (${watchlistCategory})` : 'Add to Watchlist'}
          </Button>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <View style={styles.tabs}>
            <Button
              mode={activeTab === 'overview' ? 'contained' : 'text'}
              onPress={() => setActiveTab('overview')}
              style={[styles.tab, activeTab === 'overview' && { backgroundColor: theme.colors.primary }]}>
              <Text style={[styles.tabLabel, { color: activeTab === 'overview' ? 'white' : theme.colors.textSecondary }]}>Overview</Text>
            </Button>
            <Button
              mode={activeTab === 'episodes' ? 'contained' : 'text'}
              onPress={() => setActiveTab('episodes')}
              style={[styles.tab, activeTab === 'episodes' && { backgroundColor: theme.colors.primary }]}>
              <Text style={[styles.tabLabel, { color: activeTab === 'episodes' ? 'white' : theme.colors.textSecondary }]}>Episodes</Text>
            </Button>
            <Button
              mode={activeTab === 'characters' ? 'contained' : 'text'}
              onPress={() => setActiveTab('characters')}
              style={[styles.tab, activeTab === 'characters' && { backgroundColor: theme.colors.primary }]}>
              <Text style={[styles.tabLabel, { color: activeTab === 'characters' ? 'white' : theme.colors.textSecondary }]}>Characters</Text>
            </Button>
          </View>
        </View>

        {/* Tab Content */}
        {activeTab === 'overview' && renderOverviewTab()}
        {activeTab === 'episodes' && renderEpisodesTab()}
        {activeTab === 'characters' && renderCharactersTab()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    textAlign: 'center',
    marginBottom: 16,
  },
  header: {
    height: 300,
    position: 'relative',
  },
  backdrop: {
    width: '100%',
    height: '100%',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 150,
  },
  headerContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    padding: 16,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  animeInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  poster: {
    width: 100,
    height: 150,
    borderRadius: 8,
    marginRight: 16,
  },
  animeDetails: {
    flex: 1,
  },
  animeTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  animeTitleEnglish: {
    marginBottom: 8,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  animeStats: {
    flexDirection: 'row',
    gap: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 10,
    marginBottom: 2,
  },
  statValue: {
    fontWeight: 'bold',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  actionButtons: {
    padding: 16,
  },
  watchlistButton: {
    borderRadius: 8,
  },
  tabsContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  tabs: {
    flexDirection: 'row',
    gap: 8,
  },
  tab: {
    flex: 1,
    borderRadius: 8,
  },
  tabLabel: {
    fontSize: 12,
  },
  tabContent: {
    padding: 16,
    gap: 16,
  },
  card: {
    borderRadius: 12,
  },
  cardTitle: {
    fontWeight: 'bold',
    marginBottom: 12,
  },
  synopsis: {
    lineHeight: 20,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  infoItem: {
    width: '45%',
  },
  infoLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  infoValue: {
    fontWeight: '500',
  },
  genresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  genreChip: {
    marginBottom: 4,
  },
  genreText: {
    fontSize: 12,
  },
  studiosContainer: {
    gap: 4,
  },
  studioName: {
    fontWeight: '500',
  },
  episodeCard: {
    borderRadius: 8,
    marginBottom: 8,
  },
  episodeTitle: {
    fontWeight: '600',
    marginBottom: 4,
  },
  episodeAired: {
    fontSize: 12,
    marginBottom: 2,
  },
  episodeScore: {
    fontSize: 12,
    fontWeight: '500',
  },
  charactersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  characterCard: {
    width: (screenWidth - 56) / 3,
    borderRadius: 8,
  },
  characterImage: {
    width: '100%',
    height: 120,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  characterInfo: {
    padding: 8,
  },
  characterName: {
    fontWeight: '500',
    marginBottom: 2,
    lineHeight: 14,
  },
  characterRole: {
    fontSize: 10,
  },
  noDataText: {
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default AnimeDetailScreen;