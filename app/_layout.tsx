import React, { useEffect } from 'react';
import { Slot } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';

import { AuthProvider } from '../src/context/AuthContext';
import { ThemeProvider } from '../src/context/ThemeContext';
import AuthGate from '../src/components/auth/AuthGate';
// import { applyGlobalAntonFont } from '../src/theme/applyGlobalTextStyle'; // Eliminado: Usaremos AntonText.tsx
// import '../src/theme/global.css'; // Comentado: Posible fuente de conflicto de fuentes
import '../src/theme/webFonts.css'; // Carga de fuentes para Web

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    'Anton-Regular': require('../assets/fonts/custom/Anton-Regular.ttf'),
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
    // Render a fatal error screen if the core font fails to load
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'red' }}>
        <Text style={{ color: 'white', fontSize: 20 }}>ERROR FATAL: Fuente Anton no cargada.</Text>
        <Text style={{ color: 'white', fontSize: 12 }}>{fontError.message}</Text>
      </View>
    );
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
