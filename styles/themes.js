import { DefaultTheme, DarkTheme } from '@react-navigation/native';

// Color palette
const colors = {
  // Primary colors
  primary: '#6366f1', // Indigo
  primaryLight: '#818cf8',
  primaryDark: '#4f46e5',
  
  // Secondary colors
  secondary: '#ec4899', // Pink
  secondaryLight: '#f472b6',
  secondaryDark: '#db2777',
  
  // Accent colors
  accent: '#10b981', // Emerald
  accentLight: '#34d399',
  accentDark: '#059669',
  
  // Success, Warning, Error
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  
  // Neutral colors
  white: '#ffffff',
  black: '#000000',
  
  // Light theme grays
  gray50: '#f9fafb',
  gray100: '#f3f4f6',
  gray200: '#e5e7eb',
  gray300: '#d1d5db',
  gray400: '#9ca3af',
  gray500: '#6b7280',
  gray600: '#4b5563',
  gray700: '#374151',
  gray800: '#1f2937',
  gray900: '#111827',
  
  // Dark theme grays
  darkGray50: '#18181b',
  darkGray100: '#27272a',
  darkGray200: '#3f3f46',
  darkGray300: '#52525b',
  darkGray400: '#71717a',
  darkGray500: '#a1a1aa',
  darkGray600: '#d4d4d8',
  darkGray700: '#e4e4e7',
  darkGray800: '#f4f4f5',
  darkGray900: '#fafafa',
};

// Light theme
export const lightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.primary,
    primaryLight: colors.primaryLight,
    primaryDark: colors.primaryDark,
    secondary: colors.secondary,
    accent: colors.accent,
    success: colors.success,
    warning: colors.warning,
    error: colors.error,
    
    // Background colors
    background: colors.white,
    surface: colors.white,
    surfaceVariant: colors.gray50,
    
    // Text colors
    text: colors.gray900,
    textSecondary: colors.gray600,
    textTertiary: colors.gray500,
    
    // Border colors
    border: colors.gray200,
    borderLight: colors.gray100,
    
    // Card colors
    card: colors.white,
    cardElevated: colors.white,
    
    // Navigation colors
    tabBarBackground: colors.white,
    tabBarActive: colors.primary,
    tabBarInactive: colors.gray400,
    
    // Input colors
    inputBackground: colors.gray50,
    inputBorder: colors.gray300,
    inputText: colors.gray900,
    placeholder: colors.gray400,
    
    // Button colors
    buttonPrimary: colors.primary,
    buttonSecondary: colors.gray100,
    buttonText: colors.white,
    buttonTextSecondary: colors.gray700,
    
    // Status colors
    online: colors.success,
    offline: colors.gray400,
    
    // Overlay colors
    overlay: 'rgba(0, 0, 0, 0.5)',
    modalBackground: 'rgba(0, 0, 0, 0.8)',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
  },
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  shadows: {
    sm: {
      shadowColor: colors.black,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 2,
    },
    md: {
      shadowColor: colors.black,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 4,
    },
    lg: {
      shadowColor: colors.black,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 8,
    },
  },
};

// Dark theme
export const darkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: colors.primaryLight,
    primaryLight: colors.primaryLight,
    primaryDark: colors.primary,
    secondary: colors.secondaryLight,
    accent: colors.accentLight,
    success: colors.success,
    warning: colors.warning,
    error: colors.error,
    
    // Background colors
    background: colors.darkGray50,
    surface: colors.darkGray100,
    surfaceVariant: colors.darkGray200,
    
    // Text colors
    text: colors.darkGray900,
    textSecondary: colors.darkGray600,
    textTertiary: colors.darkGray500,
    
    // Border colors
    border: colors.darkGray300,
    borderLight: colors.darkGray200,
    
    // Card colors
    card: colors.darkGray100,
    cardElevated: colors.darkGray200,
    
    // Navigation colors
    tabBarBackground: colors.darkGray100,
    tabBarActive: colors.primaryLight,
    tabBarInactive: colors.darkGray400,
    
    // Input colors
    inputBackground: colors.darkGray200,
    inputBorder: colors.darkGray300,
    inputText: colors.darkGray900,
    placeholder: colors.darkGray400,
    
    // Button colors
    buttonPrimary: colors.primaryLight,
    buttonSecondary: colors.darkGray200,
    buttonText: colors.darkGray50,
    buttonTextSecondary: colors.darkGray700,
    
    // Status colors
    online: colors.success,
    offline: colors.darkGray400,
    
    // Overlay colors
    overlay: 'rgba(0, 0, 0, 0.7)',
    modalBackground: 'rgba(0, 0, 0, 0.9)',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
  },
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  shadows: {
    sm: {
      shadowColor: colors.black,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 2,
      elevation: 2,
    },
    md: {
      shadowColor: colors.black,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 4,
    },
    lg: {
      shadowColor: colors.black,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    },
  },
};

export default { lightTheme, darkTheme };
