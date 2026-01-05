import React, { useEffect } from 'react';
import { Slot } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';

import { AuthProvider } from '../src/context/AuthContext';
import { ThemeProvider } from '../src/context/ThemeContext';
import AuthGate from '../src/components/auth/AuthGate';
// import { applyGlobalAntonFont } from '../src/theme/applyGlobalTextStyle'; // Eliminado: Usaremos AntonText.tsx
// import '../src/theme/global.css'; // Comentado: Posible fuente de conflicto de fuentes

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Anton: require('../assets/fonts/Anton-Regular.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded]);

  // Expo Router will automatically stop the splash screen when the first screen is rendered.
  // But we manually hide the splash screen in the effect to make sure it is hidden.
  if (!fontsLoaded && !fontError) return null;

  // Handle font loading error
  if (fontError) {
    console.error("Error loading fonts:", fontError);
    // Optionally, you could render a fallback UI here
  }

  return (
    <ThemeProvider>
      <AuthProvider>
        <AuthGate>
          <Slot />
        </AuthGate>
      </AuthProvider>
    </ThemeProvider>
  );
}
