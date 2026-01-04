import React, { useState, useEffect, useCallback } from 'react';
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
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useCart, useCartActions } from '../../../hooks/useCart';
import { orderService, userService, addLoyaltyPoints } from '../../../services/firebase.service';
import { useAuth } from '../../../context/AuthContext';
import type { RootStackParamList, DeliveryType, PaymentMethod, Order, OrderItem } from '../../../types';
import { COLORS, DELIVERY_TYPES, PAYMENT_METHODS, ORDER_STATUS, SUCCESS_MESSAGES, ERROR_MESSAGES } from '../../../constants';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function CheckoutScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAuth();
  const cart = useCart();
  const { clearCart } = useCartActions();

  const [deliveryType, setDeliveryType] = useState<DeliveryType>(DELIVERY_TYPES.PICKUP);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PAYMENT_METHODS.CARD);
  const [address, setAddress] = useState('');
  const [tableNumber, setTableNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePlaceOrder = async () => {
    if (!user) {
      Alert.alert('Error', 'Debes iniciar sesión para realizar un pedido');
      return;
    }

    if (deliveryType === DELIVERY_TYPES.DELIVERY && !address.trim()) {
      Alert.alert('Error', 'Por favor, introduce una dirección de entrega');
      return;
    }

    if (deliveryType === DELIVERY_TYPES.DINE_IN && !tableNumber.trim()) {
      Alert.alert('Error', 'Por favor, introduce el número de mesa');
      return;
    }

    try {
      setLoading(true);

      const orderData: Partial<Order> = {
        userId: user.uid,
        userName: user.displayName || 'Cliente',
        userEmail: user.email || '',
        items: cart.items.map(item => ({
          id: item.id,
          itemId: item.itemId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          modifiers: item.modifiers,
          notes: item.notes,
          subtotal: item.subtotal,
        })),
        subtotal: cart.subtotal,
        tax: cart.tax,
        discount: cart.discount,
        deliveryFee: deliveryType === DELIVERY_TYPES.DELIVERY ? cart.deliveryFee : 0,
        total: cart.total,
        status: ORDER_STATUS.PENDING,
        deliveryType,
        deliveryAddress: deliveryType === DELIVERY_TYPES.DELIVERY ? { street: address, city: '', postalCode: '', country: '' } : undefined,
        tableNumber: deliveryType === DELIVERY_TYPES.DINE_IN ? tableNumber : undefined,
        notes,
        paymentMethod,
        paymentStatus: paymentMethod === PAYMENT_METHODS.ONLINE ? 'paid' : 'pending',
      };

      const orderId = await orderService.create(orderData);
      
      // Add loyalty points (10 points per euro)
      const pointsEarned = Math.floor(cart.total * 10);
      await addLoyaltyPoints(user.uid, pointsEarned, `Pedido #${orderId.substring(0, 5)}`, orderId);

      clearCart();
      setLoading(false);
      
      Alert.alert('¡Éxito!', SUCCESS_MESSAGES.ORDER_CREATED, [
        { text: 'Ver pedido', onPress: () => navigation.navigate('OrderDetail', { orderId }) },
        { text: 'Ir a inicio', onPress: () => navigation.navigate('Home') }
      ]);

    } catch (error) {
      console.error('Error placing order:', error);
      Alert.alert('Error', ERROR_MESSAGES.SERVER_ERROR);
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Finalizar Pedido</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Delivery Type */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Método de Entrega</Text>
          <View style={styles.deliveryOptions}>
            <TouchableOpacity
              style={[styles.deliveryOption, deliveryType === DELIVERY_TYPES.PICKUP && styles.deliveryOptionActive]}
              onPress={() => setDeliveryType(DELIVERY_TYPES.PICKUP)}
            >
              <Ionicons name="walk" size={24} color={deliveryType === DELIVERY_TYPES.PICKUP ? COLORS.white : COLORS.text} />
              <Text style={[styles.deliveryOptionText, deliveryType === DELIVERY_TYPES.PICKUP && styles.deliveryOptionTextActive]}>Recoger</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.deliveryOption, deliveryType === DELIVERY_TYPES.DELIVERY && styles.deliveryOptionActive]}
              onPress={() => setDeliveryType(DELIVERY_TYPES.DELIVERY)}
            >
              <Ionicons name="bicycle" size={24} color={deliveryType === DELIVERY_TYPES.DELIVERY ? COLORS.white : COLORS.text} />
              <Text style={[styles.deliveryOptionText, deliveryType === DELIVERY_TYPES.DELIVERY && styles.deliveryOptionTextActive]}>Domicilio</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.deliveryOption, deliveryType === DELIVERY_TYPES.DINE_IN && styles.deliveryOptionActive]}
              onPress={() => setDeliveryType(DELIVERY_TYPES.DINE_IN)}
            >
              <Ionicons name="restaurant" size={24} color={deliveryType === DELIVERY_TYPES.DINE_IN ? COLORS.white : COLORS.text} />
              <Text style={[styles.deliveryOptionText, deliveryType === DELIVERY_TYPES.DINE_IN && styles.deliveryOptionTextActive]}>En mesa</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Conditional Inputs */}
        {deliveryType === DELIVERY_TYPES.DELIVERY && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Dirección de Entrega</Text>
            <TextInput
              style={styles.input}
              placeholder="Introduce tu dirección completa"
              value={address}
              onChangeText={setAddress}
              multiline
            />
          </View>
        )}

        {deliveryType === DELIVERY_TYPES.DINE_IN && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Número de Mesa</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: 5"
              value={tableNumber}
              onChangeText={setTableNumber}
              keyboardType="numeric"
            />
          </View>
        )}

        {/* Payment Method */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Método de Pago</Text>
          <View style={styles.paymentOptions}>
            <TouchableOpacity
              style={[styles.paymentOption, paymentMethod === PAYMENT_METHODS.CARD && styles.paymentOptionActive]}
              onPress={() => setPaymentMethod(PAYMENT_METHODS.CARD)}
            >
              <Ionicons name="card" size={20} color={paymentMethod === PAYMENT_METHODS.CARD ? COLORS.primary : COLORS.textSecondary} />
              <Text style={styles.paymentOptionText}>Tarjeta (en local)</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.paymentOption, paymentMethod === PAYMENT_METHODS.CASH && styles.paymentOptionActive]}
              onPress={() => setPaymentMethod(PAYMENT_METHODS.CASH)}
            >
              <Ionicons name="cash" size={20} color={paymentMethod === PAYMENT_METHODS.CASH ? COLORS.primary : COLORS.textSecondary} />
              <Text style={styles.paymentOptionText}>Efectivo</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Notes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notas adicionales</Text>
          <TextInput
            style={[styles.input, { height: 80 }]}
            placeholder="Ej: Sin cebolla, llamar al timbre..."
            value={notes}
            onChangeText={setNotes}
            multiline
          />
        </View>

        {/* Summary */}
        <View style={styles.summarySection}>
          <Text style={styles.sectionTitle}>Resumen</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>{cart.subtotal.toFixed(2)}€</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>IVA (10%)</Text>
            <Text style={styles.summaryValue}>{cart.tax.toFixed(2)}€</Text>
          </View>
          {deliveryType === DELIVERY_TYPES.DELIVERY && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Gastos de envío</Text>
              <Text style={styles.summaryValue}>{cart.deliveryFee.toFixed(2)}€</Text>
            </View>
          )}
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{cart.total.toFixed(2)}€</Text>
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
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text style={styles.placeOrderButtonText}>Confirmar Pedido</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text },
  content: { flex: 1, padding: 16 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: COLORS.text, marginBottom: 12 },
  deliveryOptions: { flexDirection: 'row', justifyContent: 'space-between' },
  deliveryOption: { flex: 1, alignItems: 'center', padding: 12, borderRadius: 12, backgroundColor: COLORS.surface, marginHorizontal: 4 },
  deliveryOptionActive: { backgroundColor: COLORS.primary },
  deliveryOptionText: { marginTop: 4, fontSize: 12, color: COLORS.text },
  deliveryOptionTextActive: { color: COLORS.white, fontWeight: '600' },
  input: { backgroundColor: COLORS.surface, borderRadius: 12, padding: 12, fontSize: 14, color: COLORS.text, textAlignVertical: 'top' },
  paymentOptions: { gap: 8 },
  paymentOption: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border },
  paymentOptionActive: { borderColor: COLORS.primary, backgroundColor: '#FFFBE6' },
  paymentOptionText: { marginLeft: 12, fontSize: 14, color: COLORS.text },
  summarySection: { backgroundColor: COLORS.surface, padding: 16, borderRadius: 12, marginBottom: 32 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  summaryLabel: { fontSize: 14, color: COLORS.textSecondary },
  summaryValue: { fontSize: 14, color: COLORS.text, fontWeight: '500' },
  totalRow: { marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: COLORS.border },
  totalLabel: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  totalValue: { fontSize: 20, fontWeight: '800', color: COLORS.primary },
  footer: { padding: 16, borderTopWidth: 1, borderTopColor: COLORS.border },
  placeOrderButton: { backgroundColor: COLORS.primary, padding: 16, borderRadius: 12, alignItems: 'center' },
  placeOrderButtonText: { color: COLORS.white, fontSize: 16, fontWeight: '700' },
  disabledButton: { opacity: 0.7 },
});
