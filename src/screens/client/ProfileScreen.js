import React from 'react';
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import { signOut } from 'firebase/auth';
import useAuth from '../../hooks/useAuth';
import { auth } from '../../api/firebase';
import { colors, typography } from '../../theme/theme';

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
      <Text style={[styles.title, typography.title]}>Hola, amante de las burgers</Text>
      <Text style={[styles.subtitle, typography.subtitle]}>
        Usuario: {user?.email || 'Invitado'}
      </Text>
      <Pressable style={styles.button} onPress={handleLogout}>
        <Text style={styles.buttonText}>Cerrar sesión</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  title: {
    color: colors.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    color: colors.textMuted,
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  buttonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
});

export default ProfileScreen;
