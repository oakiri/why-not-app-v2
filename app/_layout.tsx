import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Image, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';

const splashStartTime = Date.now();
const SPLASH_MIN_DURATION = 5000;
const FONT_WAIT_LIMIT = 2000;

function SplashOverlay({ useAnton }: { useAnton: boolean }) {
  const { width } = useWindowDimensions();
  const logoSize = Math.min(220, width * 0.55);

  return (
    <View style={styles.splashContainer} pointerEvents="none">
      <Image
        source={require('../assets/logo.png')}
        resizeMode="contain"
        style={{ width: logoSize, height: logoSize }}
      />
      <Text
        style={[
          styles.splashText,
          useAnton ? { fontFamily: 'Anton' } : null,
        ]}
      >
        CARGANDO...
      </Text>
    </View>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Anton: require('../assets/fonts/Anton-Regular.ttf'),
  });
  const [fontsReady, setFontsReady] = useState(fontsLoaded);
  const [minDurationDone, setMinDurationDone] = useState(false);
  const [layoutReady, setLayoutReady] = useState(false);
  const hasHiddenNativeSplash = useRef(false);
  const [showOverlay, setShowOverlay] = useState(true);

  useEffect(() => {
    if (fontsLoaded) {
      setFontsReady(true);
      return;
    }

    const fallbackTimer = setTimeout(() => setFontsReady(true), FONT_WAIT_LIMIT);
    return () => clearTimeout(fallbackTimer);
  }, [fontsLoaded]);

  useEffect(() => {
    const timer = setTimeout(() => setMinDurationDone(true), SPLASH_MIN_DURATION);
    return () => clearTimeout(timer);
  }, []);

  const hideSplash = useCallback(async () => {
    if (hasHiddenNativeSplash.current) return;
    hasHiddenNativeSplash.current = true;

    try {
      await SplashScreen.hideAsync();
    } catch (error) {
      // Ignore errors while hiding splash screen
    }

    setShowOverlay(false);
  }, []);

  useEffect(() => {
    if (!fontsReady || !layoutReady || !minDurationDone) return;

    const remaining = Math.max(0, SPLASH_MIN_DURATION - (Date.now() - splashStartTime));
    const timeout = setTimeout(hideSplash, remaining);

    return () => clearTimeout(timeout);
  }, [fontsReady, layoutReady, minDurationDone, hideSplash]);

  const handleLayout = useCallback(() => {
    setLayoutReady(true);
  }, []);

  const screenOptions = useMemo(
    () => ({
      headerShown: false,
    }),
    []
  );

  return (
    <SafeAreaProvider>
      <View style={styles.root} onLayout={handleLayout}>
        <Stack screenOptions={screenOptions}>
          <Stack.Screen name="index" />
        </Stack>
        {showOverlay ? <SplashOverlay useAnton={fontsLoaded} /> : null}
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  splashContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  splashText: {
    marginTop: 18,
    fontSize: 16,
    letterSpacing: 0.8,
    color: '#111111',
  },
});
