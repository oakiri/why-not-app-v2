import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/theme';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default function ReservationsScreen() {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState('Hoy');
  const [time, setTime] = useState('20:30');
  const [guests, setGuests] = useState(2);

  const handleReservation = async () => {
    if (!user) return;
    setLoading(true);
    try {
      await addDoc(collection(db, 'reservations'), {
        userId: user.uid,
        userName: profile?.name || 'Cliente',
        userPhone: profile?.phone || '',
        date,
        time,
        guests,
        status: 'pendiente',
        createdAt: serverTimestamp()
      });
      Alert.alert("¡Reserva enviada!", "Te confirmaremos por email en unos minutos.");
    } catch (error) {
      Alert.alert("Error", "No se pudo procesar la reserva.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>RESERVAR MESA</Text>
      
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.label}>¿CUÁNDO VIENES?</Text>
          <View style={styles.optionsRow}>
            {['Hoy', 'Mañana', 'Sábado'].map(d => (
              <TouchableOpacity 
                key={d} 
                style={[styles.option, date === d && styles.optionActive]}
                onPress={() => setDate(d)}
              >
                <Text style={[styles.optionText, date === d && styles.optionTextActive]}>{d.toUpperCase()}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>¿A QUÉ HORA?</Text>
          <View style={styles.optionsRow}>
            {['20:30', '21:30', '22:30'].map(t => (
              <TouchableOpacity 
                key={t} 
                style={[styles.option, time === t && styles.optionActive]}
                onPress={() => setTime(t)}
              >
                <Text style={[styles.optionText, time === t && styles.optionTextActive]}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>¿CUÁNTOS SOIS?</Text>
          <View style={styles.counterRow}>
            <TouchableOpacity onPress={() => setGuests(Math.max(1, guests - 1))} style={styles.counterBtn}>
              <Ionicons name="remove" size={24} color="#000" />
            </TouchableOpacity>
            <Text style={styles.counterText}>{guests}</Text>
            <TouchableOpacity onPress={() => setGuests(guests + 1)} style={styles.counterBtn}>
              <Ionicons name="add" size={24} color="#000" />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.submitBtn, loading && { opacity: 0.7 }]} 
          onPress={handleReservation}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#000" /> : <Text style={styles.submitBtnText}>CONFIRMAR RESERVA</Text>}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF', padding: 20 },
  title: { fontFamily: 'Anton', fontSize: 32, color: '#000', marginBottom: 20 },
  section: { marginBottom: 30 },
  label: { fontFamily: 'Anton', fontSize: 14, color: '#999', marginBottom: 15 },
  optionsRow: { flexDirection: 'row', gap: 10 },
  option: { flex: 1, paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: '#EEE', alignItems: 'center' },
  optionActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  optionText: { fontFamily: 'Anton', fontSize: 14, color: '#666' },
  optionTextActive: { color: '#000' },
  counterRow: { flexDirection: 'row', alignItems: 'center', gap: 20 },
  counterBtn: { width: 50, height: 50, borderRadius: 25, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center' },
  counterText: { fontFamily: 'Anton', fontSize: 24 },
  submitBtn: { backgroundColor: colors.primary, height: 60, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginTop: 20 },
  submitBtnText: { fontFamily: 'Anton', fontSize: 18, color: '#000' }
});
