import React from 'react';
import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import { colors, typography } from '../../theme/theme';
import useCartStore from '../../store/cartStore';

const CartScreen = () => {
  const { items, removeItem, clearCart } = useCartStore();

  const total = items.reduce((acc, item) => acc + (item.price || 0) * (item.quantity || 1), 0);

  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <View>
        <Text style={[styles.itemName, typography.subtitle]}>{item.name}</Text>
        <Text style={styles.itemMeta}>{`Cantidad: ${item.quantity || 1}`}</Text>
        <Text style={styles.itemMeta}>{`$${(item.price || 0).toFixed(2)}`}</Text>
      </View>
      <Pressable style={styles.removeButton} onPress={() => removeItem(item.id)}>
        <Text style={styles.removeText}>Eliminar</Text>
      </Pressable>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={[styles.header, typography.title]}>Tu carrito</Text>
      {items.length === 0 ? (
        <Text style={styles.empty}>Aún no has agregado hamburguesas.</Text>
      ) : (
        <>
          <FlatList
            data={items}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
          />
          <View style={styles.footer}>
            <Text style={styles.total}>{`Total: $${total.toFixed(2)}`}</Text>
            <Pressable style={styles.clearButton} onPress={clearCart}>
              <Text style={styles.clearText}>Vaciar carrito</Text>
            </Pressable>
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  header: {
    color: colors.primary,
    marginBottom: 12,
  },
  empty: {
    color: colors.textMuted,
    fontSize: 16,
    marginTop: 20,
  },
  list: {
    gap: 12,
    paddingBottom: 24,
  },
  item: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.primary,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemName: {
    color: colors.text,
    marginBottom: 4,
  },
  itemMeta: {
    color: colors.textMuted,
    fontSize: 14,
  },
  removeButton: {
    backgroundColor: '#f53b57',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  removeText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  footer: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.card,
    paddingTop: 12,
  },
  total: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  clearButton: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  clearText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: '700',
  },
});

export default CartScreen;
