import { useEffect, useRef, useState } from 'react';
import { Image, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';

const SPLASH_DURATION = 5000;

let splashPrevented = false;
if (!splashPrevented) {
  splashPrevented = true;
  SplashScreen.preventAutoHideAsync().catch(() => {});
}

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
      <Text style={[styles.splashText, useAnton ? { fontFamily: 'Anton' } : null]}>
        CARGANDO...
      </Text>
    </View>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Anton: require('../assets/fonts/Anton-Regular.ttf'),
  });
  const [showOverlay, setShowOverlay] = useState(true);
  const hasHiddenNativeSplash = useRef(false);

  const hideSplash = async () => {
    if (hasHiddenNativeSplash.current) return;
    hasHiddenNativeSplash.current = true;

    setShowOverlay(false);
    try {
      await SplashScreen.hideAsync();
    } catch {
      // Ignore errors while hiding splash screen
    }
  };

  useEffect(() => {
    const timer = setTimeout(hideSplash, SPLASH_DURATION);
    return () => clearTimeout(timer);
  }, []);

  return (
    <SafeAreaProvider>
      <View style={styles.root}>
        <Stack screenOptions={{ headerShown: false }} />
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
