import React from 'react';
import { View, Text } from 'react-native';
import { useAuth } from '../../src/context/AuthContext';
import { colors } from '../../src/theme/theme';

export default function HomeTab() {
  const { profile, profileLoading } = useAuth();

  return (
    <View style={{ flex: 1, padding: 20, backgroundColor: colors.background }}>
      <Text style={{ fontFamily: 'Anton', fontSize: 20, color: colors.text, marginBottom: 4 }}>
        Hola, {profile?.name || 'amigo'}
      </Text>
      {profileLoading ? (
        <Text style={{ fontFamily: 'Anton', fontSize: 12, color: colors.textMuted, marginBottom: 12 }}>
          Cargando perfil...
        </Text>
      ) : null}
      <Text style={{ fontFamily: 'Anton', fontSize: 28, color: colors.primary, marginBottom: 12 }}>
        PROMOCIONES
      </Text>

      <View style={{ borderWidth: 1, borderColor: '#EEE', borderRadius: 14, padding: 14, marginBottom: 12 }}>
        <Text style={{ fontFamily: 'Anton', fontSize: 16, marginBottom: 6 }}>Promo 1</Text>
        <Text>2x1 en burgers clásicas todo el día.</Text>
      </View>

      <View style={{ borderWidth: 1, borderColor: '#EEE', borderRadius: 14, padding: 14, marginBottom: 12 }}>
        <Text style={{ fontFamily: 'Anton', fontSize: 16, marginBottom: 6 }}>Promo 2</Text>
        <Text>Combos con papas y bebida a precio especial.</Text>
      </View>

      <View style={{ borderWidth: 1, borderColor: '#EEE', borderRadius: 14, padding: 14 }}>
        <Text style={{ fontFamily: 'Anton', fontSize: 16, marginBottom: 6 }}>Novedad</Text>
        <Text>Prueba nuestra burger edición limitada.</Text>
      </View>
    </View>
  );
}
