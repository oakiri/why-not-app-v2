import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';

const Stack = createNativeStackNavigator();

const screenOptions = {
  headerStyle: { backgroundColor: '#0b0b0b' },
  headerTintColor: '#f9d648',
  headerTitleStyle: {
    fontFamily: 'Anton',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
};

const AuthNavigator = () => (
  <Stack.Navigator screenOptions={screenOptions}>
    <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
    <Stack.Screen
      name="Register"
      component={RegisterScreen}
      options={{ title: 'Crear cuenta' }}
    />
  </Stack.Navigator>
);

export default AuthNavigator;
