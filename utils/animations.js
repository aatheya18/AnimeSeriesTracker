import { Animated, Easing } from 'react-native';

// Common animation configurations
export const animationConfig = {
  timing: {
    duration: 300,
    easing: Easing.out(Easing.cubic),
    useNativeDriver: true,
  },
  spring: {
    tension: 100,
    friction: 8,
    useNativeDriver: true,
  },
  bounce: {
    tension: 180,
    friction: 12,
    useNativeDriver: true,
  },
};

// Fade animations
export const createFadeAnimation = (animatedValue, toValue = 1, duration = 300) => {
  return Animated.timing(animatedValue, {
    toValue,
    duration,
    easing: Easing.out(Easing.cubic),
    useNativeDriver: true,
  });
};

export const fadeIn = (animatedValue, duration = 300) => {
  return createFadeAnimation(animatedValue, 1, duration);
};

export const fadeOut = (animatedValue, duration = 300) => {
  return createFadeAnimation(animatedValue, 0, duration);
};

// Scale animations
export const createScaleAnimation = (animatedValue, toValue = 1, config = animationConfig.spring) => {
  return Animated.spring(animatedValue, {
    toValue,
    ...config,
  });
};

export const scaleIn = (animatedValue) => {
  return createScaleAnimation(animatedValue, 1);
};

export const scaleOut = (animatedValue) => {
  return createScaleAnimation(animatedValue, 0);
};

export const pulseScale = (animatedValue) => {
  return Animated.sequence([
    createScaleAnimation(animatedValue, 1.1),
    createScaleAnimation(animatedValue, 1),
  ]);
};

// Slide animations
export const createSlideAnimation = (animatedValue, toValue, duration = 300) => {
  return Animated.timing(animatedValue, {
    toValue,
    duration,
    easing: Easing.out(Easing.cubic),
    useNativeDriver: true,
  });
};

export const slideInFromRight = (animatedValue, screenWidth) => {
  return createSlideAnimation(animatedValue, 0);
};

export const slideInFromLeft = (animatedValue, screenWidth) => {
  return createSlideAnimation(animatedValue, 0);
};

export const slideInFromBottom = (animatedValue, screenHeight) => {
  return createSlideAnimation(animatedValue, 0);
};

// Rotation animations
export const createRotationAnimation = (animatedValue, duration = 1000) => {
  return Animated.loop(
    Animated.timing(animatedValue, {
      toValue: 1,
      duration,
      easing: Easing.linear,
      useNativeDriver: true,
    })
  );
};

export const getRotationStyle = (animatedValue) => {
  return {
    transform: [
      {
        rotate: animatedValue.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', '360deg'],
        }),
      },
    ],
  };
};

// Stagger animations
export const createStaggeredAnimation = (animations, staggerDelay = 100) => {
  return Animated.stagger(staggerDelay, animations);
};

// Sequence animations
export const createSequenceAnimation = (animations) => {
  return Animated.sequence(animations);
};

// Parallel animations
export const createParallelAnimation = (animations) => {
  return Animated.parallel(animations);
};

// Complex entrance animations
export const createEntranceAnimation = (
  fadeValue,
  scaleValue,
  slideValue,
  delay = 0
) => {
  return Animated.sequence([
    Animated.delay(delay),
    Animated.parallel([
      fadeIn(fadeValue, 400),
      createScaleAnimation(scaleValue, 1),
      createSlideAnimation(slideValue, 0, 400),
    ]),
  ]);
};

// Loading animations
export const createLoadingAnimation = (animatedValue) => {
  return Animated.loop(
    Animated.sequence([
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 1000,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(animatedValue, {
        toValue: 0,
        duration: 1000,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
    ])
  );
};

// Shake animation
export const createShakeAnimation = (animatedValue) => {
  return Animated.sequence([
    Animated.timing(animatedValue, { toValue: 10, duration: 50, useNativeDriver: true }),
    Animated.timing(animatedValue, { toValue: -10, duration: 50, useNativeDriver: true }),
    Animated.timing(animatedValue, { toValue: 10, duration: 50, useNativeDriver: true }),
    Animated.timing(animatedValue, { toValue: 0, duration: 50, useNativeDriver: true }),
  ]);
};

// Bounce animation
export const createBounceAnimation = (animatedValue) => {
  return Animated.sequence([
    Animated.timing(animatedValue, {
      toValue: 1.2,
      duration: 200,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }),
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 200,
      easing: Easing.bounce,
      useNativeDriver: true,
    }),
  ]);
};

// Heartbeat animation
export const createHeartbeatAnimation = (animatedValue) => {
  return Animated.loop(
    Animated.sequence([
      Animated.timing(animatedValue, {
        toValue: 1.1,
        duration: 300,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 300,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
    ])
  );
};

// Progress animation
export const createProgressAnimation = (animatedValue, progress, duration = 500) => {
  return Animated.timing(animatedValue, {
    toValue: progress,
    duration,
    easing: Easing.out(Easing.cubic),
    useNativeDriver: false, // Progress bars typically need layout animations
  });
};

// Card flip animation
export const createFlipAnimation = (animatedValue, duration = 600) => {
  return Animated.timing(animatedValue, {
    toValue: 1,
    duration,
    easing: Easing.out(Easing.cubic),
    useNativeDriver: true,
  });
};

export const getFlipStyle = (animatedValue) => {
  const frontInterpolate = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });
  
  const backInterpolate = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['180deg', '360deg'],
  });

  return {
    front: {
      transform: [{ rotateY: frontInterpolate }],
    },
    back: {
      transform: [{ rotateY: backInterpolate }],
    },
  };
};

// Utility functions for common use cases
export const animateValue = (animatedValue, toValue, config = {}) => {
  const defaultConfig = {
    duration: 300,
    easing: Easing.out(Easing.cubic),
    useNativeDriver: true,
    ...config,
  };

  return new Promise((resolve) => {
    Animated.timing(animatedValue, {
      toValue,
      ...defaultConfig,
    }).start(resolve);
  });
};

export const springValue = (animatedValue, toValue, config = {}) => {
  const defaultConfig = {
    tension: 100,
    friction: 8,
    useNativeDriver: true,
    ...config,
  };

  return new Promise((resolve) => {
    Animated.spring(animatedValue, {
      toValue,
      ...defaultConfig,
    }).start(resolve);
  });
};

export default {
  animationConfig,
  createFadeAnimation,
  fadeIn,
  fadeOut,
  createScaleAnimation,
  scaleIn,
  scaleOut,
  pulseScale,
  createSlideAnimation,
  slideInFromRight,
  slideInFromLeft,
  slideInFromBottom,
  createRotationAnimation,
  getRotationStyle,
  createStaggeredAnimation,
  createSequenceAnimation,
  createParallelAnimation,
  createEntranceAnimation,
  createLoadingAnimation,
  createShakeAnimation,
  createBounceAnimation,
  createHeartbeatAnimation,
  createProgressAnimation,
  createFlipAnimation,
  getFlipStyle,
  animateValue,
  springValue,
};
