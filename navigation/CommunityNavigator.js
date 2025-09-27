import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import CommunityScreen from '../screens/CommunityScreen';

const Stack = createNativeStackNavigator();

const CommunityNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen 
        name="CommunityMain" 
        component={CommunityScreen}
      />
    </Stack.Navigator>
  );
};

export default CommunityNavigator;
