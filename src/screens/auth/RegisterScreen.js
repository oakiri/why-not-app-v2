import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { getPendingProfileKey } from '../../context/AuthContext';
import AuthLayout from '../../components/auth/AuthLayout';
import { colors, typography } from '../../theme/theme';
import { mapAuthErrorMessage } from '../../utils/authErrorMessages';

export default function RegisterScreen() {
  const [nombre, setNombre] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [telefono, setTelefono] = useState('');
  const [direccion, setDireccion] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    setError('');

    if (!nombre || !apellidos || !telefono || !direccion || !email || !password || !confirmPassword) {
      setError('Por favor, completa todos los campos.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Introduce un correo electrónico válido.');
      return;
    }

    if (!/^\d{7,}$/.test(telefono)) {
      setError('El teléfono debe contener solo dígitos y tener al menos 7 números.');
      return;
    }

    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email.trim(), password);

      const pendingProfile = {
        nombre,
        apellidos,
        telefono,
        direccion,
        email: email.trim(),
      };

      await AsyncStorage.setItem(getPendingProfileKey(user.uid), JSON.stringify(pendingProfile));
      await sendEmailVerification(user);
      router.replace('/verify-email');
    } catch (e) {
      setError(mapAuthErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <View style={{ width: '100%' }}>
        <Text style={[{ marginBottom: 16, color: colors.text }, typography.title]}>
          Crear cuenta
        </Text>

        {error ? (
          <Text style={{ color: 'red', marginBottom: 8 }}>{error}</Text>
        ) : null}

        <TextInput
          placeholder="Nombre"
          placeholderTextColor="#999"
          style={fieldStyle}
          value={nombre}
          onChangeText={setNombre}
        />

        <TextInput
          placeholder="Apellidos"
          placeholderTextColor="#999"
          style={fieldStyle}
          value={apellidos}
          onChangeText={setApellidos}
        />

        <TextInput
          placeholder="Teléfono"
          placeholderTextColor="#999"
          keyboardType="phone-pad"
          style={fieldStyle}
          value={telefono}
          onChangeText={setTelefono}
        />

        <TextInput
          placeholder="Dirección"
          placeholderTextColor="#999"
          style={fieldStyle}
          value={direccion}
          onChangeText={setDireccion}
        />

        <TextInput
          placeholder="Correo electrónico"
          placeholderTextColor="#999"
          autoCapitalize="none"
          keyboardType="email-address"
          style={fieldStyle}
          value={email}
          onChangeText={setEmail}
        />

        <View style={passwordContainerStyle}>
          <TextInput
            placeholder="Contraseña"
            placeholderTextColor="#999"
            secureTextEntry={!showPassword}
            style={passwordInputStyle}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword((prev) => !prev)}>
            <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={20} color="#888" />
          </TouchableOpacity>
        </View>

        <View style={passwordContainerStyle}>
          <TextInput
            placeholder="Confirmar contraseña"
            placeholderTextColor="#999"
            secureTextEntry={!showConfirmPassword}
            style={passwordInputStyle}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
          <TouchableOpacity onPress={() => setShowConfirmPassword((prev) => !prev)}>
            <Ionicons name={showConfirmPassword ? 'eye-off' : 'eye'} size={20} color="#888" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={handleRegister}
          disabled={loading}
          style={{
            backgroundColor: colors.primary,
            borderRadius: 999,
            paddingVertical: 14,
            alignItems: 'center',
            marginTop: 4,
          }}
        >
          <Text style={{ color: colors.text, fontWeight: 'bold' }}>
            {loading ? 'Creando cuenta...' : 'Registrarme'}
          </Text>
        </TouchableOpacity>
      </View>
    </AuthLayout>
  );
}

const fieldStyle = {
  borderWidth: 1,
  borderColor: '#DDD',
  borderRadius: 8,
  paddingHorizontal: 12,
  paddingVertical: 10,
  marginBottom: 12,
  color: colors.text,
};

const passwordContainerStyle = {
  flexDirection: 'row',
  alignItems: 'center',
  borderWidth: 1,
  borderColor: '#DDD',
  borderRadius: 8,
  paddingHorizontal: 12,
  marginBottom: 12,
};

const passwordInputStyle = {
  flex: 1,
  paddingVertical: 10,
  color: colors.text,
};
