import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Text, TextInput, Button, IconButton, HelperText, Checkbox } from 'react-native-paper';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

const SignUpScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const { signUp } = useAuth();

  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    // Display name validation
    if (!formData.displayName.trim()) {
      newErrors.displayName = 'Display name is required';
    } else if (formData.displayName.trim().length < 2) {
      newErrors.displayName = 'Display name must be at least 2 characters';
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Terms agreement validation
    if (!agreeToTerms) {
      newErrors.terms = 'You must agree to the Terms of Service and Privacy Policy';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const handleSignUp = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const result = await signUp(
        formData.email.trim(), 
        formData.password, 
        formData.displayName.trim()
      );
      
      if (!result.success) {
        Alert.alert('Sign Up Failed', result.error || 'An error occurred during sign up');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = () => {
    navigation.navigate('Login');
  };

  const handleGoBack = () => {
    navigation.goBack();
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
            Create Account
          </Text>
          <Text variant="bodyLarge" style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            Join the community and start tracking your favorite shows
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <TextInput
              label="Display Name"
              value={formData.displayName}
              onChangeText={(value) => handleInputChange('displayName', value)}
              mode="outlined"
              autoCapitalize="words"
              autoComplete="name"
              error={!!errors.displayName}
              style={styles.input}
              theme={{ colors: { primary: theme.colors.primary } }}
            />
            <HelperText type="error" visible={!!errors.displayName}>
              {errors.displayName}
            </HelperText>
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              label="Email"
              value={formData.email}
              onChangeText={(value) => handleInputChange('email', value)}
              mode="outlined"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              error={!!errors.email}
              style={styles.input}
              theme={{ colors: { primary: theme.colors.primary } }}
            />
            <HelperText type="error" visible={!!errors.email}>
              {errors.email}
            </HelperText>
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              label="Password"
              value={formData.password}
              onChangeText={(value) => handleInputChange('password', value)}
              mode="outlined"
              secureTextEntry={!showPassword}
              autoComplete="new-password"
              error={!!errors.password}
              style={styles.input}
              theme={{ colors: { primary: theme.colors.primary } }}
              right={
                <TextInput.Icon
                  icon={showPassword ? 'eye-off' : 'eye'}
                  onPress={() => setShowPassword(!showPassword)}
                />
              }
            />
            <HelperText type="error" visible={!!errors.password}>
              {errors.password}
            </HelperText>
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              label="Confirm Password"
              value={formData.confirmPassword}
              onChangeText={(value) => handleInputChange('confirmPassword', value)}
              mode="outlined"
              secureTextEntry={!showConfirmPassword}
              autoComplete="new-password"
              error={!!errors.confirmPassword}
              style={styles.input}
              theme={{ colors: { primary: theme.colors.primary } }}
              right={
                <TextInput.Icon
                  icon={showConfirmPassword ? 'eye-off' : 'eye'}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                />
              }
            />
            <HelperText type="error" visible={!!errors.confirmPassword}>
              {errors.confirmPassword}
            </HelperText>
          </View>

          <View style={styles.checkboxContainer}>
            <Checkbox
              status={agreeToTerms ? 'checked' : 'unchecked'}
              onPress={() => {
                setAgreeToTerms(!agreeToTerms);
                if (errors.terms) {
                  setErrors(prev => ({ ...prev, terms: null }));
                }
              }}
              color={theme.colors.primary}
            />
            <Text 
              variant="bodyMedium" 
              style={[styles.checkboxText, { color: theme.colors.textSecondary }]}
              onPress={() => setAgreeToTerms(!agreeToTerms)}
            >
              I agree to the{' '}
              <Text style={[styles.linkText, { color: theme.colors.primary }]}>
                Terms of Service
              </Text>
              {' '}and{' '}
              <Text style={[styles.linkText, { color: theme.colors.primary }]}>
                Privacy Policy
              </Text>
            </Text>
          </View>
          <HelperText type="error" visible={!!errors.terms}>
            {errors.terms}
          </HelperText>

          <Button
            mode="contained"
            onPress={handleSignUp}
            loading={loading}
            disabled={loading}
            style={[styles.signUpButton, { backgroundColor: theme.colors.primary }]}
            labelStyle={styles.signUpButtonText}
            contentStyle={styles.buttonContent}
          >
            Create Account
          </Button>
        </View>

        <View style={styles.footer}>
          <Text variant="bodyMedium" style={[styles.footerText, { color: theme.colors.textSecondary }]}>
            Already have an account?{' '}
            <Text 
              style={[styles.linkText, { color: theme.colors.primary }]}
              onPress={handleSignIn}
            >
              Sign In
            </Text>
          </Text>
        </View>
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
    marginBottom: 32,
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
    marginBottom: 16,
  },
  input: {
    backgroundColor: 'transparent',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    marginTop: 8,
  },
  checkboxText: {
    flex: 1,
    marginLeft: 8,
    lineHeight: 20,
  },
  linkText: {
    fontWeight: '600',
  },
  signUpButton: {
    borderRadius: 12,
    marginTop: 16,
    marginBottom: 24,
  },
  signUpButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  buttonContent: {
    paddingVertical: 8,
  },
  footer: {
    alignItems: 'center',
    paddingTop: 24,
  },
  footerText: {
    textAlign: 'center',
  },
});

export default SignUpScreen;
