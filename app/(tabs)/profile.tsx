import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

import { auth, db } from '../../src/lib/firebase';
import { useAuth } from '../../src/context/AuthContext';
import { colors } from '../../src/theme/theme';

type UserProfile = {
  email?: string;
  name?: string;
  phone?: string;
  role?: string;
  address?: {
    line1?: string;
    line2?: string;
    city?: string;
    province?: string;
    postalCode?: string;
  };
};

export default function ProfileTab() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [province, setProvince] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [missingProfile, setMissingProfile] = useState(false);

  const successMessage = useMemo(() => 'Guardado ✅', []);

  useEffect(() => {
    const run = async () => {
      if (!user?.uid) return;
      setLoading(true);
      setMsg('');
      try {
        const ref = doc(db, 'users', user.uid);
        const snap = await getDoc(ref);
        const data = snap.exists() ? (snap.data() as UserProfile) : null;

        setProfile(data);
        setMissingProfile(!data);
        setName(data?.name || '');
        setPhone(data?.phone || '');
        setAddressLine1(data?.address?.line1 || '');
        setAddressLine2(data?.address?.line2 || '');
        setCity(data?.address?.city || '');
        setProvince(data?.address?.province || '');
        setPostalCode(data?.address?.postalCode || '');
      } catch (e: any) {
        setMsg(`Error cargando perfil: ${e?.message || String(e)}`);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [user?.uid]);

  useEffect(() => {
    if (msg !== successMessage) return;
    const timeout = setTimeout(() => setMsg(''), 2000);
    return () => clearTimeout(timeout);
  }, [msg, successMessage]);

  const saveProfile = async () => {
    if (!user?.uid) return;
    setSaving(true);
    setMsg('');
    try {
      const ref = doc(db, 'users', user.uid);
      await setDoc(
        ref,
        {
          email: user.email,
          name: name.trim(),
          phone: phone.trim(),
          role: profile?.role || 'cliente',
          address: {
            line1: addressLine1.trim(),
            line2: addressLine2.trim(),
            city: city.trim(),
            province: province.trim(),
            postalCode: postalCode.trim(),
          },
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
      setMsg(successMessage);
    } catch (e: any) {
      setMsg('Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.replace('/(auth)/login');
  };

  return (
    <View style={{ flex: 1, padding: 20, backgroundColor: colors.background }}>
      <Text style={{ fontFamily: 'Anton', fontSize: 28, marginBottom: 10 }}>PERFIL</Text>

      {loading ? (
        <ActivityIndicator />
      ) : (
        <>
          {missingProfile ? (
            <Text style={{ marginBottom: 12, color: colors.textMuted }}>
              No encontramos tu perfil todavía. Completa tus datos para guardarlos.
            </Text>
          ) : null}
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

          <Text style={{ fontFamily: 'Anton', fontSize: 14, marginBottom: 4 }}>Dirección</Text>
          <TextInput
            value={addressLine1}
            onChangeText={setAddressLine1}
            placeholder="Dirección"
            style={{ borderWidth: 1, borderColor: '#DDD', borderRadius: 10, padding: 12, marginBottom: 12 }}
          />

          <Text style={{ fontFamily: 'Anton', fontSize: 14, marginBottom: 4 }}>Departamento / Piso</Text>
          <TextInput
            value={addressLine2}
            onChangeText={setAddressLine2}
            placeholder="Opcional"
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

          {msg ? <Text style={{ marginBottom: 10 }}>{msg}</Text> : null}

          <TouchableOpacity
            onPress={handleLogout}
            style={{ borderWidth: 1, borderColor: '#222', borderRadius: 999, paddingVertical: 14, alignItems: 'center' }}
          >
            <Text style={{ fontFamily: 'Anton' }}>Cerrar sesión</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}
