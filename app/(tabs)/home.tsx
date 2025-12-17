import React, { useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, typography.title]}>Promociones</Text>
        <Text style={styles.subtitle}>
          {user?.email ? `Hola, ${user.email}` : 'Descubre nuestras novedades'}
        </Text>
      </View>

      <View style={styles.promos}>
        <View style={styles.promoCard}>
          <Text style={styles.promoTitle}>Promo 1</Text>
          <Text style={styles.promoText}>2x1 en burgers clásicas todo el día.</Text>
        </View>

        <View style={styles.promoCard}>
          <Text style={styles.promoTitle}>Promo 2</Text>
          <Text style={styles.promoText}>Combos con papas y bebida a precio especial.</Text>
        </View>

        <View style={styles.promoCard}>
          <Text style={styles.promoTitle}>Novedad de la semana</Text>
          <Text style={styles.promoText}>Prueba nuestra burger edición limitada.</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 24,
    paddingVertical: 32,
    gap: 24,
  },
  header: {
    gap: 6,
  },
  title: {
    color: colors.primary,
  },
  subtitle: {
    color: colors.textMuted,
  },
  promos: {
    gap: 16,
  },
  promoCard: {
    backgroundColor: colors.card,
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.primary,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 3,
  },
  promoTitle: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 16,
    marginBottom: 6,
  },
  promoText: {
    color: colors.textMuted,
  },
});
