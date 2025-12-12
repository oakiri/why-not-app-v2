import React, { useEffect, useRef, useState } from 'react';
import { Image, Text, useWindowDimensions, View } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';
import { useFonts } from 'expo-font';
import { SafeAreaView } from 'react-native-safe-area-context';

SplashScreen.preventAutoHideAsync().catch(() => {});

const splashStartTime = Date.now();

const SplashView = ({ useAnton }) => {
  const { width } = useWindowDimensions();
  const logoSize = Math.min(220, width * 0.55);

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: '#FFFFFF',
      }}
    >
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Image
          source={require('./assets/logo.png')}
          resizeMode="contain"
          style={{
            width: logoSize,
            height: logoSize,
          }}
        />
        <Text
          style={{
            marginTop: 18,
            fontSize: 16,
            letterSpacing: 0.8,
            color: '#111111',
            ...(useAnton ? { fontFamily: 'Anton' } : null),
          }}
        >
          CARGANDO...
        </Text>
      </View>
    </SafeAreaView>
  );
};

export default function App() {
  const [fontsLoaded] = useFonts({
    Anton: require('./assets/fonts/Anton-Regular.ttf'),
  });

  const [showSplash, setShowSplash] = useState(true);
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    let isMounted = true;

    const waitForFonts = () =>
      new Promise((resolve) => {
        const start = Date.now();
        const check = () => {
          if (fontsLoaded || Date.now() - start >= 2000) {
            resolve();
            return;
          }
          setTimeout(check, 50);
        };
        check();
      });

    const run = async () => {
      await waitForFonts();

      const elapsed = Date.now() - splashStartTime;
      const remaining = Math.max(0, 5000 - elapsed);
      await new Promise((resolve) => setTimeout(resolve, remaining));

      if (!isMounted) return;

      try {
        await SplashScreen.hideAsync();
      } catch (e) {}

      if (!isMounted) return;
      setShowSplash(false);
    };

    run();

    return () => {
      isMounted = false;
    };
  }, [fontsLoaded]);

  if (showSplash) return <SplashView useAnton={fontsLoaded} />;

  return (
    <NavigationContainer>
      <AppNavigator />
    </NavigationContainer>
  );
}
