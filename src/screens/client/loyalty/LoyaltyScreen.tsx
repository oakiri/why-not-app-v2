import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { getUserLoyaltyPoints } from '../../../services/firebase.service';
import { useAuth } from '../../../context/AuthContext';
import type { LoyaltyPoints, LoyaltyTransaction } from '../../../types';
import { COLORS, LOYALTY_TIER_COLORS, LOYALTY_TIER_LABELS } from '../../../constants';

export default function LoyaltyScreen() {
  const { user } = useAuth();
  const [loyalty, setLoyalty] = useState<LoyaltyPoints | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      const loadLoyalty = async () => {
        const data = await getUserLoyaltyPoints(user.uid);
        setLoyalty(data);
        setLoading(false);
      };
      loadLoyalty();
    }
  }, [user]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const renderTransaction = ({ item }: { item: LoyaltyTransaction }) => (
    <View style={styles.transactionItem}>
      <View style={styles.transactionIcon}>
        <Ionicons 
          name={item.type === 'earned' ? 'add-circle' : 'remove-circle'} 
          size={24} 
          color={item.type === 'earned' ? COLORS.success : COLORS.error} 
        />
      </View>
      <View style={styles.transactionInfo}>
        <Text style={styles.transactionReason}>{item.reason}</Text>
        <Text style={styles.transactionDate}>
          {new Date(item.createdAt).toLocaleDateString()}
        </Text>
      </View>
      <Text style={[
        styles.transactionPoints,
        { color: item.type === 'earned' ? COLORS.success : COLORS.error }
      ]}>
        {item.type === 'earned' ? '+' : '-'}{item.points}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Loyalty Card */}
        <View style={[styles.loyaltyCard, { backgroundColor: LOYALTY_TIER_COLORS[loyalty?.tier || 'bronze'] }]}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>WHY NOT Rewards</Text>
            <Ionicons name="qr-code-outline" size={24} color={COLORS.white} />
          </View>
          
          <View style={styles.pointsContainer}>
            <Text style={styles.pointsValue}>{loyalty?.points || 0}</Text>
            <Text style={styles.pointsLabel}>Puntos disponibles</Text>
          </View>

          <View style={styles.cardFooter}>
            <View>
              <Text style={styles.tierLabel}>Nivel actual</Text>
              <Text style={styles.tierValue}>{LOYALTY_TIER_LABELS[loyalty?.tier || 'bronze']}</Text>
            </View>
            <View style={styles.tierBadge}>
              <Ionicons name="ribbon" size={20} color={COLORS.white} />
            </View>
          </View>
        </View>

        {/* Progress Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tu progreso</Text>
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { width: '60%' }]} />
          </View>
          <Text style={styles.progressText}>Te faltan 240 puntos para el nivel Plata</Text>
        </View>

        {/* Rewards Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recompensas disponibles</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.rewardsList}>
            <TouchableOpacity style={styles.rewardCard}>
              <View style={styles.rewardIcon}>
                <Ionicons name="fast-food" size={32} color={COLORS.primary} />
              </View>
              <Text style={styles.rewardTitle}>Hamburguesa Gratis</Text>
              <Text style={styles.rewardCost}>1000 pts</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.rewardCard}>
              <View style={styles.rewardIcon}>
                <Ionicons name="beer" size={32} color={COLORS.primary} />
              </View>
              <Text style={styles.rewardTitle}>Bebida Gratis</Text>
              <Text style={styles.rewardCost}>300 pts</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.rewardCard}>
              <View style={styles.rewardIcon}>
                <Ionicons name="ice-cream" size={32} color={COLORS.primary} />
              </View>
              <Text style={styles.rewardTitle}>Postre Gratis</Text>
              <Text style={styles.rewardCost}>500 pts</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* History Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Historial de puntos</Text>
          {loyalty?.transactions && loyalty.transactions.length > 0 ? (
            loyalty.transactions.slice(0, 5).map((item) => (
              <View key={item.id}>
                {renderTransaction({ item })}
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No hay transacciones recientes</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { flex: 1, padding: 16 },
  loyaltyCard: { padding: 20, borderRadius: 20, height: 200, justifyContent: 'space-between', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, marginBottom: 24 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { color: COLORS.white, fontSize: 16, fontWeight: '700', letterSpacing: 1 },
  pointsContainer: { alignItems: 'center' },
  pointsValue: { color: COLORS.white, fontSize: 48, fontWeight: '800' },
  pointsLabel: { color: COLORS.white, fontSize: 14, opacity: 0.9 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  tierLabel: { color: COLORS.white, fontSize: 12, opacity: 0.8 },
  tierValue: { color: COLORS.white, fontSize: 18, fontWeight: '700' },
  tierBadge: { backgroundColor: 'rgba(255,255,255,0.2)', padding: 8, borderRadius: 12 },
  section: { marginBottom: 32 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text, marginBottom: 16 },
  progressBarContainer: { height: 12, backgroundColor: COLORS.surface, borderRadius: 6, overflow: 'hidden', marginBottom: 8 },
  progressBar: { height: '100%', backgroundColor: COLORS.primary },
  progressText: { fontSize: 12, color: COLORS.textSecondary },
  rewardsList: { marginHorizontal: -16, paddingHorizontal: 16 },
  rewardCard: { width: 140, backgroundColor: COLORS.white, padding: 16, borderRadius: 16, marginRight: 12, alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  rewardIcon: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#FFFBE6', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  rewardTitle: { fontSize: 14, fontWeight: '600', textAlign: 'center', marginBottom: 4 },
  rewardCost: { fontSize: 12, color: COLORS.primary, fontWeight: '700' },
  transactionItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  transactionIcon: { marginRight: 12 },
  transactionInfo: { flex: 1 },
  transactionReason: { fontSize: 14, fontWeight: '500', color: COLORS.text },
  transactionDate: { fontSize: 12, color: COLORS.textSecondary },
  transactionPoints: { fontSize: 16, fontWeight: '700' },
  emptyText: { textAlign: 'center', color: COLORS.textSecondary, marginTop: 16 },
});
