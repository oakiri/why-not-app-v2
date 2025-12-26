import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { sendPasswordResetEmail } from 'firebase/auth';
import AuthLayout from '../../components/auth/AuthLayout';
import { colors, typography } from '../../theme/theme';
import { auth } from '../../lib/firebase';
import { mapAuthErrorMessage } from '../../utils/authErrorMessages';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    setError('');
    setStatus('');

    if (!email) {
      setError('Ingresa tu correo electrónico.');
      return;
    }

    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setStatus('Te hemos enviado un correo para restablecer tu contraseña.');
    } catch (err) {
      setError(mapAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const goToLogin = () => {
    router.replace('/(auth)/login');
  };

  return (
    <AuthLayout>
      <View style={{ width: '100%' }}>
        <Text style={[{ marginBottom: 16, color: colors.text }, typography.title]}>
          Recuperar contraseña
        </Text>

        {error ? <Text style={{ color: 'red', marginBottom: 8 }}>{error}</Text> : null}
        {status ? <Text style={{ color: 'green', marginBottom: 8 }}>{status}</Text> : null}

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

        <TouchableOpacity
          onPress={handleReset}
          disabled={loading}
          style={{
            backgroundColor: colors.primary,
            borderRadius: 999,
            paddingVertical: 14,
            alignItems: 'center',
            marginBottom: 12,
          }}
        >
          <Text style={{ color: colors.text, fontWeight: 'bold' }}>
            {loading ? 'Enviando...' : 'Enviar enlace'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={goToLogin} style={{ alignSelf: 'center' }}>
          <Text style={{ color: colors.primary, fontWeight: 'bold' }}>Volver a iniciar sesión</Text>
        </TouchableOpacity>
      </View>
    </AuthLayout>
  );
}
