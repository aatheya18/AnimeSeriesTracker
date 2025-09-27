import React from 'react';
import { StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '../context/ThemeContext';

const GradientBackground = ({ 
  children, 
  colors, 
  style, 
  start = { x: 0, y: 0 }, 
  end = { x: 1, y: 1 },
  variant = 'primary'
}) => {
  const { theme, isDarkMode } = useTheme();

  const getGradientColors = () => {
    if (colors) return colors;

    const baseColors = {
      primary: isDarkMode 
        ? [theme.colors.primary + '20', theme.colors.primary + '10', 'transparent']
        : [theme.colors.primary + '10', theme.colors.primary + '05', 'transparent'],
      secondary: isDarkMode
        ? [theme.colors.secondary + '20', theme.colors.secondary + '10', 'transparent']
        : [theme.colors.secondary + '10', theme.colors.secondary + '05', 'transparent'],
      accent: isDarkMode
        ? [theme.colors.tertiary + '20', theme.colors.tertiary + '10', 'transparent']
        : [theme.colors.tertiary + '10', theme.colors.tertiary + '05', 'transparent'],
      surface: isDarkMode
        ? [theme.colors.surface, theme.colors.background]
        : [theme.colors.background, theme.colors.surface],
      overlay: isDarkMode
        ? ['rgba(0,0,0,0.7)', 'rgba(0,0,0,0.3)', 'transparent']
        : ['rgba(255,255,255,0.7)', 'rgba(255,255,255,0.3)', 'transparent'],
    };

    return baseColors[variant] || baseColors.primary;
  };

  return (
    <LinearGradient
      colors={getGradientColors()}
      start={start}
      end={end}
      style={[styles.gradient, style]}
    >
      {children}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
});

export default GradientBackground;
