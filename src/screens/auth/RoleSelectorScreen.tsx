import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { colors } from '../../theme/theme';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function RoleSelectorScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image 
          source={require('../../../assets/images/logo.png')} 
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>¿QUÉ QUIERES HACER HOY?</Text>
        <Text style={styles.subtitle}>Has iniciado sesión como personal autorizado</Text>
      </View>

      <View style={styles.options}>
        <TouchableOpacity 
          style={styles.card} 
          onPress={() => router.replace('/(tabs)')}
        >
          <View style={[styles.iconContainer, { backgroundColor: colors.primary }]}>
            <Ionicons name="fast-food" size={40} color="#000" />
          </View>
          <Text style={styles.cardTitle}>APP CLIENTE</Text>
          <Text style={styles.cardDesc}>Ver el menú y realizar pedidos como un cliente</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.card, styles.cardDark]} 
          onPress={() => router.replace('/(backoffice)/dashboard')}
        >
          <View style={[styles.iconContainer, { backgroundColor: '#333' }]}>
            <Ionicons name="stats-chart" size={40} color={colors.primary} />
          </View>
          <Text style={[styles.cardTitle, styles.textWhite]}>BACKOFFICE</Text>
          <Text style={[styles.cardDesc, styles.textGray]}>Gestionar pedidos, menú y equipo</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logout} onPress={() => router.replace('/login')}>
        <Text style={styles.logoutText}>Cerrar sesión</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF', padding: 20, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: 40 },
  logo: { width: 120, height: 120, marginBottom: 20 },
  title: { fontFamily: 'Anton', fontSize: 28, color: '#000', textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#666', marginTop: 5 },
  options: { gap: 20 },
  card: { 
    backgroundColor: '#F8F8F8', 
    borderRadius: 20, 
    padding: 25, 
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EEE',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardDark: { backgroundColor: '#1A1A1A', borderColor: '#333' },
  iconContainer: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  cardTitle: { fontFamily: 'Anton', fontSize: 22, color: '#000' },
  cardDesc: { fontSize: 12, color: '#666', textAlign: 'center', marginTop: 5, paddingHorizontal: 20 },
  textWhite: { color: '#FFF' },
  textGray: { color: '#999' },
  logout: { marginTop: 40, alignSelf: 'center' },
  logoutText: { fontFamily: 'Anton', color: '#FF4444', fontSize: 16 },
});
