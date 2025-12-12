import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';
import { auth } from '../../api/firebase';
import { colors, typography } from '../../theme/theme';

const LoginScreen = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Completa los campos', 'Ingresa tu email y contraseña.');
      return;
    }

    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch (error) {
      Alert.alert('No pudimos iniciar sesión', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={[typography.title, styles.title]}>Iniciar sesión</Text>
          <Text style={styles.subtitle}>Accede al menú y a tu carrito favorito</Text>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="tu@email.com"
              placeholderTextColor="#9a9a9a"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Contraseña</Text>
            <TextInput
              style={styles.input}
              placeholder="********"
              placeholderTextColor="#9a9a9a"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          <Pressable
            style={({ pressed }) => [styles.button, pressed && styles.buttonPressed, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={styles.buttonText}>{loading ? 'Ingresando...' : 'Iniciar sesión'}</Text>
          </Pressable>

          <Pressable onPress={() => navigation.navigate('Register')} style={styles.linkWrapper}>
            <Text style={styles.link}>¿Aún no tienes cuenta? Regístrate</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  title: {
    textAlign: 'center',
    color: colors.text,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 16,
    marginTop: 8,
    marginBottom: 32,
    textAlign: 'center',
  },
  formGroup: {
    marginBottom: 18,
  },
  label: {
    color: colors.text,
    marginBottom: 8,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: '#f7f7f7',
    color: colors.text,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.primary,
    fontSize: 15,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonPressed: {
    opacity: 0.9,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#0b0b0b',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  linkWrapper: {
    marginTop: 18,
    alignItems: 'center',
  },
  link: {
    color: colors.text,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});

export default LoginScreen;
