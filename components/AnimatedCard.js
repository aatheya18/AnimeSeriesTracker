import React, { useRef, useEffect } from 'react';
import { Animated, Pressable, StyleSheet } from 'react-native';
import { Card } from 'react-native-paper';
import { useTheme } from '../context/ThemeContext';

const AnimatedCard = ({ 
  children, 
  onPress, 
  style, 
  animationType = 'scale',
  delay = 0,
  ...props 
}) => {
  const { theme } = useTheme();
  const animatedValue = useRef(new Animated.Value(0)).current;
  const scaleValue = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 500,
      delay,
      useNativeDriver: true,
    }).start();
  }, [delay]);

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const getAnimationStyle = () => {
    switch (animationType) {
      case 'fadeIn':
        return {
          opacity: animatedValue,
          transform: [
            {
              translateY: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [20, 0],
              }),
            },
          ],
        };
      case 'slideIn':
        return {
          opacity: animatedValue,
          transform: [
            {
              translateX: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [50, 0],
              }),
            },
          ],
        };
      case 'scale':
      default:
        return {
          opacity: animatedValue,
          transform: [
            {
              scale: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [0.8, 1],
              }),
            },
          ],
        };
    }
  };

  const cardStyle = [
    styles.card,
    {
      backgroundColor: theme.colors.card,
      shadowColor: theme.colors.shadow,
      elevation: 4,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    style,
  ];

  if (onPress) {
    return (
      <Animated.View style={[getAnimationStyle(), { transform: [...getAnimationStyle().transform, { scale: scaleValue }] }]}>
        <Pressable
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={({ pressed }) => [
            cardStyle,
            pressed && styles.pressed,
          ]}
          {...props}
        >
          {children}
        </Pressable>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={getAnimationStyle()}>
      <Card style={cardStyle} {...props}>
        {children}
      </Card>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  pressed: {
    opacity: 0.8,
  },
});

export default AnimatedCard;
