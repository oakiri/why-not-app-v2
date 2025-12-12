import React from 'react';
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import { signOut } from 'firebase/auth';
import useAuth from '../../hooks/useAuth';
import { auth } from '../../api/firebase';

const ProfileScreen = () => {
  const { user } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      Alert.alert('Error al cerrar sesión', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hola, amante de las burgers</Text>
      <Text style={styles.subtitle}>Usuario: {user?.email || 'Invitado'}</Text>
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
