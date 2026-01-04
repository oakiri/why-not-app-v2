import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';

import { subscribeToOrder } from '../../../services/firebase.service';
import type { Order, RootStackParamList } from '../../../types';
import { COLORS, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, DELIVERY_TYPE_LABELS } from '../../../constants';

type OrderDetailRouteProp = RouteProp<RootStackParamList, 'OrderDetail'>;

export default function OrderDetailScreen() {
  const route = useRoute<OrderDetailRouteProp>();
  const navigation = useNavigation();
  const { orderId } = route.params;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToOrder(orderId, (updatedOrder) => {
      setOrder(updatedOrder);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [orderId]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.errorContainer}>
        <Text>No se encontró el pedido</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ color: COLORS.primary, marginTop: 16 }}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const getStatusStep = (status: string) => {
    const steps = ['pending', 'confirmed', 'preparing', 'ready', 'completed'];
    return steps.indexOf(status);
  };

  const currentStep = getStatusStep(order.status);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pedido #{order.id.substring(0, 8)}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Status Tracker */}
        <View style={styles.statusCard}>
          <Text style={styles.statusTitle}>Estado del Pedido</Text>
          <View style={[styles.statusBadge, { backgroundColor: ORDER_STATUS_COLORS[order.status] }]}>
            <Text style={styles.statusBadgeText}>{ORDER_STATUS_LABELS[order.status]}</Text>
          </View>

          <View style={styles.stepper}>
            {['Recibido', 'Confirmado', 'Cocina', 'Listo', 'Entregado'].map((label, index) => (
              <View key={label} style={styles.stepContainer}>
                <View style={[
                  styles.stepCircle,
                  index <= currentStep && styles.stepCircleActive,
                  order.status === 'cancelled' && styles.stepCircleCancelled
                ]}>
                  {index < currentStep ? (
                    <Ionicons name="checkmark" size={12} color={COLORS.white} />
                  ) : (
                    <Text style={[styles.stepNumber, index <= currentStep && { color: COLORS.white }]}>{index + 1}</Text>
                  )}
                </View>
                <Text style={styles.stepLabel}>{label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Order Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Productos</Text>
          {order.items.map((item) => (
            <View key={item.id} style={styles.itemRow}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemQuantity}>{item.quantity}x</Text>
                <View>
                  <Text style={styles.itemName}>{item.name}</Text>
                  {item.modifiers?.map(mod => (
                    <Text key={mod.id} style={styles.itemModifier}>+ {mod.name}</Text>
                  ))}
                </View>
              </View>
              <Text style={styles.itemPrice}>{item.subtotal.toFixed(2)}€</Text>
            </View>
          ))}
        </View>

        {/* Delivery Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Detalles de Entrega</Text>
          <View style={styles.infoRow}>
            <Ionicons name="bicycle-outline" size={20} color={COLORS.textSecondary} />
            <Text style={styles.infoText}>{DELIVERY_TYPE_LABELS[order.deliveryType]}</Text>
          </View>
          {order.deliveryAddress && (
            <View style={styles.infoRow}>
              <Ionicons name="location-outline" size={20} color={COLORS.textSecondary} />
              <Text style={styles.infoText}>{order.deliveryAddress.street}</Text>
            </View>
          )}
          {order.tableNumber && (
            <View style={styles.infoRow}>
              <Ionicons name="restaurant-outline" size={20} color={COLORS.textSecondary} />
              <Text style={styles.infoText}>Mesa: {order.tableNumber}</Text>
            </View>
          )}
        </View>

        {/* Summary */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text>{order.subtotal.toFixed(2)}€</Text>
          </View>
          {order.deliveryFee > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Envío</Text>
              <Text>{order.deliveryFee.toFixed(2)}€</Text>
            </View>
          )}
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{order.total.toFixed(2)}€</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  headerTitle: { fontSize: 16, fontWeight: '700' },
  content: { flex: 1, padding: 16 },
  statusCard: { backgroundColor: COLORS.white, padding: 16, borderRadius: 12, elevation: 2, marginBottom: 24 },
  statusTitle: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 8 },
  statusBadge: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, marginBottom: 20 },
  statusBadgeText: { color: COLORS.white, fontSize: 12, fontWeight: '700' },
  stepper: { flexDirection: 'row', justifyContent: 'space-between' },
  stepContainer: { alignItems: 'center', flex: 1 },
  stepCircle: { width: 24, height: 24, borderRadius: 12, backgroundColor: COLORS.border, justifyContent: 'center', alignItems: 'center', marginBottom: 4 },
  stepCircleActive: { backgroundColor: COLORS.primary },
  stepCircleCancelled: { backgroundColor: COLORS.error },
  stepNumber: { fontSize: 10, color: COLORS.textSecondary },
  stepLabel: { fontSize: 8, color: COLORS.textSecondary, textAlign: 'center' },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  itemInfo: { flexDirection: 'row', flex: 1 },
  itemQuantity: { fontWeight: '700', marginRight: 8, color: COLORS.primary },
  itemName: { fontSize: 14, fontWeight: '500' },
  itemModifier: { fontSize: 12, color: COLORS.textSecondary },
  itemPrice: { fontSize: 14, fontWeight: '600' },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  infoText: { marginLeft: 12, fontSize: 14, color: COLORS.text },
  summaryCard: { backgroundColor: COLORS.surface, padding: 16, borderRadius: 12, marginBottom: 32 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  summaryLabel: { color: COLORS.textSecondary },
  totalRow: { borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 8, marginTop: 8 },
  totalLabel: { fontSize: 16, fontWeight: '700' },
  totalValue: { fontSize: 18, fontWeight: '800', color: COLORS.primary },
});
