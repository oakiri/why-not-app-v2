import React from 'react';
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';

const ProfileScreen = () => {
  const handleLogout = () => {
    Alert.alert('Cerrar sesión', 'Por ahora este botón solo muestra un mensaje.');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hola, amante de las burgers</Text>
      <Text style={styles.subtitle}>Usuario: whynot.customer</Text>
      <Pressable style={styles.button} onPress={handleLogout}>
        <Text style={styles.buttonText}>Cerrar sesión</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b0b0b',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  title: {
    color: '#f9d648',
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    color: '#d7d7d7',
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#f9d648',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  buttonText: {
    color: '#0b0b0b',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default ProfileScreen;
