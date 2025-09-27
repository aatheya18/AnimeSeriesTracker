import React, { createContext, useContext, useReducer, useEffect } from 'react';
import authService from '../services/authService';

// Initial state
const initialState = {
  user: null,
  isLoading: true,
  isAuthenticated: false,
  userProfile: null,
};

// Action types
const AUTH_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_USER: 'SET_USER',
  SET_USER_PROFILE: 'SET_USER_PROFILE',
  SIGN_OUT: 'SIGN_OUT',
};

// Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      };
    case AUTH_ACTIONS.SET_USER:
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
        isLoading: false,
      };
    case AUTH_ACTIONS.SET_USER_PROFILE:
      return {
        ...state,
        userProfile: action.payload,
      };
    case AUTH_ACTIONS.SIGN_OUT:
      return {
        ...initialState,
        isLoading: false,
      };
    default:
      return state;
  }
};

// Create context
const AuthContext = createContext();

// Provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    // Listen to authentication state changes
    const unsubscribe = authService.onAuthStateChanged(async (user) => {
      dispatch({ type: AUTH_ACTIONS.SET_USER, payload: user });
      
      if (user) {
        // Fetch user profile data
        const userDoc = await authService.getUserDocument(user.uid);
        if (userDoc.success) {
          dispatch({ type: AUTH_ACTIONS.SET_USER_PROFILE, payload: userDoc.data });
        }
      } else {
        dispatch({ type: AUTH_ACTIONS.SET_USER_PROFILE, payload: null });
      }
    });

    return unsubscribe;
  }, []);

  // Sign up
  const signUp = async (email, password, displayName) => {
    dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
    try {
      const result = await authService.signUp(email, password, displayName);
      if (!result.success) {
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
      }
      return result;
    } catch (error) {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
      return { success: false, error: error.message };
    }
  };

  // Sign in
  const signIn = async (email, password) => {
    dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
    try {
      const result = await authService.signIn(email, password);
      if (!result.success) {
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
      }
      return result;
    } catch (error) {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
      return { success: false, error: error.message };
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      const result = await authService.signOut();
      if (result.success) {
        dispatch({ type: AUTH_ACTIONS.SIGN_OUT });
      }
      return result;
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Reset password
  const resetPassword = async (email) => {
    try {
      return await authService.resetPassword(email);
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Update profile
  const updateProfile = async (updates) => {
    try {
      const result = await authService.updateProfile(updates);
      if (result.success) {
        // Refresh user profile
        const userDoc = await authService.getUserDocument(state.user.uid);
        if (userDoc.success) {
          dispatch({ type: AUTH_ACTIONS.SET_USER_PROFILE, payload: userDoc.data });
        }
      }
      return result;
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Update preferences
  const updatePreferences = async (preferences) => {
    try {
      const result = await authService.updatePreferences(preferences);
      if (result.success) {
        // Update local state
        dispatch({
          type: AUTH_ACTIONS.SET_USER_PROFILE,
          payload: {
            ...state.userProfile,
            preferences,
          },
        });
      }
      return result;
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Update stats
  const updateStats = async (stats) => {
    try {
      const result = await authService.updateStats(stats);
      if (result.success) {
        // Update local state
        dispatch({
          type: AUTH_ACTIONS.SET_USER_PROFILE,
          payload: {
            ...state.userProfile,
            stats,
          },
        });
      }
      return result;
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const value = {
    ...state,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updateProfile,
    updatePreferences,
    updateStats,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
