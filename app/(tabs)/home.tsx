import React, { useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { signOut } from 'firebase/auth';
import { clearPendingProfileForUid, useAuth } from '../../src/context/AuthContext';
import { auth } from '../../src/lib/firebase';
import { colors, typography } from '../../src/theme/theme';

export default function HomeTab() {
  const { user } = useAuth();

  useFocusEffect(
    useCallback(() => {
      if (__DEV__) {
        // eslint-disable-next-line no-console
        console.log('Navigated to Home tab');
      }
    }, []),
  );

  const handleLogout = async () => {
    await clearPendingProfileForUid(user?.uid);
    await signOut(auth);
    router.replace('/login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, typography.title]}>Bienvenido</Text>
        <Text style={styles.subtitle}>{user?.email}</Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.linkButton} onPress={() => router.push('/(tabs)/menu')}>
          <Text style={styles.linkText}>Ir al menú</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.linkButton} onPress={() => router.push('/(tabs)/cart')}>
          <Text style={styles.linkText}>Ver carrito</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.linkButton} onPress={() => router.push('/(tabs)/profile')}>
          <Text style={styles.linkText}>Perfil</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Cerrar sesión</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 24,
    paddingVertical: 32,
    gap: 20,
  },
  header: {
    gap: 4,
  },
  title: {
    color: colors.primary,
  },
  subtitle: {
    color: colors.textMuted,
  },
  actions: {
    gap: 12,
  },
  linkButton: {
    backgroundColor: colors.card,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  linkText: {
    color: colors.text,
    fontWeight: '700',
    textAlign: 'center',
  },
  logoutButton: {
    marginTop: 'auto',
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  logoutText: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 16,
  },
});
