import React, { useEffect, useState } from 'react';
import { View, Image, Text } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';
import { useFonts } from 'expo-font';

SplashScreen.preventAutoHideAsync().catch(() => {
  // Si ya se ha llamado antes o falla, simplemente ignora el error
});

const Splash = ({ fontsLoaded }) => (
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
      style={{
        width: 200,
        height: 200,
        resizeMode: 'contain',
      }}
    />
    <Text
      style={{
        marginTop: 16,
        fontSize: 16,
        letterSpacing: 1,
        color: '#111111',
        fontFamily: fontsLoaded ? 'Anton' : undefined,
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

  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    if (fontsLoaded) {
      const timeout = setTimeout(async () => {
        try {
          await SplashScreen.hideAsync();
        } catch (e) {
          // ignorar errores al ocultar el splash
        }
        setAppReady(true);
      }, 5000);

      return () => clearTimeout(timeout);
    }
  }, [fontsLoaded]);

  if (!fontsLoaded || !appReady) {
    return <Splash fontsLoaded={fontsLoaded} />;
  }

  return (
    <NavigationContainer>
      <AppNavigator />
    </NavigationContainer>
  );
}
