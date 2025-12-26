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
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
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
      const trimmedEmail = email.trim();
      const trimmedName = name.trim();
      const trimmedPhone = phone.trim();
      const trimmedAddressLine1 = addressLine1.trim();
      const trimmedAddressLine2 = addressLine2.trim();
      const trimmedCity = city.trim();
      const trimmedProvince = province.trim();
      const trimmedPostalCode = postalCode.trim();

      if (!trimmedName || !trimmedPhone || !trimmedEmail || !password) {
        setError('Por favor, completa nombre, teléfono, email y contraseña.');
        return;
      }

      if (!trimmedAddressLine1 || !trimmedCity || !trimmedProvince || !trimmedPostalCode) {
        setError('Por favor, completa dirección, ciudad, provincia y código postal.');
        return;
      }

      const { user } = await createUserWithEmailAndPassword(auth, trimmedEmail, password);

      // ✅ Escribe SIEMPRE el perfil en Firestore (aunque no esté verificado)
      await setDoc(
        doc(db, 'users', user.uid),
        {
          uid: user.uid,
          email: user.email,
          role: 'cliente',
          name: trimmedName,
          phone: trimmedPhone,
          address: {
            line1: trimmedAddressLine1,
            line2: trimmedAddressLine2,
            city: trimmedCity,
            province: trimmedProvince,
            postalCode: trimmedPostalCode,
          },
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
          placeholder="Dirección"
          placeholderTextColor="#999"
          value={addressLine1}
          onChangeText={setAddressLine1}
          style={{
            borderWidth: 1, borderColor: '#DDD', borderRadius: 10,
            paddingHorizontal: 12, paddingVertical: 10, marginBottom: 12,
          }}
        />

        <TextInput
          placeholder="Departamento / Piso (opcional)"
          placeholderTextColor="#999"
          value={addressLine2}
          onChangeText={setAddressLine2}
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
