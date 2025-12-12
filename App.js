import React, { useEffect, useRef, useState } from 'react';
import { View, Image, Text } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';
import { useFonts } from 'expo-font';

SplashScreen.preventAutoHideAsync().catch(() => {
  // Si ya se ha llamado antes o falla, simplemente ignora el error
});

const SplashView = ({ useAnton }) => (
  <View
    style={{
      flex: 1,
      backgroundColor: '#FFFFFF',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    <Image
      source={require('./assets/logo.png')}
      resizeMode="contain"
      style={{
        width: 200,
        height: 200,
      }}
    />
    <Text
      style={{
        marginTop: 16,
        fontSize: 16,
        letterSpacing: 1,
        color: '#111111',
        ...(useAnton ? { fontFamily: 'Anton' } : null),
      }}
    >
      CARGANDO...
    </Text>
  </View>
);

export default function App() {
  const [fontsLoaded] = useFonts({
    Anton: require('./assets/fonts/Anton-Regular.ttf'),
  });

  const [showSplash, setShowSplash] = useState(true);
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const run = async () => {
      const start = Date.now();
      while (!fontsLoaded && Date.now() - start < 2000) {
        await new Promise((r) => setTimeout(r, 50));
      }

      await new Promise((r) => setTimeout(r, 5000));

      try {
        await SplashScreen.hideAsync();
      } catch (e) {}

      setShowSplash(false);
    };

    run();
  }, [fontsLoaded]);

  if (showSplash) return <SplashView useAnton={fontsLoaded} />;

  return (
    <NavigationContainer>
      <AppNavigator />
    </NavigationContainer>
  );
}
