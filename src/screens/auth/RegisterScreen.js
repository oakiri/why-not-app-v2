import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform,
  StyleSheet 
} from 'react-native';
import { router } from 'expo-router';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';

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
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
    
    if (!email.trim() || !password || !confirmPassword) {
      setError('Por favor, rellena email y contraseñas.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    if (!name.trim()) {
      setError('Por favor, ingresa tu nombre.');
      return;
    }

    setLoading(true);

    try {
      const { user } = await createUserWithEmailAndPassword(auth, email.trim(), password);

      // Enviar verificación
      void sendEmailVerification(user);

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
          setInfo('Cuenta creada. El perfil se sincronizará cuando vuelvas a tener red.');
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
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1, width: '100%' }}
      >
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          <Text style={styles.title}>Crear cuenta</Text>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          {info ? <Text style={styles.infoText}>{info}</Text> : null}

          {/* Grupo 1: Usuario y Contraseña */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Datos de acceso</Text>
            <TextInput
              placeholder="Correo electrónico"
              placeholderTextColor="#999"
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              style={styles.input}
            />

            <View style={styles.passwordContainer}>
              <TextInput
                placeholder="Contraseña"
                placeholderTextColor="#999"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
                style={[styles.input, { flex: 1, marginBottom: 0 }]}
              />
              <TouchableOpacity 
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
              >
                <Ionicons name={showPassword ? "eye-off" : "eye"} size={20} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.passwordContainer}>
              <TextInput
                placeholder="Confirmar contraseña"
                placeholderTextColor="#999"
                secureTextEntry={!showConfirmPassword}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                style={[styles.input, { flex: 1, marginBottom: 0 }]}
              />
              <TouchableOpacity 
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                style={styles.eyeIcon}
              >
                <Ionicons name={showConfirmPassword ? "eye-off" : "eye"} size={20} color="#666" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Grupo 2: Datos Personales */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Datos personales</Text>
            <TextInput
              placeholder="Nombre completo"
              placeholderTextColor="#999"
              value={name}
              onChangeText={setName}
              style={styles.input}
            />

            <TextInput
              placeholder="Teléfono"
              placeholderTextColor="#999"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
              style={styles.input}
            />
          </View>

          {/* Grupo 3: Dirección */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Dirección de entrega</Text>
            <TextInput
              placeholder="Calle y número"
              placeholderTextColor="#999"
              value={line1}
              onChangeText={setLine1}
              style={styles.input}
            />
            <TextInput
              placeholder="Piso, puerta, etc. (opcional)"
              placeholderTextColor="#999"
              value={line2}
              onChangeText={setLine2}
              style={styles.input}
            />
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TextInput
                placeholder="Ciudad"
                placeholderTextColor="#999"
                value={city}
                onChangeText={setCity}
                style={[styles.input, { flex: 1 }]}
              />
              <TextInput
                placeholder="C.P."
                placeholderTextColor="#999"
                keyboardType="numeric"
                value={postalCode}
                onChangeText={setPostalCode}
                style={[styles.input, { width: 80 }]}
              />
            </View>
            <TextInput
              placeholder="Provincia"
              placeholderTextColor="#999"
              value={province}
              onChangeText={setProvince}
              style={styles.input}
            />
          </View>

          <TouchableOpacity
            onPress={handleRegister}
            disabled={loading}
            style={styles.button}
          >
            {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>Crear cuenta</Text>}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.replace('/(auth)/login')}>
            <Text style={styles.linkText}>
              Ya tengo cuenta → Iniciar sesión
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  title: {
    fontFamily: 'Anton',
    fontSize: 32,
    marginBottom: 24,
    color: '#000',
    textAlign: 'center',
  },
  section: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontFamily: 'Anton',
    fontSize: 14,
    color: colors.primary,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  input: {
    fontFamily: 'Anton',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 12,
    backgroundColor: '#FFF',
    fontSize: 16,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  eyeIcon: {
    position: 'absolute',
    right: 15,
    height: '100%',
    justifyContent: 'center',
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  buttonText: {
    fontFamily: 'Anton',
    fontSize: 18,
    color: '#000',
  },
  linkText: {
    color: colors.primary,
    fontFamily: 'Anton',
    textAlign: 'center',
    fontSize: 16,
  },
  errorText: {
    color: 'red',
    fontFamily: 'Anton',
    marginBottom: 12,
    textAlign: 'center',
  },
  infoText: {
    color: 'green',
    fontFamily: 'Anton',
    marginBottom: 12,
    textAlign: 'center',
  },
});
