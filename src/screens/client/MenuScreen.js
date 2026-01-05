import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, FlatList, StyleSheet, Pressable } from 'react-native';
import { colors } from '../../theme/theme';
import useCartStore from '../../store/cartStore';

const PRODUCTS = [
  { id: '1', name: 'CLASSIC WHY NOT', description: 'Carne, queso cheddar, lechuga y salsa especial.', price: 8.99 },
  { id: '2', name: 'BBQ LOVERS', description: 'Doble carne, bacon crujiente y salsa BBQ.', price: 10.5 },
  { id: '3', name: 'VEGAN DREAM', description: 'Hamburguesa vegetal con aguacate y hummus.', price: 9.25 },
];

const MenuScreen = () => {
  const addItem = useCartStore((state) => state.addItem);

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{item.name}</Text>
        <Text style={styles.description}>{item.description}</Text>
        <Text style={styles.price}>{`${item.price.toFixed(2)}€`}</Text>
      </View>
      <Pressable style={styles.button} onPress={() => addItem(item)}>
        <Text style={styles.buttonText}>AGREGAR AL CARRITO</Text>
      </Pressable>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>HAMBURGUESAS DESTACADAS</Text>
      <FlatList
        data={PRODUCTS}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
    paddingHorizontal: 20,
  },
  header: {
    fontFamily: 'Anton',
    fontSize: 28,
    color: colors.primary,
    marginTop: 10,
    marginBottom: 20,
    textAlign: 'center',
  },
  list: {
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#F9F9F9',
    borderRadius: 20,
    padding: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#EEE',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  textContainer: {
    marginBottom: 15,
  },
  title: {
    fontFamily: 'Anton',
    fontSize: 22,
    color: '#000',
    marginBottom: 6,
  },
  description: {
    fontFamily: 'Anton',
    fontSize: 13,
    color: '#666',
    marginBottom: 10,
    lineHeight: 18,
  },
  price: {
    fontFamily: 'Anton',
    fontSize: 18,
    color: colors.primary,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    fontFamily: 'Anton',
    color: '#000',
    fontSize: 15,
  },
});

export default MenuScreen;
