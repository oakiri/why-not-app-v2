import React, { useState } from 'react';
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
import { router } from 'expo-router';

import { useCart, useCartActions } from '../../../hooks/useCart';
import { auth, db } from '../../../lib/firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { colors } from '../../../theme/theme';

type DeliveryType = 'pickup' | 'delivery' | 'table';
type PaymentMethod = 'card' | 'cash';

export default function CheckoutScreen() {
  const cart = useCart();
  const { clearCart } = useCartActions();

  const [deliveryType, setDeliveryType] = useState<DeliveryType>('pickup');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [address, setAddress] = useState('');
  const [tableNumber, setTableNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const deliveryFee = deliveryType === 'delivery' ? 2.50 : 0;
  const total = cart.total + deliveryFee;

  const handlePlaceOrder = async () => {
    const user = auth.currentUser;
    if (!user) {
      Alert.alert('Error', 'Debes iniciar sesión para realizar un pedido');
      return;
    }

    if (deliveryType === 'delivery' && !address.trim()) {
      Alert.alert('Error', 'Por favor, introduce una dirección de entrega');
      return;
    }

    if (deliveryType === 'table' && !tableNumber.trim()) {
      Alert.alert('Error', 'Por favor, introduce el número de mesa');
      return;
    }

    try {
      setLoading(true);

      const orderData = {
        userId: user.uid,
        userEmail: user.email || '',
        items: cart.items.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          doneness: item.doneness || null,
          extras: item.extras || []
        })),
        subtotal: cart.total,
        deliveryFee,
        total: total,
        status: 'pending',
        deliveryType,
        deliveryAddress: deliveryType === 'delivery' ? address : null,
        tableNumber: deliveryType === 'table' ? tableNumber : null,
        notes,
        paymentMethod,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'orders'), orderData);
      
      clearCart();
      setLoading(false);
      
      Alert.alert('¡ÉXITO!', 'Tu pedido ha sido enviado a cocina.', [
        { text: 'VER PEDIDO', onPress: () => router.replace(`/(tabs)/orders/${docRef.id}`) },
        { text: 'IR A INICIO', onPress: () => router.replace('/(tabs)/home') }
      ]);

    } catch (error) {
      console.error('Error placing order:', error);
      Alert.alert('Error', 'No se pudo procesar el pedido. Inténtalo de nuevo.');
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>FINALIZAR PEDIDO</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>MÉTODO DE ENTREGA</Text>
          <View style={styles.deliveryOptions}>
            <TouchableOpacity
              style={[styles.deliveryOption, deliveryType === 'pickup' && styles.deliveryOptionActive]}
              onPress={() => setDeliveryType('pickup')}
            >
              <Ionicons name="walk" size={24} color={deliveryType === 'pickup' ? '#000' : '#666'} />
              <Text style={[styles.deliveryOptionText, deliveryType === 'pickup' && styles.deliveryOptionTextActive]}>RECOGER</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.deliveryOption, deliveryType === 'delivery' && styles.deliveryOptionActive]}
              onPress={() => setDeliveryType('delivery')}
            >
              <Ionicons name="bicycle" size={24} color={deliveryType === 'delivery' ? '#000' : '#666'} />
              <Text style={[styles.deliveryOptionText, deliveryType === 'delivery' && styles.deliveryOptionTextActive]}>DOMICILIO</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.deliveryOption, deliveryType === 'table' && styles.deliveryOptionActive]}
              onPress={() => setDeliveryType('table')}
            >
              <Ionicons name="restaurant" size={24} color={deliveryType === 'table' ? '#000' : '#666'} />
              <Text style={[styles.deliveryOptionText, deliveryType === 'table' && styles.deliveryOptionTextActive]}>EN MESA</Text>
            </TouchableOpacity>
          </View>
        </View>

        {deliveryType === 'delivery' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>DIRECCIÓN DE ENTREGA</Text>
            <TextInput
              style={styles.input}
              placeholder="Introduce tu dirección completa"
              value={address}
              onChangeText={setAddress}
              multiline
            />
          </View>
        )}

        {deliveryType === 'table' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>NÚMERO DE MESA</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: 5"
              value={tableNumber}
              onChangeText={setTableNumber}
              keyboardType="numeric"
            />
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>MÉTODO DE PAGO</Text>
          <View style={styles.paymentOptions}>
            <TouchableOpacity
              style={[styles.paymentOption, paymentMethod === 'card' && styles.paymentOptionActive]}
              onPress={() => setPaymentMethod('card')}
            >
              <Ionicons name="card" size={20} color={paymentMethod === 'card' ? colors.primary : '#666'} />
              <Text style={styles.paymentOptionText}>TARJETA (EN LOCAL)</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.paymentOption, paymentMethod === 'cash' && styles.paymentOptionActive]}
              onPress={() => setPaymentMethod('cash')}
            >
              <Ionicons name="cash" size={20} color={paymentMethod === 'cash' ? colors.primary : '#666'} />
              <Text style={styles.paymentOptionText}>EFECTIVO</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>NOTAS ADICIONALES</Text>
          <TextInput
            style={[styles.input, { height: 80 }]}
            placeholder="Ej: Sin cebolla, llamar al timbre..."
            value={notes}
            onChangeText={setNotes}
            multiline
          />
        </View>

        <View style={styles.summarySection}>
          <Text style={styles.sectionTitle}>RESUMEN</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>{cart.total.toFixed(2)}€</Text>
          </View>
          {deliveryType === 'delivery' && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Gastos de envío</Text>
              <Text style={styles.summaryValue}>{deliveryFee.toFixed(2)}€</Text>
            </View>
          )}
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>TOTAL</Text>
            <Text style={styles.totalValue}>{total.toFixed(2)}€</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.placeOrderButton, loading && styles.disabledButton]}
          onPress={handlePlaceOrder}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Text style={styles.placeOrderButtonText}>CONFIRMAR PEDIDO</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#EEE' },
  headerTitle: { fontFamily: 'Anton', fontSize: 20, color: '#000' },
  content: { flex: 1, padding: 16 },
  section: { marginBottom: 24 },
  sectionTitle: { fontFamily: 'Anton', fontSize: 14, color: colors.primary, marginBottom: 12 },
  deliveryOptions: { flexDirection: 'row', gap: 10 },
  deliveryOption: { flex: 1, alignItems: 'center', padding: 12, borderRadius: 12, backgroundColor: '#F9F9F9', borderWidth: 1, borderColor: '#EEE' },
  deliveryOptionActive: { backgroundColor: '#FFFBE6', borderColor: colors.primary },
  deliveryOptionText: { fontFamily: 'Anton', marginTop: 4, fontSize: 10, color: '#666' },
  deliveryOptionTextActive: { color: '#000' },
  input: { fontFamily: 'Anton', backgroundColor: '#F9F9F9', borderRadius: 12, padding: 12, fontSize: 14, color: '#000', textAlignVertical: 'top', borderWidth: 1, borderColor: '#EEE' },
  paymentOptions: { gap: 8 },
  paymentOption: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#EEE', backgroundColor: '#F9F9F9' },
  paymentOptionActive: { borderColor: colors.primary, backgroundColor: '#FFFBE6' },
  paymentOptionText: { fontFamily: 'Anton', marginLeft: 12, fontSize: 14, color: '#000' },
  summarySection: { backgroundColor: '#F9F9F9', padding: 16, borderRadius: 12, marginBottom: 32 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  summaryLabel: { fontSize: 14, color: '#666' },
  summaryValue: { fontFamily: 'Anton', fontSize: 14, color: '#000' },
  totalRow: { marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#DDD' },
  totalLabel: { fontFamily: 'Anton', fontSize: 18, color: '#000' },
  totalValue: { fontFamily: 'Anton', fontSize: 22, color: colors.primary },
  footer: { padding: 16, borderTopWidth: 1, borderTopColor: '#EEE' },
  placeOrderButton: { backgroundColor: colors.primary, padding: 16, borderRadius: 12, alignItems: 'center', elevation: 3 },
  placeOrderButtonText: { fontFamily: 'Anton', color: '#000', fontSize: 18 },
  disabledButton: { opacity: 0.7 },
});
