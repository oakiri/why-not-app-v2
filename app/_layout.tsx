import { useEffect, useRef, useState } from "react";
import { Image, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useFonts } from "expo-font";

const SPLASH_DURATION_MS = 5000;

// Evita llamadas duplicadas a preventAutoHideAsync (Fast Refresh / Web HMR / re-evaluaciones)
declare global {
  // eslint-disable-next-line no-var
  var __WHY_NOT_SPLASH_PREVENTED__: boolean | undefined;
}

if (!globalThis.__WHY_NOT_SPLASH_PREVENTED__) {
  globalThis.__WHY_NOT_SPLASH_PREVENTED__ = true;
  SplashScreen.preventAutoHideAsync().catch(() => {});
}

function SplashOverlay({ useAnton }: { useAnton: boolean }) {
  const { width } = useWindowDimensions();
  const logoSize = Math.min(240, width * 0.55);

  return (
    <View style={styles.splashContainer} pointerEvents="none">
      <Image
        source={require("../assets/logo.png")}
        resizeMode="contain"
        style={{ width: logoSize, height: logoSize }}
      />
      <Text style={[styles.splashText, useAnton ? { fontFamily: "Anton" } : null]}>
        CARGANDO...
      </Text>
    </View>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Anton: require("../assets/fonts/Anton-Regular.ttf"),
  });

  const [showOverlay, setShowOverlay] = useState(true);
  const hasHiddenNativeSplash = useRef(false);

  useEffect(() => {
    const t = setTimeout(async () => {
      // 1) Quitamos el overlay
      setShowOverlay(false);

      // 2) Ocultamos el splash nativo UNA sola vez
      if (!hasHiddenNativeSplash.current) {
        hasHiddenNativeSplash.current = true;
        try {
          await SplashScreen.hideAsync();
        } catch {
          // ignore
        }
      }
    }, SPLASH_DURATION_MS);

    return () => clearTimeout(t);
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
    backgroundColor: "#FFFFFF",
  },
  splashContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  splashText: {
    marginTop: 18,
    fontSize: 16,
    letterSpacing: 0.8,
    color: "#111111",
  },
});
