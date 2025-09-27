import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';
import { useTheme } from '../context/ThemeContext';

const LoadingSpinner = ({ 
  size = 'large', 
  text = 'Loading...', 
  showText = true, 
  style,
  color 
}) => {
  const { theme } = useTheme();
  const spinValue = new Animated.Value(0);

  React.useEffect(() => {
    const spin = () => {
      spinValue.setValue(0);
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }).start(() => spin());
    };
    spin();
  }, []);

  const rotate = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={[styles.container, style]}>
      <View style={styles.spinnerContainer}>
        <ActivityIndicator 
          size={size} 
          color={color || theme.colors.primary}
          style={styles.spinner}
        />
        <Animated.View 
          style={[
            styles.overlay,
            {
              transform: [{ rotate }],
              borderColor: color || theme.colors.primary,
            }
          ]} 
        />
      </View>
      {showText && (
        <Text 
          variant="bodyMedium" 
          style={[styles.text, { color: theme.colors.textSecondary }]}
        >
          {text}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  spinnerContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinner: {
    zIndex: 1,
  },
  overlay: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  text: {
    marginTop: 12,
    textAlign: 'center',
  },
});

export default LoadingSpinner;
