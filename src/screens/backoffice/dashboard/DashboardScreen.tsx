import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { subscribeToPendingOrders, auth } from '../../../lib/firebase';
import { useAuth } from '../../../context/AuthContext';
import type { Order, DashboardStats } from '../../../types';
import { COLORS, ORDER_STATUS_COLORS, ORDER_STATUS_LABELS } from '../../../constants';

const { width } = Dimensions.get('window');

export default function DashboardScreen() {
  const { profile } = useAuth();
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

  const isMaster = profile?.role === 'master';
  const permissions = profile?.permissions;

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

  const renderMenuOption = (title: string, icon: any, route: string, enabled: boolean = true) => {
    if (!enabled) return null;
    return (
      <TouchableOpacity 
        style={styles.menuOption} 
        onPress={() => router.push(route as any)}
      >
        <Ionicons name={icon} size={24} color={COLORS.primary} />
        <Text style={styles.menuOptionText}>{title}</Text>
        <Ionicons name="chevron-forward" size={20} color="#CCC" />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Panel de Control</Text>
          <View style={[styles.roleBadge, { backgroundColor: isMaster ? '#FFD700' : COLORS.primary }]}>
            <Text style={styles.roleText}>{profile?.role?.toUpperCase()}</Text>
          </View>
        </View>
        <TouchableOpacity onPress={() => auth.signOut()} style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={24} color={COLORS.text} />
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

        {/* Quick Actions / Management Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>GESTIÓN OPERATIVA</Text>
          {renderMenuOption('Gestión de Pedidos', 'list', '/(backoffice)/orders', isMaster || permissions?.manageOrders)}
          {renderMenuOption('Gestión de Menú', 'restaurant-outline', '/(backoffice)/menu', isMaster || permissions?.manageMenu)}
          {renderMenuOption('Gestión de Reservas', 'calendar-outline', '/(backoffice)/reservations', isMaster || permissions?.manageReservations)}
          {renderMenuOption('Promociones', 'pricetag-outline', '/(backoffice)/promotions', isMaster || permissions?.managePromotions)}
        </View>

        {isMaster && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>ADMINISTRACIÓN (MASTER)</Text>
            {renderMenuOption('Gestión de Equipo', 'people-circle-outline', '/(backoffice)/employees')}
            {renderMenuOption('Analíticas Avanzadas', 'bar-chart-outline', '/(backoffice)/analytics')}
            {renderMenuOption('Configuración TPV', 'settings-outline', '/(backoffice)/settings')}
          </View>
        )}

        {/* Pending Orders Summary */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>PEDIDOS PENDIENTES</Text>
            <TouchableOpacity onPress={() => router.push('/(backoffice)/orders')}>
              <Text style={styles.seeAllText}>Ver todos</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator color={COLORS.primary} style={{ margin: 20 }} />
          ) : pendingOrders.length > 0 ? (
            pendingOrders.slice(0, 3).map((order) => (
              <TouchableOpacity key={order.id} style={styles.orderCard}>
                <View style={styles.orderHeader}>
                  <Text style={styles.orderId}>#{order.id.substring(0, 6)}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: ORDER_STATUS_COLORS[order.status] }]}>
                    <Text style={styles.statusText}>{ORDER_STATUS_LABELS[order.status]}</Text>
                  </View>
                </View>
                <View style={styles.orderInfo}>
                  <Text style={styles.customerName}>{order.userName}</Text>
                  <Text style={styles.orderTotal}>{order.total.toFixed(2)}€</Text>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="checkmark-circle-outline" size={48} color={COLORS.success} />
              <Text style={styles.emptyText}>¡Todo al día!</Text>
            </View>
          )}
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: COLORS.border, backgroundColor: '#FFF' },
  headerTitle: { fontSize: 20, fontFamily: 'Anton', color: COLORS.text },
  roleBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, marginTop: 2 },
  roleText: { fontSize: 10, fontWeight: 'bold', color: '#000' },
  logoutButton: { padding: 8 },
  content: { flex: 1, padding: 16 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  statCard: { width: (width - 44) / 2, backgroundColor: COLORS.white, padding: 16, borderRadius: 16, flexDirection: 'row', alignItems: 'center', gap: 12, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  statIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  statValue: { fontSize: 18, fontFamily: 'Anton', color: COLORS.text },
  statTitle: { fontSize: 12, color: COLORS.textSecondary },
  section: { marginBottom: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 14, fontFamily: 'Anton', color: '#999', letterSpacing: 1 },
  seeAllText: { color: COLORS.primary, fontWeight: '600', fontSize: 12 },
  menuOption: { backgroundColor: '#FFF', flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 12, marginBottom: 8, elevation: 1 },
  menuOptionText: { flex: 1, fontFamily: 'Anton', fontSize: 16, marginLeft: 12, color: '#333' },
  orderCard: { backgroundColor: COLORS.white, padding: 12, borderRadius: 12, marginBottom: 8, elevation: 1 },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  orderId: { fontSize: 12, fontWeight: '700', color: COLORS.textSecondary },
  statusBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  statusText: { color: COLORS.white, fontSize: 9, fontWeight: '700' },
  orderInfo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  customerName: { fontSize: 14, fontWeight: '600' },
  orderTotal: { fontSize: 14, fontWeight: '700', color: COLORS.primary },
  emptyState: { alignItems: 'center', padding: 20, backgroundColor: '#FFF', borderRadius: 12 },
  emptyText: { marginTop: 8, color: COLORS.textSecondary, fontSize: 12 },
});
