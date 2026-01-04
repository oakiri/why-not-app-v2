import React from 'react';
import { View, Text, ScrollView, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useAuth } from '../../src/context/AuthContext';
import { colors } from '../../src/theme/theme';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function HomeTab() {
  const { profile } = useAuth();

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>HOLA,</Text>
          <Text style={styles.nameText}>{profile?.name?.toUpperCase() || 'AMIGO'}</Text>
        </View>
        <TouchableOpacity onPress={() => router.push('/(tabs)/profile')}>
          <Ionicons name="person-circle-outline" size={40} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.heroCard}>
        <View style={styles.heroContent}>
          <Text style={styles.heroTitle}>¿HAMBRE DE ALGO GRANDE?</Text>
          <Text style={styles.heroSubtitle}>Las mejores burgers de Jerez te esperan.</Text>
          <TouchableOpacity 
            style={styles.heroButton}
            onPress={() => router.push('/(tabs)/menu')}
          >
            <Text style={styles.heroButtonText}>PEDIR AHORA</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>PROMOCIONES DESTACADAS</Text>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.promoScroll}>
          <View style={styles.promoCard}>
            <View style={styles.promoBadge}><Text style={styles.promoBadgeText}>2X1</Text></View>
            <Text style={styles.promoTitle}>MARTES LOCOS</Text>
            <Text style={styles.promoDesc}>En todas nuestras burgers clásicas.</Text>
          </View>

          <View style={[styles.promoCard, { backgroundColor: '#1A1A1A' }]}>
            <View style={[styles.promoBadge, { backgroundColor: colors.primary }]}><Text style={[styles.promoBadgeText, { color: '#000' }]}>NUEVO</Text></View>
            <Text style={[styles.promoTitle, { color: '#FFF' }]}>LA WHY NOT SPECIAL</Text>
            <Text style={[styles.promoDesc, { color: '#999' }]}>Edición limitada con salsa secreta.</Text>
          </View>
        </ScrollView>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>RESERVA TU MESA</Text>
        <TouchableOpacity 
          style={styles.reservationCard}
          onPress={() => Alert.alert("Próximamente", "El sistema de reservas se activará en unos minutos.")}
        >
          <Ionicons name="calendar" size={30} color="#000" />
          <View style={styles.reservationInfo}>
            <Text style={styles.reservationTitle}>¿VIENES A VERNOS?</Text>
            <Text style={styles.reservationSubtitle}>Asegura tu sitio en el local.</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 40 },
  welcomeText: { fontFamily: 'Anton', fontSize: 16, color: '#666' },
  nameText: { fontFamily: 'Anton', fontSize: 28, color: '#000' },
  heroCard: { margin: 20, backgroundColor: colors.primary, borderRadius: 25, padding: 25, overflow: 'hidden' },
  heroContent: { zIndex: 1 },
  heroTitle: { fontFamily: 'Anton', fontSize: 32, color: '#000', lineHeight: 35 },
  heroSubtitle: { fontSize: 14, color: '#000', marginTop: 5, opacity: 0.8 },
  heroButton: { backgroundColor: '#000', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12, marginTop: 15, alignSelf: 'flex-start' },
  heroButtonText: { fontFamily: 'Anton', color: colors.primary, fontSize: 14 },
  section: { marginTop: 10, paddingHorizontal: 20 },
  sectionTitle: { fontFamily: 'Anton', fontSize: 18, color: '#000', marginBottom: 15, letterSpacing: 1 },
  promoScroll: { marginLeft: -20, paddingLeft: 20 },
  promoCard: { width: 280, backgroundColor: '#F8F8F8', borderRadius: 20, padding: 20, marginRight: 15, borderWidth: 1, borderColor: '#EEE' },
  promoBadge: { backgroundColor: '#FF4444', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, alignSelf: 'flex-start', marginBottom: 10 },
  promoBadgeText: { fontFamily: 'Anton', color: '#FFF', fontSize: 12 },
  promoTitle: { fontFamily: 'Anton', fontSize: 20, color: '#000' },
  promoDesc: { fontSize: 12, color: '#666', marginTop: 4 },
  reservationCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.primary, padding: 20, borderRadius: 20, gap: 15 },
  reservationInfo: { flex: 1 },
  reservationTitle: { fontFamily: 'Anton', fontSize: 18, color: '#000' },
  reservationSubtitle: { fontSize: 12, color: '#000', opacity: 0.7 }
});
