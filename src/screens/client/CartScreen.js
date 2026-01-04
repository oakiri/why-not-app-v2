import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { colors } from '../../theme/theme';
import useCartStore from '../../store/cartStore';

const CartScreen = () => {
  const { items, addItem, removeItem, deleteItem, clearCart } = useCartStore();

  const total = items.reduce((acc, item) => acc + (item.price || 0) * (item.quantity || 1), 0);

  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemPrice}>{`${(item.price || 0).toFixed(2)}€`}</Text>
      </View>
      
      <View style={styles.quantityContainer}>
        <TouchableOpacity 
          style={styles.qtyButton} 
          onPress={() => removeItem(item.id)}
        >
          <Ionicons name="remove" size={20} color="#000" />
        </TouchableOpacity>
        
        <Text style={styles.quantityText}>{item.quantity || 1}</Text>
        
        <TouchableOpacity 
          style={styles.qtyButton} 
          onPress={() => addItem(item)}
        >
          <Ionicons name="add" size={20} color="#000" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.deleteButton} 
          onPress={() => deleteItem(item.id)}
        >
          <Ionicons name="trash-outline" size={20} color="#FF4444" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>TU CARRITO</Text>
        {items.length > 0 && (
          <TouchableOpacity onPress={clearCart}>
            <Text style={styles.clearText}>Vaciar</Text>
          </TouchableOpacity>
        )}
      </View>

      {items.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="cart-outline" size={80} color="#EEE" />
          <Text style={styles.emptyText}>Tu carrito está vacío</Text>
          <TouchableOpacity 
            style={styles.browseButton}
            onPress={() => router.push('/(tabs)/menu')}
          >
            <Text style={styles.browseButtonText}>VER CARTA</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <FlatList
            data={items}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
          />
          
          <View style={styles.footer}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>TOTAL</Text>
              <Text style={styles.totalAmount}>{`${total.toFixed(2)}€`}</Text>
            </View>
            
            <TouchableOpacity 
              style={styles.checkoutButton}
              onPress={() => Alert.alert("Próximamente", "El sistema de pago se activará en la siguiente fase.")}
            >
              <Text style={styles.checkoutButtonText}>FINALIZAR PEDIDO</Text>
              <Ionicons name="arrow-forward" size={20} color="#000" />
            </TouchableOpacity>
          </View>
        </>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 },
  headerTitle: { fontFamily: 'Anton', fontSize: 28, color: '#000' },
  clearText: { fontFamily: 'Anton', color: '#FF4444', fontSize: 14 },
  list: { padding: 20, gap: 15 },
  item: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
    padding: 15,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#EEE'
  },
  itemInfo: { flex: 1 },
  itemName: { fontFamily: 'Anton', fontSize: 16, color: '#000', marginBottom: 4 },
  itemPrice: { fontSize: 14, color: '#666', fontWeight: '600' },
  quantityContainer: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  qtyButton: { 
    width: 32, 
    height: 32, 
    borderRadius: 16, 
    backgroundColor: colors.primary, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  quantityText: { fontFamily: 'Anton', fontSize: 16, minWidth: 20, textAlign: 'center' },
  deleteButton: { marginLeft: 5, padding: 5 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingBottom: 100 },
  emptyText: { fontFamily: 'Anton', fontSize: 18, color: '#CCC', marginTop: 10 },
  browseButton: { backgroundColor: colors.primary, paddingHorizontal: 30, paddingVertical: 12, borderRadius: 12, marginTop: 20 },
  browseButtonText: { fontFamily: 'Anton', fontSize: 16, color: '#000' },
  footer: { padding: 20, borderTopWidth: 1, borderTopColor: '#EEE', backgroundColor: '#FFF' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  totalLabel: { fontFamily: 'Anton', fontSize: 18, color: '#666' },
  totalAmount: { fontFamily: 'Anton', fontSize: 24, color: '#000' },
  checkoutButton: { 
    backgroundColor: colors.primary, 
    flexDirection: 'row', 
    height: 60, 
    borderRadius: 15, 
    justifyContent: 'center', 
    alignItems: 'center',
    gap: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4
  },
  checkoutButtonText: { fontFamily: 'Anton', fontSize: 18, color: '#000' }
});

export default CartScreen;
