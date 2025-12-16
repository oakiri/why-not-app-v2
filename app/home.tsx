import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { signOut } from 'firebase/auth';
import { clearPendingProfileForUid, useAuth } from '../src/context/AuthContext';
import { auth } from '../src/lib/firebase';
import { colors, typography } from '../src/theme/theme';

export default function HomeScreen() {
  const { user } = useAuth();

  const handleLogout = async () => {
    await clearPendingProfileForUid(user?.uid);
    await signOut(auth);
    router.replace('/login');
  };

  const handleGoToMenu = () => {
    console.log('[NAV] Ir a carta');
    router.push('/menu');
  };

  const handleGoToCart = () => {
    console.log('[NAV] Ir a carrito');
    router.push('/cart');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inner}>
        <Text style={[styles.title, typography.title]}>Bienvenido</Text>
        <Text style={styles.subtitle}>{user?.email}</Text>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.secondaryButton} onPress={handleGoToMenu}>
            <Text style={styles.buttonText}>Ir a carta</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton} onPress={handleGoToCart}>
            <Text style={styles.buttonText}>Ir a carrito</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={handleLogout}>
            <Text style={styles.buttonText}>Cerrar sesión</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  inner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  title: {
    color: colors.primary,
    marginBottom: 8,
  },
  subtitle: {
    color: colors.textMuted,
    marginBottom: 20,
  },
  actions: {
    width: '100%',
    gap: 12,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryButton: {
    backgroundColor: colors.card,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  buttonText: {
    color: colors.text,
    fontWeight: '700',
  },
});
