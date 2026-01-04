import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { subscribeToPendingOrders, reservationService } from '../../../services/firebase.service';
import type { Order, Reservation, DashboardStats } from '../../../types';
import { COLORS, ORDER_STATUS_COLORS, ORDER_STATUS_LABELS } from '../../../constants';

export default function DashboardScreen() {
  const [pendingOrders, setPendingOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    todayOrders: 0,
    todayRevenue: 0,
    pendingOrders: 0,
    activeReservations: 0,
    lowStockItems: 0,
    newCustomers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToPendingOrders((orders) => {
      setPendingOrders(orders);
      setStats(prev => ({
        ...prev,
        pendingOrders: orders.length,
        todayOrders: orders.length + 15, // Mock data for today
        todayRevenue: orders.reduce((sum, o) => sum + o.total, 0) + 450,
      }));
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const renderStatCard = (title: string, value: string | number, icon: string, color: string) => (
    <View style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon as any} size={24} color={color} />
      </View>
      <View>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statTitle}>{title}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Panel de Control</Text>
        <TouchableOpacity style={styles.notificationButton}>
          <Ionicons name="notifications-outline" size={24} color={COLORS.text} />
          <View style={styles.badge} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          {renderStatCard('Pedidos Hoy', stats.todayOrders, 'cart-outline', COLORS.primary)}
          {renderStatCard('Ventas Hoy', `${stats.todayRevenue.toFixed(0)}€`, 'cash-outline', COLORS.success)}
          {renderStatCard('Pendientes', stats.pendingOrders, 'time-outline', COLORS.warning)}
          {renderStatCard('Reservas', 4, 'calendar-outline', COLORS.info)}
        </View>

        {/* Pending Orders Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Pedidos Pendientes</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>Ver todos</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator color={COLORS.primary} style={{ margin: 20 }} />
          ) : pendingOrders.length > 0 ? (
            pendingOrders.map((order) => (
              <TouchableOpacity key={order.id} style={styles.orderCard}>
                <View style={styles.orderHeader}>
                  <Text style={styles.orderId}>#{order.id.substring(0, 6)}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: ORDER_STATUS_COLORS[order.status] }]}>
                    <Text style={styles.statusText}>{ORDER_STATUS_LABELS[order.status]}</Text>
                  </View>
                </View>
                <View style={styles.orderInfo}>
                  <Text style={styles.customerName}>{order.userName}</Text>
                  <Text style={styles.orderTime}>Hace 5 min</Text>
                </View>
                <View style={styles.orderFooter}>
                  <Text style={styles.orderItems}>{order.items.length} productos</Text>
                  <Text style={styles.orderTotal}>{order.total.toFixed(2)}€</Text>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="checkmark-circle-outline" size={48} color={COLORS.success} />
              <Text style={styles.emptyText}>¡Todo al día! No hay pedidos pendientes.</Text>
            </View>
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Acciones Rápidas</Text>
          <View style={styles.actionGrid}>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="add-circle-outline" size={24} color={COLORS.primary} />
              <Text style={styles.actionText}>Nuevo Pedido</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="restaurant-outline" size={24} color={COLORS.primary} />
              <Text style={styles.actionText}>Gestión Menú</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="people-outline" size={24} color={COLORS.primary} />
              <Text style={styles.actionText}>Clientes</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="settings-outline" size={24} color={COLORS.primary} />
              <Text style={styles.actionText}>Ajustes</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  headerTitle: { fontSize: 20, fontWeight: '800', color: COLORS.text },
  notificationButton: { padding: 4 },
  badge: { position: 'absolute', top: 4, right: 4, width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.error, borderWidth: 2, borderColor: COLORS.white },
  content: { flex: 1, padding: 16 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  statCard: { width: '48%', backgroundColor: COLORS.white, padding: 16, borderRadius: 16, flexDirection: 'row', alignItems: 'center', gap: 12, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  statIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  statValue: { fontSize: 18, fontWeight: '700', color: COLORS.text },
  statTitle: { fontSize: 12, color: COLORS.textSecondary },
  section: { marginBottom: 32 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text },
  seeAllText: { color: COLORS.primary, fontWeight: '600' },
  orderCard: { backgroundColor: COLORS.white, padding: 16, borderRadius: 16, marginBottom: 12, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  orderId: { fontSize: 14, fontWeight: '700', color: COLORS.textSecondary },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  statusText: { color: COLORS.white, fontSize: 10, fontWeight: '700' },
  orderInfo: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  customerName: { fontSize: 16, fontWeight: '600' },
  orderTime: { fontSize: 12, color: COLORS.textSecondary },
  orderFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 8 },
  orderItems: { fontSize: 12, color: COLORS.textSecondary },
  orderTotal: { fontSize: 16, fontWeight: '700', color: COLORS.primary },
  emptyState: { alignItems: 'center', padding: 32 },
  emptyText: { marginTop: 12, color: COLORS.textSecondary, textAlign: 'center' },
  actionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  actionButton: { width: '23%', backgroundColor: COLORS.white, padding: 12, borderRadius: 12, alignItems: 'center', gap: 8, elevation: 2 },
  actionText: { fontSize: 10, fontWeight: '600', textAlign: 'center' },
});
