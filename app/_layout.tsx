import { useEffect, useRef, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);
  const hasStarted = useRef(false);

  useEffect(() => {
    if (hasStarted.current) return;
    hasStarted.current = true;

    const prepare = async () => {
      await new Promise((resolve) => setTimeout(resolve, 5000));
      await SplashScreen.hideAsync();
      setIsReady(true);
    };

    prepare().catch(() => {
      setIsReady(true);
    });
  }, []);

  if (!isReady) {
    return (
      <View style={styles.splashContainer}>
        <Image source={require('../assets/logo.png')} style={styles.logo} resizeMode="contain" />
        <Text style={styles.splashText}>CARGANDO...</Text>
      </View>
    );
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  logo: {
    width: 200,
    height: 200,
  },
  splashText: {
    marginTop: 16,
    fontSize: 16,
    letterSpacing: 1,
    color: '#111111',
  },
});
