import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { useTheme } from '../context/ThemeContext';

// Tab Screens
import HomeNavigator from './HomeNavigator';
import WatchlistNavigator from './WatchlistNavigator';
import CommunityNavigator from './CommunityNavigator';
import ProfileNavigator from './ProfileNavigator';

// Modal Screens
import SearchScreen from '../screens/SearchScreen';
import AnimeDetailScreen from '../screens/AnimeDetailScreen';
import TVSeriesDetailScreen from '../screens/TVSeriesDetailScreen';
import ClubDetailScreen from '../screens/ClubDetailScreen';
import DiscussionDetailScreen from '../screens/DiscussionDetailScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const TabNavigator = () => {
  const { theme } = useTheme();

  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          switch (route.name) {
            case 'Home':
              iconName = 'home';
              break;
            case 'Watchlist':
              iconName = 'bookmark';
              break;
            case 'Community':
              iconName = 'people';
              break;
            case 'Profile':
              iconName = 'person';
              break;
            default:
              iconName = 'help';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.tabBarActive,
        tabBarInactiveTintColor: theme.colors.tabBarInactive,
        tabBarStyle: {
          backgroundColor: theme.colors.tabBarBackground,
          borderTopColor: theme.colors.border,
          borderTopWidth: 1,
          paddingTop: 8,
          paddingBottom: 8,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: theme.fontSize.xs,
          fontWeight: theme.fontWeight.medium,
          marginTop: 4,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeNavigator}
        options={{
          tabBarLabel: 'Home',
        }}
      />
      <Tab.Screen 
        name="Watchlist" 
        component={WatchlistNavigator}
        options={{
          tabBarLabel: 'Watchlist',
        }}
      />
      <Tab.Screen 
        name="Community" 
        component={CommunityNavigator}
        options={{
          tabBarLabel: 'Community',
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileNavigator}
        options={{
          tabBarLabel: 'Profile',
        }}
      />
    </Tab.Navigator>
  );
};

const MainNavigator = () => {
  const { theme } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.surface,
        },
        headerTintColor: theme.colors.text,
        headerTitleStyle: {
          fontWeight: theme.fontWeight.semibold,
          fontSize: theme.fontSize.lg,
        },
        headerShadowVisible: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen 
        name="Tabs" 
        component={TabNavigator}
        options={{ headerShown: false }}
      />
      
      {/* Modal Screens */}
      <Stack.Screen 
        name="Search" 
        component={SearchScreen}
        options={{
          title: 'Search',
          presentation: 'modal',
        }}
      />
      <Stack.Screen 
        name="AnimeDetail" 
        component={AnimeDetailScreen}
        options={{
          title: 'Anime Details',
        }}
      />
      <Stack.Screen 
        name="TVSeriesDetail" 
        component={TVSeriesDetailScreen}
        options={{
          title: 'TV Series Details',
        }}
      />
      <Stack.Screen 
        name="ClubDetail" 
        component={ClubDetailScreen}
        options={{
          title: 'Club Details',
        }}
      />
      <Stack.Screen 
        name="DiscussionDetail" 
        component={DiscussionDetailScreen}
        options={{
          title: 'Discussion',
        }}
      />
      <Stack.Screen 
        name="Notifications" 
        component={NotificationsScreen}
        options={{
          title: 'Notifications',
        }}
      />
      <Stack.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{
          title: 'Settings',
        }}
      />
    </Stack.Navigator>
  );
};

export default MainNavigator;
