import React, { createContext, useContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightTheme, darkTheme } from '../styles/themes';

// Initial state
const initialState = {
  isDarkMode: false,
  theme: lightTheme,
};

// Action types
const THEME_ACTIONS = {
  SET_THEME: 'SET_THEME',
  TOGGLE_THEME: 'TOGGLE_THEME',
};

// Reducer
const themeReducer = (state, action) => {
  switch (action.type) {
    case THEME_ACTIONS.SET_THEME:
      return {
        ...state,
        isDarkMode: action.payload,
        theme: action.payload ? darkTheme : lightTheme,
      };
    case THEME_ACTIONS.TOGGLE_THEME:
      const newIsDarkMode = !state.isDarkMode;
      return {
        ...state,
        isDarkMode: newIsDarkMode,
        theme: newIsDarkMode ? darkTheme : lightTheme,
      };
    default:
      return state;
  }
};

// Create context
const ThemeContext = createContext();

// Provider component
export const ThemeProvider = ({ children }) => {
  const [state, dispatch] = useReducer(themeReducer, initialState);

  useEffect(() => {
    // Load theme preference from storage
    loadThemePreference();
  }, []);

  useEffect(() => {
    // Save theme preference to storage whenever it changes
    saveThemePreference(state.isDarkMode);
  }, [state.isDarkMode]);

  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('theme_preference');
      if (savedTheme !== null) {
        const isDarkMode = JSON.parse(savedTheme);
        dispatch({ type: THEME_ACTIONS.SET_THEME, payload: isDarkMode });
      }
    } catch (error) {
      console.error('Error loading theme preference:', error);
    }
  };

  const saveThemePreference = async (isDarkMode) => {
    try {
      await AsyncStorage.setItem('theme_preference', JSON.stringify(isDarkMode));
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  const toggleTheme = () => {
    dispatch({ type: THEME_ACTIONS.TOGGLE_THEME });
  };

  const setTheme = (isDarkMode) => {
    dispatch({ type: THEME_ACTIONS.SET_THEME, payload: isDarkMode });
  };

  const value = {
    ...state,
    toggleTheme,
    setTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// Hook to use theme context
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext;