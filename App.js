import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';
import { StatusBar } from 'expo-status-bar';

const WhyNotTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#0b0b0b',
    primary: '#f9d648',
    card: '#0b0b0b',
    text: '#ffffff',
    border: '#f9d648',
    notification: '#f53b57',
  },
};

export default function App() {
  return (
    <NavigationContainer theme={WhyNotTheme}>
      <StatusBar style="light" />
      <AppNavigator />
    </NavigationContainer>
  );
}
