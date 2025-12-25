import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

import { auth, db } from '../../lib/firebase';
import AuthLayout from '../../components/auth/AuthLayout';
import { colors } from '../../theme/theme';
import { mapAuthErrorMessage } from '../../utils/authErrorMessages';

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    setError('');
    setInfo('');

    if (!email.trim() || !password) {
      setError('Por favor, rellena email y contraseña.');
      return;
    }

    setLoading(true);
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email.trim(), password);

      // ✅ Escribe SIEMPRE el perfil en Firestore (aunque no esté verificado)
      await setDoc(
        doc(db, 'users', user.uid),
        {
          email: user.email,
          name: name.trim(),
          phone: phone.trim(),
          role: 'cliente',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      // ✅ Enviar verificación
      await sendEmailVerification(user);

      setInfo('Cuenta creada. Te hemos enviado un email para verificar.');
      router.replace('/(auth)/verify-email');
    } catch (e) {
      setError(mapAuthErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <View style={{ width: '100%' }}>
        <Text style={{ fontFamily: 'Anton', fontSize: 28, marginBottom: 16 }}>
          Crear cuenta
        </Text>

        {error ? <Text style={{ color: 'red', marginBottom: 8 }}>{error}</Text> : null}
        {info ? <Text style={{ color: 'green', marginBottom: 8 }}>{info}</Text> : null}

        <TextInput
          placeholder="Nombre"
          placeholderTextColor="#999"
          value={name}
          onChangeText={setName}
          style={{
            borderWidth: 1, borderColor: '#DDD', borderRadius: 10,
            paddingHorizontal: 12, paddingVertical: 10, marginBottom: 12,
          }}
        />

        <TextInput
          placeholder="Teléfono"
          placeholderTextColor="#999"
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
          style={{
            borderWidth: 1, borderColor: '#DDD', borderRadius: 10,
            paddingHorizontal: 12, paddingVertical: 10, marginBottom: 12,
          }}
        />

        <TextInput
          placeholder="Correo electrónico"
          placeholderTextColor="#999"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          style={{
            borderWidth: 1, borderColor: '#DDD', borderRadius: 10,
            paddingHorizontal: 12, paddingVertical: 10, marginBottom: 12,
          }}
        />

        <TextInput
          placeholder="Contraseña"
          placeholderTextColor="#999"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          style={{
            borderWidth: 1, borderColor: '#DDD', borderRadius: 10,
            paddingHorizontal: 12, paddingVertical: 10, marginBottom: 16,
          }}
        />

        <TouchableOpacity
          onPress={handleRegister}
          disabled={loading}
          style={{
            backgroundColor: colors.primary,
            borderRadius: 999,
            paddingVertical: 14,
            alignItems: 'center',
            marginBottom: 16,
          }}
        >
          {loading ? <ActivityIndicator /> : <Text style={{ fontFamily: 'Anton' }}>Crear cuenta</Text>}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.replace('/(auth)/login')}>
          <Text style={{ color: colors.primary, fontFamily: 'Anton', textAlign: 'center' }}>
            Ya tengo cuenta → Iniciar sesión
          </Text>
        </TouchableOpacity>
      </View>
    </AuthLayout>
  );
}
