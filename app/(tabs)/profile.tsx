import React, { useEffect, useState } from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, ActivityIndicator, View } from 'react-native';
import { router } from 'expo-router';
import { signOut } from 'firebase/auth';
import { serverTimestamp } from 'firebase/firestore';

import { auth } from '../../src/lib/firebase';
import { useAuth } from '../../src/context/AuthContext';
import { colors } from '../../src/theme/theme';

const isOfflineError = (error: unknown) => {
  const message = String((error as { message?: string })?.message ?? error).toLowerCase();
  return message.includes('offline');
};

export default function ProfileTab() {
  const { user, profile, profileLoading, updateProfile } = useAuth();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [line1, setLine1] = useState('');
  const [line2, setLine2] = useState('');
  const [city, setCity] = useState('');
  const [province, setProvince] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!profile) {
      setName('');
      setPhone('');
      setLine1('');
      setLine2('');
      setCity('');
      setProvince('');
      setPostalCode('');
      return;
    }

    setName(profile.name || '');
    setPhone(profile.phone || '');
    setLine1(profile.address?.line1 || '');
    setLine2(profile.address?.line2 || '');
    setCity(profile.address?.city || '');
    setProvince(profile.address?.province || '');
    setPostalCode(profile.address?.postalCode || '');
  }, [profile]);

  useEffect(() => {
    if (!success) return;
    const timeout = setTimeout(() => setSuccess(''), 2000);
    return () => clearTimeout(timeout);
  }, [success]);

  const saveProfile = async () => {
    if (!user?.uid) return;
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await updateProfile({
        email: user.email ?? undefined,
        name: name.trim(),
        phone: phone.trim(),
        address: {
          line1: line1.trim(),
          line2: line2.trim(),
          city: city.trim(),
          province: province.trim(),
          postalCode: postalCode.trim(),
        },
        updatedAt: serverTimestamp(),
      });
      setSuccess('Guardado ✅');
    } catch (e: any) {
      if (isOfflineError(e)) {
        setError('Sin conexión. Revisa tu red y vuelve a intentarlo.');
      } else {
        setError('Error guardando perfil.');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.replace('/(auth)/login');
  };

  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1, padding: 20, backgroundColor: colors.background }}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={{ fontFamily: 'Anton', fontSize: 28, marginBottom: 10 }}>PERFIL</Text>

      {profileLoading ? (
        <View style={{ marginBottom: 12 }}>
          <ActivityIndicator />
        </View>
      ) : null}

      {error ? <Text style={{ marginBottom: 10, color: 'red' }}>{error}</Text> : null}
      {success ? <Text style={{ marginBottom: 10, color: 'green' }}>{success}</Text> : null}

      <Text style={{ fontFamily: 'Anton', fontSize: 14, marginBottom: 4 }}>Email</Text>
      <Text style={{ marginBottom: 12 }}>{user?.email}</Text>

      <Text style={{ fontFamily: 'Anton', fontSize: 14, marginBottom: 4 }}>Nombre</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Tu nombre"
        style={{ borderWidth: 1, borderColor: '#DDD', borderRadius: 10, padding: 12, marginBottom: 12 }}
      />

      <Text style={{ fontFamily: 'Anton', fontSize: 14, marginBottom: 4 }}>Teléfono</Text>
      <TextInput
        value={phone}
        onChangeText={setPhone}
        placeholder="Tu teléfono"
        keyboardType="phone-pad"
        style={{ borderWidth: 1, borderColor: '#DDD', borderRadius: 10, padding: 12, marginBottom: 12 }}
      />

      <Text style={{ fontFamily: 'Anton', fontSize: 14, marginBottom: 4 }}>Dirección - Línea 1</Text>
      <TextInput
        value={line1}
        onChangeText={setLine1}
        placeholder="Calle y número"
        style={{ borderWidth: 1, borderColor: '#DDD', borderRadius: 10, padding: 12, marginBottom: 12 }}
      />

      <Text style={{ fontFamily: 'Anton', fontSize: 14, marginBottom: 4 }}>Dirección - Línea 2</Text>
      <TextInput
        value={line2}
        onChangeText={setLine2}
        placeholder="Departamento, piso, etc."
        style={{ borderWidth: 1, borderColor: '#DDD', borderRadius: 10, padding: 12, marginBottom: 12 }}
      />

      <Text style={{ fontFamily: 'Anton', fontSize: 14, marginBottom: 4 }}>Ciudad</Text>
      <TextInput
        value={city}
        onChangeText={setCity}
        placeholder="Ciudad"
        style={{ borderWidth: 1, borderColor: '#DDD', borderRadius: 10, padding: 12, marginBottom: 12 }}
      />

      <Text style={{ fontFamily: 'Anton', fontSize: 14, marginBottom: 4 }}>Provincia</Text>
      <TextInput
        value={province}
        onChangeText={setProvince}
        placeholder="Provincia"
        style={{ borderWidth: 1, borderColor: '#DDD', borderRadius: 10, padding: 12, marginBottom: 12 }}
      />

      <Text style={{ fontFamily: 'Anton', fontSize: 14, marginBottom: 4 }}>Código postal</Text>
      <TextInput
        value={postalCode}
        onChangeText={setPostalCode}
        placeholder="Código postal"
        style={{ borderWidth: 1, borderColor: '#DDD', borderRadius: 10, padding: 12, marginBottom: 12 }}
      />

      <TouchableOpacity
        onPress={saveProfile}
        disabled={saving}
        style={{ backgroundColor: colors.primary, borderRadius: 999, paddingVertical: 14, alignItems: 'center', marginBottom: 12 }}
      >
        <Text style={{ fontFamily: 'Anton' }}>{saving ? 'Guardando...' : 'Guardar cambios'}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={handleLogout}
        style={{ borderWidth: 1, borderColor: '#222', borderRadius: 999, paddingVertical: 14, alignItems: 'center' }}
      >
        <Text style={{ fontFamily: 'Anton' }}>Cerrar sesión</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
