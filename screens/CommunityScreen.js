import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, FlatList } from 'react-native';
import { Text, Card, Button, IconButton, Chip, FAB, Searchbar } from 'react-native-paper';
import FastImage from 'react-native-fast-image';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import databaseService from '../services/databaseService';
import { useFocusEffect } from '@react-navigation/native';

const CommunityScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const { user, userProfile } = useAuth();

  const [userClubs, setUserClubs] = useState([]);
  const [popularClubs, setPopularClubs] = useState([]);
  const [recentDiscussions, setRecentDiscussions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('discover');

  useFocusEffect(
    useCallback(() => {
      loadCommunityData();
    }, [])
  );

  const loadCommunityData = async () => {
    try {
      setLoading(true);
      
      // Load user's clubs
      const userClubsResult = await databaseService.getUserClubs();
      if (userClubsResult.success) {
        setUserClubs(userClubsResult.data);
        
        // Load recent discussions from user's clubs
        const discussions = [];
        for (const club of userClubsResult.data.slice(0, 3)) {
          const discussionsResult = await databaseService.getClubDiscussions(club.id);
          if (discussionsResult.success) {
            discussions.push(...discussionsResult.data.slice(0, 2));
          }
        }
        setRecentDiscussions(discussions.slice(0, 10));
      }

      // Load popular clubs (search with empty term to get all public clubs)
      const popularClubsResult = await databaseService.searchClubs('');
      if (popularClubsResult.success) {
        // Sort by member count and take top 10
        const sortedClubs = popularClubsResult.data
          .sort((a, b) => (b.stats?.memberCount || 0) - (a.stats?.memberCount || 0))
          .slice(0, 10);
        setPopularClubs(sortedClubs);
      }
    } catch (error) {
      console.error('Error loading community data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadCommunityData();
    setRefreshing(false);
  };

  const handleSearch = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      const result = await databaseService.searchClubs(query.trim());
      if (result.success) {
        setSearchResults(result.data);
      }
    } catch (error) {
      console.error('Error searching clubs:', error);
    }
  };

  const handleCreateClub = () => {
    navigation.navigate('CreateClub');
  };

  const handleClubPress = (club) => {
    navigation.navigate('ClubDetail', { clubId: club.id, club });
  };

  const handleDiscussionPress = (discussion) => {
    navigation.navigate('DiscussionDetail', { discussionId: discussion.id, discussion });
  };

  const renderClubCard = (club, index) => (
    <Card 
      key={`club-${club.id}-${index}`}
      style={[styles.clubCard, { backgroundColor: theme.colors.card }]}>
      <View style={styles.clubCardContent}>
        <FastImage
          source={{ 
            uri: club.coverImage || 'https://via.placeholder.com/80x80',
            priority: FastImage.priority.normal,
          }}
          style={styles.clubImage}
          resizeMode={FastImage.resizeMode.cover}
        />
        <View style={styles.clubInfo}>
          <Text 
            variant="titleMedium" 
            style={[styles.clubName, { color: theme.colors.text }]}>
            {club.name}
          </Text>
          <Text 
            variant="bodySmall" 
            style={[styles.clubDescription, { color: theme.colors.textSecondary }]}>
            {club.description}
          </Text>
          <View style={styles.clubMeta}>
            <Chip 
              mode="outlined" 
              compact 
              style={[styles.categoryChip, { borderColor: theme.colors.primary }]}>
              {club.category}
            </Chip>
            <Text variant="bodySmall" style={[styles.memberCount, { color: theme.colors.textSecondary }]}>
              {club.stats?.memberCount || 0} members
            </Text>
          </View>
        </View>
      </View>
    </Card>
   );

  const renderDiscussionCard = (discussion, index) => (
    <Card 
      key={`discussion-${discussion.id}-${index}`}
      style={[styles.discussionCard, { backgroundColor: theme.colors.card }]}>
      <Card.Content>
        <View style={styles.discussionHeader}>
          <Text 
            variant="titleSmall" 
            style={[styles.discussionTitle, { color: theme.colors.text }]}>
            {discussion.title}
          </Text>
          {discussion.isPinned && (
            <IconButton
              icon="pin"
              size={16}
              iconColor={theme.colors.primary}
              style={styles.pinnedIcon}
            />
          )}
        </View>
        <Text 
          variant="bodySmall" 
          style={[styles.discussionContent, { color: theme.colors.textSecondary }]}>
          {discussion.content}
        </Text>
        <View style={styles.discussionMeta}>
          <Text variant="bodySmall" style={[styles.authorName, { color: theme.colors.textSecondary }]}>
            by {discussion.authorName}
          </Text>
          <View style={styles.discussionStats}>
            <Text variant="bodySmall" style={[styles.statText, { color: theme.colors.textSecondary }]}>
              {discussion.stats?.replyCount || 0} replies
            </Text>
            <Text variant="bodySmall" style={[styles.statText, { color: theme.colors.textSecondary }]}>
              {discussion.stats?.likeCount || 0} likes
            </Text>
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  const renderDiscoverTab = () => (
    <View style={styles.tabContent}>
      {/* Search */}
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search clubs..."
          onChangeText={(query) => {
            setSearchQuery(query);
            handleSearch(query);
          }}
          value={searchQuery}
          style={[styles.searchBar, { backgroundColor: theme.colors.surfaceVariant }]}>
          inputStyle={{ color: theme.colors.text }}
          iconColor={theme.colors.textSecondary}
          placeholderTextColor={theme.colors.textSecondary}
        />
      </View>

      {searchQuery.trim() ? (
        // Search Results
        <View style={styles.section}>
          <Text variant="titleLarge" style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Search Results
          </Text>
          {searchResults.length > 0 ? (
            <View style={styles.clubsList}>
              {searchResults.map(renderClubCard)}
            </View>
          ) : (
            <Card style={[styles.emptyCard, { backgroundColor: theme.colors.card }]}>
              <Text variant="bodyMedium" style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                No clubs found matching your search
              </Text>
            </Card>
          )}
        </View>
      ) : (
        <>
          {/* Popular Clubs */}
          <View style={styles.section}>
            <Text variant="titleLarge" style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Popular Clubs
            </Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}>
              {popularClubs.map((club, index) => (
                <Card 
                  key={`popular-${club.id}-${index}`}
                  style={[styles.popularClubCard, { backgroundColor: theme.colors.card }]}>
                  <FastImage
                    source={{ 
                      uri: club.coverImage || 'https://via.placeholder.com/150x100',
                      priority: FastImage.priority.normal,
                    }}
                    style={styles.popularClubImage}
                    resizeMode={FastImage.resizeMode.cover}
                  />
                  <Card.Content style={styles.popularClubInfo}>
                    <Text 
                      variant="titleSmall" 
                      style={[styles.popularClubName, { color: theme.colors.text }]}>
                      {club.name}
                    </Text>
                    <Text variant="bodySmall" style={[styles.popularClubMembers, { color: theme.colors.textSecondary }]}>
                      {club.stats?.memberCount || 0} members
                    </Text>
                  </Card.Content>
                </Card>
               ))}
            </ScrollView>
          </View>

          {/* Categories */}
          <View style={styles.section}>
            <Text variant="titleLarge" style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Browse by Category
            </Text>
            <View style={styles.categoriesGrid}>
              {['anime', 'tv_series', 'general'].map((category) => (
                <Card 
                  key={category}
                  style={[styles.categoryCard, { backgroundColor: theme.colors.card }]}>
                  <Card.Content style={styles.categoryContent}>
                    <Text variant="titleMedium" style={[styles.categoryName, { color: theme.colors.text }]}>
                      {category.charAt(0).toUpperCase() + category.slice(1).replace('_', ' ')}
                    </Text>
                  </Card.Content>
                </Card>
              ))}
            </View>
          </View>
        </>
      )}
    </View>
  );

  const renderMyClubsTab = () => (
    <View style={styles.tabContent}>
      {userClubs.length > 0 ? (
        <>
          {/* My Clubs */}
          <View style={styles.section}>
            <Text variant="titleLarge" style={[styles.sectionTitle, { color: theme.colors.text }]}>
              My Clubs ({userClubs.length})
            </Text>
            <View style={styles.clubsList}>
              {userClubs.map(renderClubCard)}
            </View>
          </View>

          {/* Recent Discussions */}
          {recentDiscussions.length > 0 && (
            <View style={styles.section}>
              <Text variant="titleLarge" style={[styles.sectionTitle, { color: theme.colors.text }]}>
                Recent Discussions
              </Text>
              <View style={styles.discussionsList}>
                {recentDiscussions.map(renderDiscussionCard)}
              </View>
            </View>
          )}
        </>
      ) : (
        <View style={styles.emptyContainer}>
          <Text variant="headlineSmall" style={[styles.emptyTitle, { color: theme.colors.text }]}>
            No Clubs Yet
          </Text>
          <Text variant="bodyMedium" style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
            Join clubs to connect with other fans and participate in discussions
          </Text>
          <Button 
            mode="contained" 
            onPress={() => setActiveTab('discover')}
            style={[styles.exploreButton, { backgroundColor: theme.colors.primary }]}>
            Discover Clubs
          </Button>
        </View>
      )}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.text }]}>
          Community
        </Text>
        <IconButton
          icon="bell-outline"
          size={24}
          iconColor={theme.colors.text}
          onPress={() => navigation.navigate('Notifications')}
        />
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <View style={styles.tabs}>
          {['discover', 'my-clubs'].map((tab) => (
            <Button
              key={tab}
              mode={activeTab === tab ? 'contained' : 'text'}
              onPress={() => setActiveTab(tab)}
              style={[styles.tab, activeTab === tab && { backgroundColor: theme.colors.primary }]}>
              <Text style={[styles.tabLabel, {
                  color: activeTab === tab ? 'white' : theme.colors.textSecondary,
                }]}>
                {tab === 'discover' ? 'Discover' : 'My Clubs'}
              </Text>
            </Button>
          ))}
        </View>
      </View>

      {/* Content */}
      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}>
        {activeTab === 'discover' && renderDiscoverTab()}
        {activeTab === 'my-clubs' && renderMyClubsTab()}
      </ScrollView>

      {/* Floating Action Button */}
      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}>
        onPress={handleCreateClub}
        label="Create Club"
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
  content: {
    flex: 1,
  },
  tabContent: {
    paddingBottom: 100, // Space for FAB
  },
  searchContainer: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  searchBar: {
    elevation: 0,
    shadowOpacity: 0,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontWeight: 'bold',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  horizontalList: {
    paddingHorizontal: 16,
    gap: 12,
  },
  popularClubCard: {
    width: 150,
    borderRadius: 8,
  },
  popularClubImage: {
    width: '100%',
    height: 80,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  popularClubInfo: {
    padding: 8,
  },
  popularClubName: {
    fontWeight: '600',
    marginBottom: 2,
  },
  popularClubMembers: {
    fontSize: 11,
  },
  categoriesGrid: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
  },
  categoryCard: {
    flex: 1,
    borderRadius: 8,
  },
  categoryContent: {
    padding: 16,
    alignItems: 'center',
  },
  categoryName: {
    fontWeight: '600',
  },
    clubsList: {
    paddingHorizontal: 16,
    gap: 12,
  },
  clubCard: {
    borderRadius: 12,
  },
  clubCardContent: {
    flexDirection: 'row',
    padding: 12,
  },
  clubImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  clubInfo: {
    flex: 1,
  },
  clubName: {
    fontWeight: '600',
    marginBottom: 4,
  },
  clubDescription: {
    lineHeight: 16,
    marginBottom: 8,
  },
  clubMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categoryChip: {
    height: 24,
  },
  chipText: {
    fontSize: 10,
  },
  memberCount: {
    fontSize: 11,
  },
  discussionsList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  discussionCard: {
    borderRadius: 8,
  },
  discussionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  discussionTitle: {
    flex: 1,
    fontWeight: '600',
    lineHeight: 18,
  },
  pinnedIcon: {
    margin: 0,
    marginLeft: 8,
  },
  discussionContent: {
    lineHeight: 16,
    marginBottom: 8,
  },
  discussionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  authorName: {
    fontSize: 11,
  },
  discussionStats: {
    flexDirection: 'row',
    gap: 12,
  },
  statText: {
    fontSize: 11,
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
  emptyCard: {
    marginHorizontal: 16,
    padding: 24,
    alignItems: 'center',
    borderRadius: 12,
  },
  exploreButton: {
    borderRadius: 8,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

export default CommunityScreen;