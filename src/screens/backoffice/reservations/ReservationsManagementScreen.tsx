import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { db } from '../../../lib/firebase';
import { collection, query, onSnapshot, doc, updateDoc, orderBy } from 'firebase/firestore';
import { colors } from '../../../theme/theme';

export default function ReservationsManagementScreen() {
  const [reservations, setReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'reservations'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      setReservations(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    await updateDoc(doc(db, 'reservations', id), { status });
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.customerName}>{item.userName.toUpperCase()}</Text>
        <View style={[styles.badge, { backgroundColor: item.status === 'confirmada' ? '#4CAF50' : '#FF9800' }]}>
          <Text style={styles.badgeText}>{item.status.toUpperCase()}</Text>
        </View>
      </View>
      
      <View style={styles.infoRow}>
        <Ionicons name="calendar-outline" size={16} color="#666" />
        <Text style={styles.infoText}>{item.date} a las {item.time}</Text>
      </View>
      
      <View style={styles.infoRow}>
        <Ionicons name="people-outline" size={16} color="#666" />
        <Text style={styles.infoText}>{item.guests} personas</Text>
      </View>

      {item.status === 'pendiente' && (
        <View style={styles.actions}>
          <TouchableOpacity style={styles.confirmBtn} onPress={() => updateStatus(item.id, 'confirmada')}>
            <Text style={styles.actionText}>CONFIRMAR</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelBtn} onPress={() => updateStatus(item.id, 'cancelada')}>
            <Text style={styles.actionText}>RECHAZAR</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>GESTIÓN DE RESERVAS</Text>
      {loading ? (
        <ActivityIndicator color={colors.primary} size="large" />
      ) : (
        <FlatList
          data={reservations}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 40 }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F8F8', padding: 20 },
  title: { fontFamily: 'Anton', fontSize: 28, color: '#000', marginBottom: 20 },
  card: { backgroundColor: '#FFF', borderRadius: 15, padding: 15, marginBottom: 15, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  customerName: { fontFamily: 'Anton', fontSize: 18 },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  badgeText: { color: '#FFF', fontSize: 10, fontWeight: 'bold' },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 5 },
  infoText: { fontSize: 14, color: '#666' },
  actions: { flexDirection: 'row', gap: 10, marginTop: 15 },
  confirmBtn: { flex: 1, backgroundColor: '#4CAF50', padding: 10, borderRadius: 8, alignItems: 'center' },
  cancelBtn: { flex: 1, backgroundColor: '#FF4444', padding: 10, borderRadius: 8, alignItems: 'center' },
  actionText: { fontFamily: 'Anton', color: '#FFF', fontSize: 12 }
});
