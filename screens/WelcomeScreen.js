import React from 'react';
import { View, StyleSheet, ScrollView, Image } from 'react-native';
import { Text, Button } from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '../../context/ThemeContext';

const WelcomeScreen = ({ navigation }) => {
  const { theme } = useTheme();

  const handleGetStarted = () => {
    navigation.navigate('SignUp');
  };

  const handleSignIn = () => {
    navigation.navigate('Login');
  };

  return (
    <LinearGradient
      colors={[theme.colors.primary, theme.colors.primaryDark]}
      style={styles.container}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.logoContainer}>
          {/* You can replace this with your app logo */}
          <View style={[styles.logoPlaceholder, { backgroundColor: theme.colors.surface }]}>
            <Text variant="headlineLarge" style={[styles.logoText, { color: theme.colors.primary }]}>
              AT
            </Text>
          </View>
          <Text variant="headlineMedium" style={styles.appName}>
            Anime Tracker
          </Text>
          <Text variant="bodyLarge" style={styles.tagline}>
            Track your favorite anime & TV series
          </Text>
        </View>

        <View style={styles.featuresContainer}>
          <View style={styles.feature}>
            <Text variant="titleMedium" style={styles.featureTitle}>
              📺 Track Progress
            </Text>
            <Text variant="bodyMedium" style={styles.featureDescription}>
              Keep track of episodes watched and your viewing progress
            </Text>
          </View>

          <View style={styles.feature}>
            <Text variant="titleMedium" style={styles.featureTitle}>
              👥 Join Communities
            </Text>
            <Text variant="bodyMedium" style={styles.featureDescription}>
              Connect with fans and discuss your favorite shows
            </Text>
          </View>

          <View style={styles.feature}>
            <Text variant="titleMedium" style={styles.featureTitle}>
              🔔 Never Miss Episodes
            </Text>
            <Text variant="bodyMedium" style={styles.featureDescription}>
              Get notified when new episodes are released
            </Text>
          </View>

          <View style={styles.feature}>
            <Text variant="titleMedium" style={styles.featureTitle}>
              📊 Analytics & Stats
            </Text>
            <Text variant="bodyMedium" style={styles.featureDescription}>
              View your watching history and discover new favorites
            </Text>
          </View>
        </View>

        <View style={styles.buttonsContainer}>
          <Button
            mode="contained"
            onPress={handleGetStarted}
            style={[styles.button, styles.primaryButton, { backgroundColor: theme.colors.surface }]}
            labelStyle={[styles.buttonLabel, { color: theme.colors.primary }]}
            contentStyle={styles.buttonContent}
          >
            Get Started
          </Button>

          <Button
            mode="outlined"
            onPress={handleSignIn}
            style={[styles.button, styles.secondaryButton]}
            labelStyle={[styles.buttonLabel, { color: theme.colors.surface }]}
            contentStyle={styles.buttonContent}
          >
            Sign In
          </Button>
        </View>

        <View style={styles.footer}>
          <Text variant="bodySmall" style={styles.footerText}>
            By continuing, you agree to our Terms of Service and Privacy Policy
          </Text>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoText: {
    fontWeight: 'bold',
  },
  appName: {
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  tagline: {
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  featuresContainer: {
    marginBottom: 48,
  },
  feature: {
    marginBottom: 24,
    alignItems: 'center',
  },
  featureTitle: {
    color: 'white',
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  featureDescription: {
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 20,
  },
  buttonsContainer: {
    marginBottom: 32,
  },
  button: {
    marginBottom: 16,
    borderRadius: 12,
  },
  primaryButton: {
    elevation: 0,
    shadowOpacity: 0,
  },
  secondaryButton: {
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderWidth: 1,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default WelcomeScreen;
