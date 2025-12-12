import React from 'react';
import { Text, StyleSheet, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { signOut } from 'firebase/auth';
import useAuth from '../../hooks/useAuth';
import { auth } from '../../api/firebase';
import { colors, typography } from '../../theme/theme';

const ProfileScreen = () => {
  const { user } = useAuth();
  const email = auth.currentUser?.email || user?.email || 'Invitado';

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      Alert.alert('Error al cerrar sesión', error.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={[styles.title, typography.title]}>Hola, amante de las burgers</Text>
      <Text style={[styles.subtitle, typography.subtitle]}>Usuario: {email}</Text>
      <Pressable style={styles.button} onPress={handleLogout}>
        <Text style={styles.buttonText}>Cerrar sesión</Text>
      </Pressable>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
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
