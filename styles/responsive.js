import { Dimensions, PixelRatio } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Based on iPhone 11 Pro dimensions
const BASE_WIDTH = 375;
const BASE_HEIGHT = 812;

export const screenWidth = SCREEN_WIDTH;
export const screenHeight = SCREEN_HEIGHT;

// Responsive width based on screen width
export const wp = (percentage) => {
  const value = (percentage * SCREEN_WIDTH) / 100;
  return Math.round(PixelRatio.roundToNearestPixel(value));
};

// Responsive height based on screen height
export const hp = (percentage) => {
  const value = (percentage * SCREEN_HEIGHT) / 100;
  return Math.round(PixelRatio.roundToNearestPixel(value));
};

// Responsive font size
export const rf = (size) => {
  const scale = SCREEN_WIDTH / BASE_WIDTH;
  const newSize = size * scale;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

// Device type detection
export const isTablet = () => {
  const aspectRatio = SCREEN_HEIGHT / SCREEN_WIDTH;
  return aspectRatio < 1.6 && Math.min(SCREEN_WIDTH, SCREEN_HEIGHT) > 600;
};

export const isSmallScreen = () => {
  return SCREEN_WIDTH < 375;
};

export const isLargeScreen = () => {
  return SCREEN_WIDTH > 414;
};

// Spacing utilities
export const spacing = {
  xs: wp(1),
  sm: wp(2),
  md: wp(4),
  lg: wp(6),
  xl: wp(8),
  xxl: wp(12),
};

// Common responsive styles
export const responsiveStyles = {
  container: {
    paddingHorizontal: isTablet() ? wp(8) : wp(4),
  },
  card: {
    borderRadius: isTablet() ? 16 : 12,
    padding: isTablet() ? spacing.xl : spacing.lg,
  },
  text: {
    fontSize: {
      xs: rf(10),
      sm: rf(12),
      md: rf(14),
      lg: rf(16),
      xl: rf(18),
      xxl: rf(20),
    },
  },
  button: {
    height: isTablet() ? 56 : 48,
    borderRadius: isTablet() ? 16 : 12,
  },
  input: {
    height: isTablet() ? 56 : 48,
    borderRadius: isTablet() ? 12 : 8,
  },
};

// Grid system
export const getGridItemWidth = (columns, spacing = 16) => {
  const totalSpacing = spacing * (columns - 1);
  return (SCREEN_WIDTH - totalSpacing - (spacing * 2)) / columns;
};

// Safe area helpers
export const getSafeAreaPadding = () => {
  // This would typically use react-native-safe-area-context
  // For now, providing default values
  return {
    top: 44,
    bottom: 34,
    left: 0,
    right: 0,
  };
};

// Animation helpers
export const getAnimationDuration = (baseMs = 300) => {
  // Reduce animation duration on slower devices
  const pixelRatio = PixelRatio.get();
  if (pixelRatio < 2) {
    return baseMs * 0.8;
  }
  return baseMs;
};

// Layout helpers
export const getHeaderHeight = () => {
  return isTablet() ? 80 : 64;
};

export const getTabBarHeight = () => {
  return isTablet() ? 80 : 60;
};

export const getCardAspectRatio = () => {
  return isTablet() ? 1.5 : 1.4;
};

// Breakpoints
export const breakpoints = {
  small: 320,
  medium: 375,
  large: 414,
  tablet: 768,
};

export const isBreakpoint = (breakpoint) => {
  return SCREEN_WIDTH >= breakpoints[breakpoint];
};

export default {
  wp,
  hp,
  rf,
  spacing,
  responsiveStyles,
  isTablet,
  isSmallScreen,
  isLargeScreen,
  screenWidth,
  screenHeight,
  getGridItemWidth,
  getSafeAreaPadding,
  getAnimationDuration,
  getHeaderHeight,
  getTabBarHeight,
  getCardAspectRatio,
  breakpoints,
  isBreakpoint,
};
