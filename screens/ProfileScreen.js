import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, RefreshControl } from 'react-native';
import { Text, Card, Button, IconButton, Avatar, Divider, List, Switch } from 'react-native-paper';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import databaseService from '../services/databaseService';

const ProfileScreen = ({ navigation }) => {
  const { theme, isDarkMode, toggleTheme } = useTheme();
  const { user, userProfile, signOut, updateUserProfile } = useAuth();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      setLoading(true);
      
      // Load user statistics
      const statsResult = await databaseService.getUserStats();
      if (statsResult.success) {
        setStats(statsResult.data);
      }
    } catch (error) {
      console.error('Error loading profile data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadProfileData();
    setRefreshing(false);
  };

  const handleEditProfile = () => {
    navigation.navigate('EditProfile');
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
            } catch (error) {
              Alert.alert('Error', 'Failed to sign out');
            }
          }
        }
      ]
    );
  };

  const handleNotificationSettings = () => {
    navigation.navigate('NotificationSettings');
  };

  const handlePrivacySettings = () => {
    navigation.navigate('PrivacySettings');
  };

  const handleAbout = () => {
    navigation.navigate('About');
  };

  const handleSupport = () => {
    navigation.navigate('Support');
  };

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
        <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.text }]}>
          Profile
        </Text>
        <IconButton
          icon="cog"
          size={24}
          iconColor={theme.colors.text}
          onPress={() => navigation.navigate('Settings')}
        />
      </View>

      {/* Profile Info */}
      <Card style={[styles.profileCard, { backgroundColor: theme.colors.card }]}>
        <Card.Content>
          <View style={styles.profileHeader}>
            <Avatar.Text 
              size={80} 
              label={userProfile?.displayName?.charAt(0).toUpperCase() || 'U'}
              style={{ backgroundColor: theme.colors.primary }}
            />
            <View style={styles.profileInfo}>
              <Text variant="headlineSmall" style={[styles.displayName, { color: theme.colors.text }]}>
                {userProfile?.displayName || 'User'}
              </Text>
              <Text variant="bodyMedium" style={[styles.email, { color: theme.colors.textSecondary }]}>
                {user?.email}
              </Text>
              <Text variant="bodySmall" style={[styles.joinDate, { color: theme.colors.textSecondary }]}>
                Joined {userProfile?.createdAt ? new Date(userProfile.createdAt).toLocaleDateString() : 'Recently'}
              </Text>
            </View>
          </View>
          <Button
            mode="outlined"
            onPress={handleEditProfile}
            style={[styles.editButton, { borderColor: theme.colors.primary }]}
            labelStyle={{ color: theme.colors.primary }}
          >
            Edit Profile
          </Button>
        </Card.Content>
      </Card>

      {/* Statistics */}
      {stats && (
        <Card style={[styles.statsCard, { backgroundColor: theme.colors.card }]}>
          <Card.Content>
            <Text variant="titleLarge" style={[styles.cardTitle, { color: theme.colors.text }]}>
              My Statistics
            </Text>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text variant="headlineSmall" style={[styles.statNumber, { color: theme.colors.primary }]}>
                  {stats.totalAnimeWatched + stats.totalTVSeriesWatched}
                </Text>
                <Text variant="bodySmall" style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                  Total Shows
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text variant="headlineSmall" style={[styles.statNumber, { color: theme.colors.primary }]}>
                  {Math.round(stats.totalHoursWatched)}
                </Text>
                <Text variant="bodySmall" style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                  Hours Watched
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text variant="headlineSmall" style={[styles.statNumber, { color: theme.colors.primary }]}>
                  {stats.totalEpisodesWatched}
                </Text>
                <Text variant="bodySmall" style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                  Episodes
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text variant="headlineSmall" style={[styles.statNumber, { color: theme.colors.primary }]}>
                  {stats.clubsJoined}
                </Text>
                <Text variant="bodySmall" style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                  Clubs Joined
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>
      )}

      {/* Favorite Genres */}
      {userProfile?.favoriteGenres && userProfile.favoriteGenres.length > 0 && (
        <Card style={[styles.genresCard, { backgroundColor: theme.colors.card }]}>
          <Card.Content>
            <Text variant="titleLarge" style={[styles.cardTitle, { color: theme.colors.text }]}>
              Favorite Genres
            </Text>
            <View style={styles.genresContainer}>
              {userProfile.favoriteGenres.slice(0, 6).map((genre, index) => (
                <View key={index} style={[styles.genreChip, { backgroundColor: theme.colors.surfaceVariant }]}>
                  <Text variant="bodySmall" style={[styles.genreText, { color: theme.colors.text }]}>
                    {genre}
                  </Text>
                </View>
              ))}
            </View>
          </Card.Content>
        </Card>
      )}

      {/* Settings */}
      <Card style={[styles.settingsCard, { backgroundColor: theme.colors.card }]}>
        <Card.Content>
          <Text variant="titleLarge" style={[styles.cardTitle, { color: theme.colors.text }]}>
            Settings
          </Text>
          
          {/* Theme Toggle */}
          <List.Item
            title="Dark Mode"
            description="Switch between light and dark themes"
            titleStyle={{ color: theme.colors.text }}
            descriptionStyle={{ color: theme.colors.textSecondary }}
            left={(props) => <List.Icon {...props} icon="theme-light-dark" color={theme.colors.text} />}
            right={() => (
              <Switch
                value={isDarkMode}
                onValueChange={toggleTheme}
                color={theme.colors.primary}
              />
            )}
          />
          
          <Divider style={{ backgroundColor: theme.colors.outline, marginVertical: 8 }} />
          
          {/* Notifications */}
          <List.Item
            title="Notifications"
            description="Manage your notification preferences"
            titleStyle={{ color: theme.colors.text }}
            descriptionStyle={{ color: theme.colors.textSecondary }}
            left={(props) => <List.Icon {...props} icon="bell" color={theme.colors.text} />}
            right={(props) => <List.Icon {...props} icon="chevron-right" color={theme.colors.textSecondary} />}
            onPress={handleNotificationSettings}
          />
          
          <Divider style={{ backgroundColor: theme.colors.outline, marginVertical: 8 }} />
          
          {/* Privacy */}
          <List.Item
            title="Privacy"
            description="Control your privacy settings"
            titleStyle={{ color: theme.colors.text }}
            descriptionStyle={{ color: theme.colors.textSecondary }}
            left={(props) => <List.Icon {...props} icon="shield-account" color={theme.colors.text} />}
            right={(props) => <List.Icon {...props} icon="chevron-right" color={theme.colors.textSecondary} />}
            onPress={handlePrivacySettings}
          />
        </Card.Content>
      </Card>

      {/* Support */}
      <Card style={[styles.supportCard, { backgroundColor: theme.colors.card }]}>
        <Card.Content>
          <Text variant="titleLarge" style={[styles.cardTitle, { color: theme.colors.text }]}>
            Support
          </Text>
          
          {/* Help & Support */}
          <List.Item
            title="Help & Support"
            description="Get help with using the app"
            titleStyle={{ color: theme.colors.text }}
            descriptionStyle={{ color: theme.colors.textSecondary }}
            left={(props) => <List.Icon {...props} icon="help-circle" color={theme.colors.text} />}
            right={(props) => <List.Icon {...props} icon="chevron-right" color={theme.colors.textSecondary} />}
            onPress={handleSupport}
          />
          
          <Divider style={{ backgroundColor: theme.colors.outline, marginVertical: 8 }} />
          
          {/* About */}
          <List.Item
            title="About"
            description="App version and information"
            titleStyle={{ color: theme.colors.text }}
            descriptionStyle={{ color: theme.colors.textSecondary }}
            left={(props) => <List.Icon {...props} icon="information" color={theme.colors.text} />}
            right={(props) => <List.Icon {...props} icon="chevron-right" color={theme.colors.textSecondary} />}
            onPress={handleAbout}
          />
        </Card.Content>
      </Card>

      {/* Sign Out */}
      <View style={styles.signOutContainer}>
        <Button
          mode="outlined"
          onPress={handleSignOut}
          style={[styles.signOutButton, { borderColor: theme.colors.error }]}
          labelStyle={{ color: theme.colors.error }}
        >
          Sign Out
        </Button>
      </View>

      {/* Version Info */}
      <View style={styles.versionContainer}>
        <Text variant="bodySmall" style={[styles.versionText, { color: theme.colors.textSecondary }]}>
          Anime & TV Series Tracker v1.0.0
        </Text>
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
  title: {
    fontWeight: 'bold',
  },
  profileCard: {
    margin: 16,
    borderRadius: 12,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileInfo: {
    flex: 1,
    marginLeft: 16,
  },
  displayName: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  email: {
    marginBottom: 2,
  },
  joinDate: {
    fontSize: 12,
  },
  editButton: {
    borderRadius: 8,
  },
  statsCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
  },
  cardTitle: {
    fontWeight: 'bold',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  statItem: {
    width: '45%',
    alignItems: 'center',
    padding: 12,
  },
  statNumber: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    textAlign: 'center',
    fontSize: 12,
  },
  genresCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
  },
  genresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  genreChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  genreText: {
    fontSize: 12,
  },
  settingsCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
  },
  supportCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
  },
  signOutContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  signOutButton: {
    borderRadius: 8,
  },
  versionContainer: {
    alignItems: 'center',
    paddingBottom: 32,
  },
  versionText: {
    fontSize: 11,
  },
});

export default ProfileScreen;
