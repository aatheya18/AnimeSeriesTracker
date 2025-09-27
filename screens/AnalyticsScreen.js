import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Dimensions } from 'react-native';
import { Text, Card, IconButton, Chip, SegmentedButtons } from 'react-native-paper';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import databaseService from '../services/databaseService';

const { width: screenWidth } = Dimensions.get('window');
const chartWidth = screenWidth - 32;

const AnalyticsScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const { user, userProfile } = useAuth();

  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState('month');

  const timeRangeOptions = [
    { value: 'week', label: 'Week' },
    { value: 'month', label: 'Month' },
    { value: 'year', label: 'Year' },
    { value: 'all', label: 'All Time' },
  ];

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const result = await databaseService.getUserAnalytics(timeRange);
      
      if (result.success) {
        setAnalytics(result.data);
      } else {
        console.error('Error loading analytics:', result.error);
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAnalytics();
    setRefreshing(false);
  };

  const chartConfig = {
    backgroundColor: theme.colors.card,
    backgroundGradientFrom: theme.colors.card,
    backgroundGradientTo: theme.colors.card,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(${theme.colors.primary.replace('#', '').match(/.{2}/g).map(hex => parseInt(hex, 16)).join(', ')}, ${opacity})`,
    labelColor: (opacity = 1) => theme.colors.text,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: theme.colors.primary,
    },
  };

  const renderWatchingProgressChart = () => {
    if (!analytics?.watchingProgress) return null;

    const data = {
      labels: analytics.watchingProgress.map(item => item.date.substring(5)), // MM-DD format
      datasets: [{
        data: analytics.watchingProgress.map(item => item.episodesWatched),
        color: (opacity = 1) => theme.colors.primary,
        strokeWidth: 2,
      }],
    };

    return (
      <Card style={[styles.chartCard, { backgroundColor: theme.colors.card }]}>
        <Card.Content>
          <Text variant="titleLarge" style={[styles.chartTitle, { color: theme.colors.text }]}>
            Watching Progress
          </Text>
          <Text variant="bodySmall" style={[styles.chartSubtitle, { color: theme.colors.textSecondary }]}>
            Episodes watched over time
          </Text>
          <View style={styles.chartContainer}>
            <LineChart
              data={data}
              width={chartWidth - 32}
              height={200}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
            />
          </View>
        </Card.Content>
      </Card>
    );
  };

  const renderGenreDistributionChart = () => {
    if (!analytics?.genreDistribution) return null;

    const colors = [
      theme.colors.primary,
      theme.colors.secondary,
      theme.colors.tertiary,
      '#FF6B6B',
      '#4ECDC4',
      '#45B7D1',
      '#96CEB4',
      '#FFEAA7',
    ];

    const data = analytics.genreDistribution.map((genre, index) => ({
      name: genre.name,
      count: genre.count,
      color: colors[index % colors.length],
      legendFontColor: theme.colors.text,
      legendFontSize: 12,
    }));

    return (
      <Card style={[styles.chartCard, { backgroundColor: theme.colors.card }]}>
        <Card.Content>
          <Text variant="titleLarge" style={[styles.chartTitle, { color: theme.colors.text }]}>
            Favorite Genres
          </Text>
          <Text variant="bodySmall" style={[styles.chartSubtitle, { color: theme.colors.textSecondary }]}>
            Distribution of genres in your watchlist
          </Text>
          <View style={styles.chartContainer}>
            <PieChart
              data={data}
              width={chartWidth - 32}
              height={200}
              chartConfig={chartConfig}
              accessor="count"
              backgroundColor="transparent"
              paddingLeft="15"
              style={styles.chart}
            />
          </View>
        </Card.Content>
      </Card>
    );
  };

  const renderWatchlistStatusChart = () => {
    if (!analytics?.watchlistStatus) return null;

    const data = {
      labels: analytics.watchlistStatus.map(item => item.status),
      datasets: [{
        data: analytics.watchlistStatus.map(item => item.count),
      }],
    };

    return (
      <Card style={[styles.chartCard, { backgroundColor: theme.colors.card }]}>
        <Card.Content>
          <Text variant="titleLarge" style={[styles.chartTitle, { color: theme.colors.text }]}>
            Watchlist Status
          </Text>
          <Text variant="bodySmall" style={[styles.chartSubtitle, { color: theme.colors.textSecondary }]}>
            Shows by category
          </Text>
          <View style={styles.chartContainer}>
            <BarChart
              data={data}
              width={chartWidth - 32}
              height={200}
              chartConfig={chartConfig}
              style={styles.chart}
              showValuesOnTopOfBars
            />
          </View>
        </Card.Content>
      </Card>
    );
  };

  const renderStatsOverview = () => {
    if (!analytics?.overview) return null;

    const stats = [
      {
        title: 'Total Shows',
        value: analytics.overview.totalShows,
        icon: 'television',
        color: theme.colors.primary,
      },
      {
        title: 'Hours Watched',
        value: Math.round(analytics.overview.totalHours),
        icon: 'clock',
        color: theme.colors.secondary,
      },
      {
        title: 'Episodes',
        value: analytics.overview.totalEpisodes,
        icon: 'play-circle',
        color: theme.colors.tertiary,
      },
      {
        title: 'Avg Rating',
        value: analytics.overview.averageRating?.toFixed(1) || 'N/A',
        icon: 'star',
        color: '#FFD700',
      },
    ];

    return (
      <View style={styles.statsGrid}>
        {stats.map((stat, index) => (
          <Card key={index} style={[styles.statCard, { backgroundColor: theme.colors.card }]}>
            <Card.Content style={styles.statContent}>
              <IconButton
                icon={stat.icon}
                size={24}
                iconColor={stat.color}
                style={styles.statIcon}
              />
              <Text variant="headlineSmall" style={[styles.statValue, { color: theme.colors.text }]}>
                {stat.value}
              </Text>
              <Text variant="bodySmall" style={[styles.statTitle, { color: theme.colors.textSecondary }]}>
                {stat.title}
              </Text>
            </Card.Content>
          </Card>
        ))}
      </View>
    );
  };

  const renderTopShows = () => {
    if (!analytics?.topShows) return null;

    return (
      <Card style={[styles.chartCard, { backgroundColor: theme.colors.card }]}>
        <Card.Content>
          <Text variant="titleLarge" style={[styles.chartTitle, { color: theme.colors.text }]}>
            Top Rated Shows
          </Text>
          <Text variant="bodySmall" style={[styles.chartSubtitle, { color: theme.colors.textSecondary }]}>
            Your highest rated shows
          </Text>
          <View style={styles.topShowsList}>
            {analytics.topShows.slice(0, 5).map((show, index) => (
              <View key={index} style={styles.topShowItem}>
                <View style={styles.topShowRank}>
                  <Text variant="titleMedium" style={[styles.rankNumber, { color: theme.colors.primary }]}>
                    {index + 1}
                  </Text>
                </View>
                <View style={styles.topShowInfo}>
                  <Text variant="titleSmall" style={[styles.showTitle, { color: theme.colors.text }]} numberOfLines={1}>
                    {show.title}
                  </Text>
                  <Text variant="bodySmall" style={[styles.showType, { color: theme.colors.textSecondary }]}>
                    {show.contentType === 'anime' ? 'Anime' : 'TV Series'}
                  </Text>
                </View>
                <View style={styles.topShowRating}>
                  <Text variant="titleSmall" style={[styles.ratingValue, { color: theme.colors.primary }]}>
                    {show.rating}/10
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </Card.Content>
      </Card>
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
          Analytics
        </Text>
      </View>

      {/* Time Range Filter */}
      <View style={styles.filterContainer}>
        <SegmentedButtons
          value={timeRange}
          onValueChange={setTimeRange}
          buttons={timeRangeOptions}
          style={styles.segmentedButtons}
        />
      </View>

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
              Loading analytics...
            </Text>
          </View>
        ) : analytics ? (
          <>
            {/* Stats Overview */}
            {renderStatsOverview()}

            {/* Watching Progress Chart */}
            {renderWatchingProgressChart()}

            {/* Watchlist Status Chart */}
            {renderWatchlistStatusChart()}

            {/* Genre Distribution Chart */}
            {renderGenreDistributionChart()}

            {/* Top Shows */}
            {renderTopShows()}
          </>
        ) : (
          <View style={styles.emptyContainer}>
            <IconButton
              icon="chart-line"
              size={64}
              iconColor={theme.colors.textSecondary}
              style={styles.emptyIcon}
            />
            <Text variant="titleLarge" style={[styles.emptyTitle, { color: theme.colors.text }]}>
              No Analytics Data
            </Text>
            <Text variant="bodyMedium" style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
              Start watching shows and rating them to see your analytics here
            </Text>
          </View>
        )}
      </ScrollView>
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
  filterContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  segmentedButtons: {
    backgroundColor: 'transparent',
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
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    width: (screenWidth - 56) / 2,
    borderRadius: 12,
  },
  statContent: {
    alignItems: 'center',
    padding: 16,
  },
  statIcon: {
    margin: 0,
    marginBottom: 8,
  },
  statValue: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statTitle: {
    textAlign: 'center',
    fontSize: 12,
  },
  chartCard: {
    marginHorizontal: 16,
    marginBottom: 24,
    borderRadius: 12,
  },
  chartTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  chartSubtitle: {
    marginBottom: 16,
  },
  chartContainer: {
    alignItems: 'center',
  },
  chart: {
    borderRadius: 8,
  },
  topShowsList: {
    gap: 12,
  },
  topShowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  topShowRank: {
    width: 32,
    alignItems: 'center',
    marginRight: 12,
  },
  rankNumber: {
    fontWeight: 'bold',
  },
  topShowInfo: {
    flex: 1,
  },
  showTitle: {
    fontWeight: '600',
    marginBottom: 2,
  },
  showType: {
    fontSize: 11,
  },
  topShowRating: {
    alignItems: 'center',
  },
  ratingValue: {
    fontWeight: 'bold',
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

export default AnalyticsScreen;
