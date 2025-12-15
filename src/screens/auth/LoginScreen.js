import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import AuthLayout from '../../components/auth/AuthLayout';
import { colors, typography } from '../../theme/theme';
import { mapAuthErrorMessage } from '../../utils/authErrorMessages';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [info, setInfo] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError('');
    setInfo('');

    if (!email || !password) {
      setError('Por favor, introduce tu correo y contraseña.');
      return;
    }
    setLoading(true);
    try {
      const { user } = await signInWithEmailAndPassword(auth, email.trim(), password);

      if (!user.emailVerified) {
        setInfo('Tu correo aún no está verificado. Revisa tu bandeja de entrada.');
        router.replace('/verify-email');
        return;
      }

      router.replace('/home');
    } catch (e) {
      setError(mapAuthErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  const goToRegister = () => {
    router.push('/register');
  };

  const goToForgotPassword = () => {
    router.push('/forgot-password');
  };

  return (
    <AuthLayout>
      <View style={{ width: '100%' }}>
        <Text style={[{ marginBottom: 16, color: colors.text }, typography.title]}>
          Iniciar sesión
        </Text>

        {error ? (
          <Text style={{ color: 'red', marginBottom: 8 }}>{error}</Text>
        ) : null}
        {info ? (
          <Text style={{ color: 'green', marginBottom: 8 }}>{info}</Text>
        ) : null}

        <TextInput
          placeholder="Correo electrónico"
          placeholderTextColor="#999"
          autoCapitalize="none"
          keyboardType="email-address"
          style={{
            borderWidth: 1,
            borderColor: '#DDD',
            borderRadius: 8,
            paddingHorizontal: 12,
            paddingVertical: 10,
            marginBottom: 12,
            color: colors.text,
          }}
          value={email}
          onChangeText={setEmail}
        />

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            borderWidth: 1,
            borderColor: '#DDD',
            borderRadius: 8,
            paddingHorizontal: 12,
            marginBottom: 16,
          }}
        >
          <TextInput
            placeholder="Contraseña"
            placeholderTextColor="#999"
            secureTextEntry={!showPassword}
            style={{ flex: 1, paddingVertical: 10, color: colors.text }}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword((prev) => !prev)}>
            <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={20} color="#888" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={goToForgotPassword} style={{ marginBottom: 16 }}>
          <Text style={{ color: colors.primary, fontWeight: 'bold' }}>¿Olvidaste tu contraseña?</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleLogin}
          disabled={loading}
          style={{
            backgroundColor: colors.primary,
            borderRadius: 999,
            paddingVertical: 14,
            alignItems: 'center',
            marginBottom: 16,
          }}
        >
          <Text style={{ color: colors.text, fontWeight: 'bold' }}>
            {loading ? 'Entrando...' : 'Iniciar sesión'}
          </Text>
        </TouchableOpacity>

        <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
          <Text style={{ color: colors.textMuted }}>¿No tienes cuenta?</Text>
          <TouchableOpacity onPress={goToRegister}>
            <Text
              style={{
                color: colors.primary,
                marginLeft: 4,
                fontWeight: 'bold',
              }}
            >
              Crear cuenta
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </AuthLayout>
  );
}
