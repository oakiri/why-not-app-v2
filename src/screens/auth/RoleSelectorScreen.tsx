import React from 'react';
import { View, TouchableOpacity, StyleSheet, Image, Dimensions } from 'react-native';
import AntonText from '../../components/ui/AntonText';
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
        <AntonText style={styles.title}>¿QUÉ QUIERES HACER HOY?</AntonText>
        <AntonText style={styles.subtitle}>HAS INICIADO SESIÓN COMO PERSONAL AUTORIZADO</AntonText>
      </View>

      <View style={styles.options}>
        <TouchableOpacity 
          style={styles.card} 
          onPress={() => router.replace('/home')}
        >
          <View style={[styles.iconContainer, { backgroundColor: colors.primary }]}>
            <Ionicons name="fast-food" size={40} color="#000" />
          </View>
          <AntonText style={styles.cardTitle}>APP CLIENTE</AntonText>
          <AntonText style={styles.cardDesc}>VER EL MENÚ Y REALIZAR PEDIDOS COMO UN CLIENTE</AntonText>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.card, styles.cardDark]} 
          onPress={() => router.replace('/backoffice/dashboard')}
        >
          <View style={[styles.iconContainer, { backgroundColor: '#333' }]}>
            <Ionicons name="stats-chart" size={40} color={colors.primary} />
          </View>
          <AntonText style={[styles.cardTitle, styles.textWhite]}>BACKOFFICE</AntonText>
          <AntonText style={[styles.cardDesc, styles.textGray]}>GESTIONAR PEDIDOS, MENÚ Y EQUIPO</AntonText>
        </TouchableOpacity>
      </View>

      <TouchableOpacity 
        style={styles.logout} 
        onPress={async () => {
          await signOut(auth);
          router.replace('/login');
        }}
      >
        <AntonText style={styles.logoutText}>CERRAR SESIÓN</AntonText>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF', padding: 20, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: 40 },
  logo: { width: 120, height: 120, marginBottom: 20 },
  title: { fontSize: 28, color: '#000', textAlign: 'center' },
  subtitle: { fontSize: 12, color: '#666', marginTop: 8, textAlign: 'center' },
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
  cardTitle: { fontSize: 24, color: '#000' },
  cardDesc: { fontSize: 11, color: '#666', textAlign: 'center', marginTop: 8, paddingHorizontal: 20 },
  textWhite: { color: '#FFF' },
  textGray: { color: '#999' },
  logout: { marginTop: 40, alignSelf: 'center' },
  logoutText: { color: '#FF4444', fontSize: 16, textDecorationLine: 'underline' },
});
