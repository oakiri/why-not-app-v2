import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

import { auth, db } from '../../lib/firebase';
import AuthLayout from '../../components/auth/AuthLayout';
import { colors } from '../../theme/theme';
import { mapAuthErrorMessage } from '../../utils/authErrorMessages';

const isOfflineError = (error) => {
  const message = String(error?.message ?? error).toLowerCase();
  return message.includes('offline');
};

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [line1, setLine1] = useState('');
  const [line2, setLine2] = useState('');
  const [city, setCity] = useState('');
  const [province, setProvince] = useState('');
  const [postalCode, setPostalCode] = useState('');

  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    setError('');
    setInfo('');
    setLoading(true);

    try {
      if (!email.trim() || !password) {
        setError('Por favor, rellena email y contraseña.');
        return;
      }

      if (!name.trim()) {
        setError('Por favor, ingresa tu nombre.');
        return;
      }

      if (!line1.trim() || !city.trim() || !province.trim() || !postalCode.trim()) {
        setError('Por favor, completa la dirección obligatoria.');
        return;
      }

      const { user } = await createUserWithEmailAndPassword(auth, email.trim(), password);

      // ✅ Enviar verificación (sin bloquear la UI)
      void sendEmailVerification(user);

      // ✅ Escribe SIEMPRE el perfil en Firestore (aunque no esté verificado)
      try {
        await setDoc(
          doc(db, 'users', user.uid),
          {
            email: user.email,
            name: name.trim(),
            phone: phone.trim(),
            role: 'cliente',
            address: {
              line1: line1.trim(),
              line2: line2.trim(),
              city: city.trim(),
              province: province.trim(),
              postalCode: postalCode.trim(),
            },
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );
        setInfo('Cuenta creada. Te hemos enviado un email para verificar.');
      } catch (e) {
        if (isOfflineError(e)) {
          setInfo(
            'Cuenta creada. Sin conexión: el perfil se sincronizará cuando vuelvas a tener red.'
          );
        } else {
          throw e;
        }
      }

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
          placeholder="Dirección (línea 1)"
          placeholderTextColor="#999"
          value={line1}
          onChangeText={setLine1}
          style={{
            borderWidth: 1, borderColor: '#DDD', borderRadius: 10,
            paddingHorizontal: 12, paddingVertical: 10, marginBottom: 12,
          }}
        />

        <TextInput
          placeholder="Dirección (línea 2)"
          placeholderTextColor="#999"
          value={line2}
          onChangeText={setLine2}
          style={{
            borderWidth: 1, borderColor: '#DDD', borderRadius: 10,
            paddingHorizontal: 12, paddingVertical: 10, marginBottom: 12,
          }}
        />

        <TextInput
          placeholder="Ciudad"
          placeholderTextColor="#999"
          value={city}
          onChangeText={setCity}
          style={{
            borderWidth: 1, borderColor: '#DDD', borderRadius: 10,
            paddingHorizontal: 12, paddingVertical: 10, marginBottom: 12,
          }}
        />

        <TextInput
          placeholder="Provincia"
          placeholderTextColor="#999"
          value={province}
          onChangeText={setProvince}
          style={{
            borderWidth: 1, borderColor: '#DDD', borderRadius: 10,
            paddingHorizontal: 12, paddingVertical: 10, marginBottom: 12,
          }}
        />

        <TextInput
          placeholder="Código postal"
          placeholderTextColor="#999"
          value={postalCode}
          onChangeText={setPostalCode}
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
