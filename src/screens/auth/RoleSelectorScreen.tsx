import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { colors } from '../../theme/theme';
import { Ionicons } from '@expo/vector-icons';
import { signOut } from 'firebase/auth';
import { auth } from '../../lib/firebase';

const { width } = Dimensions.get('window');

export default function RoleSelectorScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image 
          source={require('../../../assets/logo.png')} 
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>¿QUÉ QUIERES HACER HOY?</Text>
        <Text style={styles.subtitle}>HAS INICIADO SESIÓN COMO PERSONAL AUTORIZADO</Text>
      </View>

      <View style={styles.options}>
        <TouchableOpacity 
          style={styles.card} 
          onPress={() => router.replace('/(tabs)/home')}
        >
          <View style={[styles.iconContainer, { backgroundColor: colors.primary }]}>
            <Ionicons name="fast-food" size={40} color="#000" />
          </View>
          <Text style={styles.cardTitle}>APP CLIENTE</Text>
          <Text style={styles.cardDesc}>VER EL MENÚ Y REALIZAR PEDIDOS COMO UN CLIENTE</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.card, styles.cardDark]} 
          onPress={() => router.replace('/(backoffice)/dashboard')}
        >
          <View style={[styles.iconContainer, { backgroundColor: '#333' }]}>
            <Ionicons name="stats-chart" size={40} color={colors.primary} />
          </View>
          <Text style={[styles.cardTitle, styles.textWhite]}>BACKOFFICE</Text>
          <Text style={[styles.cardDesc, styles.textGray]}>GESTIONAR PEDIDOS, MENÚ Y EQUIPO</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity 
        style={styles.logout} 
        onPress={async () => {
          await signOut(auth);
          router.replace('/(auth)/login');
        }}
      >
        <Text style={styles.logoutText}>CERRAR SESIÓN</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF', padding: 20, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: 40 },
  logo: { width: 120, height: 120, marginBottom: 20 },
  title: { fontFamily: 'Anton', fontSize: 28, color: '#000', textAlign: 'center' },
  subtitle: { fontFamily: 'Anton', fontSize: 12, color: '#666', marginTop: 8, textAlign: 'center' },
  options: { gap: 20 },
  card: { 
    backgroundColor: '#F8F8F8', 
    borderRadius: 20, 
    padding: 25, 
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#EEE',
    elevation: 3,
  },
  cardDark: { backgroundColor: '#1A1A1A', borderColor: '#333' },
  iconContainer: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  cardTitle: { fontFamily: 'Anton', fontSize: 24, color: '#000' },
  cardDesc: { fontFamily: 'Anton', fontSize: 11, color: '#666', textAlign: 'center', marginTop: 8, paddingHorizontal: 20 },
  textWhite: { color: '#FFF' },
  textGray: { color: '#999' },
  logout: { marginTop: 40, alignSelf: 'center' },
  logoutText: { fontFamily: 'Anton', color: '#FF4444', fontSize: 16, textDecorationLine: 'underline' },
});
