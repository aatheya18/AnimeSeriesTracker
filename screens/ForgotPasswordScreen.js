import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Text, TextInput, Button, IconButton, HelperText } from 'react-native-paper';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

const ForgotPasswordScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const { resetPassword } = useAuth();

  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const validateEmail = () => {
    if (!email.trim()) {
      setError('Email is required');
      return false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address');
      return false;
    }
    return true;
  };

  const handleEmailChange = (value) => {
    setEmail(value);
    if (error) {
      setError('');
    }
  };

  const handleResetPassword = async () => {
    if (!validateEmail()) return;

    setLoading(true);
    try {
      const result = await resetPassword(email.trim());
      
      if (result.success) {
        setEmailSent(true);
        Alert.alert(
          'Reset Email Sent',
          'Check your email for instructions to reset your password.',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('Login')
            }
          ]
        );
      } else {
        Alert.alert('Error', result.error || 'Failed to send reset email');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleBackToLogin = () => {
    navigation.navigate('Login');
  };

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <IconButton
            icon="arrow-left"
            size={24}
            iconColor={theme.colors.text}
            onPress={handleGoBack}
            style={styles.backButton}
          />
          <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.text }]}>
            Reset Password
          </Text>
          <Text variant="bodyLarge" style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            {emailSent 
              ? 'We\'ve sent you a password reset link'
              : 'Enter your email address and we\'ll send you a link to reset your password'
            }
          </Text>
        </View>

        {!emailSent ? (
          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <TextInput
                label="Email"
                value={email}
                onChangeText={handleEmailChange}
                mode="outlined"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                error={!!error}
                style={styles.input}
                theme={{ colors: { primary: theme.colors.primary } }}
              />
              <HelperText type="error" visible={!!error}>
                {error}
              </HelperText>
            </View>

            <Button
              mode="contained"
              onPress={handleResetPassword}
              loading={loading}
              disabled={loading || !email.trim()}
              style={[styles.resetButton, { backgroundColor: theme.colors.primary }]}
              labelStyle={styles.resetButtonText}
              contentStyle={styles.buttonContent}
            >
              Send Reset Link
            </Button>

            <View style={styles.infoContainer}>
              <Text variant="bodyMedium" style={[styles.infoText, { color: theme.colors.textSecondary }]}>
                Remember your password?{' '}
                <Text 
                  style={[styles.linkText, { color: theme.colors.primary }]}
                  onPress={handleBackToLogin}
                >
                  Back to Sign In
                </Text>
              </Text>
            </View>
          </View>
        ) : (
          <View style={styles.successContainer}>
            <View style={[styles.successIcon, { backgroundColor: theme.colors.success + '20' }]}>
              <Text style={[styles.successIconText, { color: theme.colors.success }]}>
                ✓
              </Text>
            </View>
            
            <Text variant="titleLarge" style={[styles.successTitle, { color: theme.colors.text }]}>
              Check Your Email
            </Text>
            
            <Text variant="bodyMedium" style={[styles.successText, { color: theme.colors.textSecondary }]}>
              We've sent a password reset link to:
            </Text>
            
            <Text variant="bodyLarge" style={[styles.emailText, { color: theme.colors.text }]}>
              {email}
            </Text>
            
            <Text variant="bodyMedium" style={[styles.instructionText, { color: theme.colors.textSecondary }]}>
              Click the link in the email to reset your password. If you don't see the email, check your spam folder.
            </Text>

            <Button
              mode="contained"
              onPress={handleBackToLogin}
              style={[styles.backToLoginButton, { backgroundColor: theme.colors.primary }]}
              labelStyle={styles.backToLoginButtonText}
              contentStyle={styles.buttonContent}
            >
              Back to Sign In
            </Button>

            <Button
              mode="text"
              onPress={() => setEmailSent(false)}
              style={styles.resendButton}
              labelStyle={[styles.resendButtonText, { color: theme.colors.primary }]}
            >
              Try Different Email
            </Button>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
  },
  header: {
    marginTop: 40,
    marginBottom: 40,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginLeft: -8,
    marginBottom: 16,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    lineHeight: 22,
  },
  form: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: 24,
  },
  input: {
    backgroundColor: 'transparent',
  },
  resetButton: {
    borderRadius: 12,
    marginBottom: 24,
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  buttonContent: {
    paddingVertical: 8,
  },
  infoContainer: {
    alignItems: 'center',
  },
  infoText: {
    textAlign: 'center',
  },
  linkText: {
    fontWeight: '600',
  },
  successContainer: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 40,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  successIconText: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  successTitle: {
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  successText: {
    textAlign: 'center',
    marginBottom: 8,
  },
  emailText: {
    fontWeight: '600',
    marginBottom: 24,
    textAlign: 'center',
  },
  instructionText: {
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 32,
  },
  backToLoginButton: {
    borderRadius: 12,
    marginBottom: 16,
    minWidth: 200,
  },
  backToLoginButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  resendButton: {
    marginTop: 8,
  },
  resendButtonText: {
    fontSize: 14,
  },
});

export default ForgotPasswordScreen;
