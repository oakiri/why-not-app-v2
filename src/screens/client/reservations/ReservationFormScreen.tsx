import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';

import { reservationService, getAvailableTables } from '../../../services/firebase.service';
import { useAuth } from '../../../context/AuthContext';
import { COLORS, RESERVATION_TIME_SLOTS, SUCCESS_MESSAGES, ERROR_MESSAGES } from '../../../constants';

export default function ReservationFormScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();

  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedTime, setSelectedTime] = useState('');
  const [guests, setGuests] = useState('2');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreateReservation = async () => {
    if (!user) {
      Alert.alert('Error', 'Debes iniciar sesión para reservar');
      return;
    }

    if (!selectedTime) {
      Alert.alert('Error', 'Por favor, selecciona una hora');
      return;
    }

    try {
      setLoading(true);

      // Check table availability
      const availableTables = await getAvailableTables(date, selectedTime, parseInt(guests));
      
      if (availableTables.length === 0) {
        Alert.alert('Lo sentimos', 'No hay mesas disponibles para esa hora y número de personas.');
        setLoading(false);
        return;
      }

      const reservationData = {
        userId: user.uid,
        userName: user.displayName || 'Cliente',
        userEmail: user.email || '',
        userPhone: user.phoneNumber || '',
        date: date,
        time: selectedTime,
        numberOfPeople: parseInt(guests),
        tableId: availableTables[0].id,
        tableName: availableTables[0].name,
        status: 'pending',
        notes,
      };

      await reservationService.create(reservationData);
      
      setLoading(false);
      Alert.alert('¡Éxito!', SUCCESS_MESSAGES.RESERVATION_CREATED, [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);

    } catch (error) {
      console.error('Error creating reservation:', error);
      Alert.alert('Error', ERROR_MESSAGES.SERVER_ERROR);
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nueva Reserva</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Date Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Fecha</Text>
          <TouchableOpacity
            style={styles.datePickerButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Ionicons name="calendar-outline" size={20} color={COLORS.primary} />
            <Text style={styles.dateText}>{date.toLocaleDateString()}</Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              minimumDate={new Date()}
              onChange={(event, selectedDate) => {
                setShowDatePicker(false);
                if (selectedDate) setDate(selectedDate);
              }}
            />
          )}
        </View>

        {/* Time Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hora</Text>
          <View style={styles.timeGrid}>
            {RESERVATION_TIME_SLOTS.map((time) => (
              <TouchableOpacity
                key={time}
                style={[styles.timeSlot, selectedTime === time && styles.timeSlotActive]}
                onPress={() => setSelectedTime(time)}
              >
                <Text style={[styles.timeSlotText, selectedTime === time && styles.timeSlotTextActive]}>
                  {time}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Guests */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Número de Personas</Text>
          <View style={styles.guestSelector}>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
              <TouchableOpacity
                key={num}
                style={[styles.guestButton, guests === num.toString() && styles.guestButtonActive]}
                onPress={() => setGuests(num.toString())}
              >
                <Text style={[styles.guestButtonText, guests === num.toString() && styles.guestButtonTextActive]}>
                  {num}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Notes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Peticiones Especiales</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej: Trona para bebé, alergias, mesa cerca de la ventana..."
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={4}
          />
        </View>

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.disabledButton]}
          onPress={handleCreateReservation}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text style={styles.submitButtonText}>Confirmar Reserva</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  content: { flex: 1, padding: 16 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 12 },
  datePickerButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, padding: 16, borderRadius: 12 },
  dateText: { marginLeft: 12, fontSize: 16, color: COLORS.text },
  timeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  timeSlot: { width: '23%', paddingVertical: 10, alignItems: 'center', borderRadius: 8, backgroundColor: COLORS.surface },
  timeSlotActive: { backgroundColor: COLORS.primary },
  timeSlotText: { fontSize: 14, color: COLORS.text },
  timeSlotTextActive: { color: COLORS.white, fontWeight: '600' },
  guestSelector: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  guestButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.surface, justifyContent: 'center', alignItems: 'center' },
  guestButtonActive: { backgroundColor: COLORS.primary },
  guestButtonText: { fontSize: 14, color: COLORS.text },
  guestButtonTextActive: { color: COLORS.white, fontWeight: '600' },
  input: { backgroundColor: COLORS.surface, borderRadius: 12, padding: 12, fontSize: 14, textAlignVertical: 'top' },
  submitButton: { backgroundColor: COLORS.primary, padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 16, marginBottom: 32 },
  submitButtonText: { color: COLORS.white, fontSize: 16, fontWeight: '700' },
  disabledButton: { opacity: 0.7 },
});
