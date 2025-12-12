import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ClientNavigator from './ClientNavigator';

const Stack = createNativeStackNavigator();

const AppNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Client" component={ClientNavigator} />
  </Stack.Navigator>
);

export default AppNavigator;
