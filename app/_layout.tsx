import { useEffect, useRef, useState } from 'react';
import { Image, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';

// ⏱️ Splash duration by environment
const SPLASH_DURATION =
  process.env.NODE_ENV === 'development' ? 1000 : 3000;

// Prevent auto-hide ONCE
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
      <Text style={[styles.splashText, useAnton && { fontFamily: 'Anton' }]}>
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
  const hasHiddenSplash = useRef(false);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (hasHiddenSplash.current) return;
      hasHiddenSplash.current = true;

      setShowOverlay(false);
      try {
        await SplashScreen.hideAsync();
      } catch {}
    }, SPLASH_DURATION);

    return () => clearTimeout(timer);
  }, []);

  return (
    <SafeAreaProvider>
      <View style={styles.root}>
        <Stack screenOptions={{ headerShown: false }} />
        {showOverlay && <SplashOverlay useAnton={fontsLoaded} />}
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
