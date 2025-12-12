import React from 'react';
import { View, Text, FlatList, StyleSheet, Pressable } from 'react-native';
import useCartStore from '../../store/cartStore';

const PRODUCTS = [
  { id: '1', name: 'Classic WHY NOT', description: 'Carne, queso cheddar, lechuga y salsa especial.', price: 8.99 },
  { id: '2', name: 'BBQ Lovers', description: 'Doble carne, bacon crujiente y salsa BBQ.', price: 10.5 },
  { id: '3', name: 'Vegan Dream', description: 'Hamburguesa vegetal con aguacate y hummus.', price: 9.25 },
];

const MenuScreen = () => {
  const addItem = useCartStore((state) => state.addItem);

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{item.name}</Text>
        <Text style={styles.description}>{item.description}</Text>
        <Text style={styles.price}>{`$${item.price.toFixed(2)}`}</Text>
      </View>
      <Pressable style={styles.button} onPress={() => addItem(item)}>
        <Text style={styles.buttonText}>Agregar</Text>
      </Pressable>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Hamburguesas destacadas</Text>
      <FlatList
        data={PRODUCTS}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b0b0b',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  header: {
    color: '#f9d648',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 12,
  },
  list: {
    gap: 12,
    paddingBottom: 24,
  },
  card: {
    backgroundColor: '#151515',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f9d648',
  },
  textContainer: {
    marginBottom: 12,
  },
  title: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  description: {
    color: '#d7d7d7',
    fontSize: 14,
    marginBottom: 8,
  },
  price: {
    color: '#f9d648',
    fontSize: 16,
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#f9d648',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#0b0b0b',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default MenuScreen;
