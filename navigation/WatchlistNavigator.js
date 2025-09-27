import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import WatchlistScreen from '../screens/WatchlistScreen';

const Stack = createNativeStackNavigator();

const WatchlistNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen 
        name="WatchlistMain" 
        component={WatchlistScreen}
      />
    </Stack.Navigator>
  );
};

export default WatchlistNavigator;
