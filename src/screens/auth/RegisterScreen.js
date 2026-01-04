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
  StyleSheet,
  Alert
} from 'react-native';
import { router } from 'expo-router';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';

import { auth, db } from '../../lib/firebase';
import AuthLayout from '../../components/auth/AuthLayout';
import { colors } from '../../theme/theme';
import { mapAuthErrorMessage } from '../../utils/authErrorMessages';

export default function RegisterScreen() {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    phone: '',
    address: '',
    city: 'Jerez de la Frontera',
    province: 'Cádiz',
    postalCode: '',
  });

  const validateForm = () => {
    const { email, password, confirmPassword, name, phone, address, postalCode } = formData;
    
    if (!email.trim() || !password || !confirmPassword || !name.trim() || !phone.trim() || !address.trim() || !postalCode.trim()) {
      Alert.alert('Error', 'Por favor, rellena todos los campos obligatorios.');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      Alert.alert('Error', 'Por favor, introduce un email válido.');
      return false;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres.');
      return false;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden.');
      return false;
    }

    if (phone.trim().length !== 9) {
      Alert.alert('Error', 'El teléfono debe tener 9 dígitos.');
      return false;
    }

    if (postalCode.trim().length !== 5) {
      Alert.alert('Error', 'El código postal debe tener 5 dígitos.');
      return false;
    }

    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const { user } = await createUserWithEmailAndPassword(auth, formData.email.trim(), formData.password);

      // Enviar verificación
      void sendEmailVerification(user);

      await setDoc(
        doc(db, 'users', user.uid),
        {
          email: user.email,
          name: formData.name.trim(),
          phone: formData.phone.trim(),
          role: 'cliente',
          address: {
            line1: formData.address.trim(),
            city: formData.city,
            province: formData.province,
            postalCode: formData.postalCode.trim(),
          },
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      router.replace('/(auth)/verify-email');
    } catch (e) {
      console.error(e);
      Alert.alert('Error', mapAuthErrorMessage(e));
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
          <Text style={styles.title}>CREAR CUENTA</Text>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Datos de acceso</Text>
            <TextInput
              placeholder="Correo electrónico"
              placeholderTextColor="#999"
              autoCapitalize="none"
              keyboardType="email-address"
              value={formData.email}
              onChangeText={(t) => setFormData({ ...formData, email: t })}
              style={styles.input}
            />

            <View style={styles.passwordContainer}>
              <TextInput
                placeholder="Contraseña"
                placeholderTextColor="#999"
                secureTextEntry={!showPassword}
                value={formData.password}
                onChangeText={(t) => setFormData({ ...formData, password: t })}
                style={[styles.input, { flex: 1, marginBottom: 0 }]}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                <Ionicons name={showPassword ? "eye-off" : "eye"} size={20} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={[styles.passwordContainer, { marginTop: 12 }]}>
              <TextInput
                placeholder="Confirmar contraseña"
                placeholderTextColor="#999"
                secureTextEntry={!showConfirmPassword}
                value={formData.confirmPassword}
                onChangeText={(t) => setFormData({ ...formData, confirmPassword: t })}
                style={[styles.input, { flex: 1, marginBottom: 0 }]}
              />
              <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeIcon}>
                <Ionicons name={showConfirmPassword ? "eye-off" : "eye"} size={20} color="#666" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Datos personales</Text>
            <TextInput
              placeholder="Nombre completo"
              placeholderTextColor="#999"
              value={formData.name}
              onChangeText={(t) => setFormData({ ...formData, name: t })}
              style={styles.input}
            />
            <TextInput
              placeholder="Teléfono (9 dígitos)"
              placeholderTextColor="#999"
              keyboardType="phone-pad"
              maxLength={9}
              value={formData.phone}
              onChangeText={(t) => setFormData({ ...formData, phone: t })}
              style={styles.input}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Dirección de entrega</Text>
            <TextInput
              placeholder="Dirección (Calle, número, piso...)"
              placeholderTextColor="#999"
              value={formData.address}
              onChangeText={(t) => setFormData({ ...formData, address: t })}
              style={styles.input}
            />
            
            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 12 }}>
              <View style={[styles.input, { flex: 1, paddingVertical: 0, justifyContent: 'center', marginBottom: 0 }]}>
                <Picker
                  selectedValue={formData.city}
                  onValueChange={(v) => setFormData({ ...formData, city: v })}
                  style={{ height: 50 }}
                  itemStyle={{ fontFamily: 'Anton', fontSize: 16 }}
                >
                  <Picker.Item label="Jerez de la Frontera" value="Jerez de la Frontera" />
                </Picker>
              </View>
              <TextInput
                placeholder="C.P."
                placeholderTextColor="#999"
                keyboardType="numeric"
                maxLength={5}
                value={formData.postalCode}
                onChangeText={(t) => setFormData({ ...formData, postalCode: t })}
                style={[styles.input, { width: 80, marginBottom: 0 }]}
              />
            </View>

            <View style={[styles.input, { paddingVertical: 0, justifyContent: 'center' }]}>
              <Picker
                selectedValue={formData.province}
                onValueChange={(v) => setFormData({ ...formData, province: v })}
                style={{ height: 50 }}
                itemStyle={{ fontFamily: 'Anton', fontSize: 16 }}
              >
                <Picker.Item label="Cádiz" value="Cádiz" />
              </Picker>
            </View>
          </View>

          <TouchableOpacity
            onPress={handleRegister}
            disabled={loading}
            style={styles.button}
          >
            {loading ? <ActivityIndicator color="#000" /> : <Text style={styles.buttonText}>CREAR CUENTA</Text>}
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
  title: { fontFamily: 'Anton', fontSize: 32, marginBottom: 24, color: '#000', textAlign: 'center' },
  section: { marginBottom: 20 },
  sectionLabel: { fontFamily: 'Anton', fontSize: 14, color: colors.primary, marginBottom: 8, textTransform: 'uppercase' },
  input: { fontFamily: 'Anton', borderWidth: 1, borderColor: '#DDD', borderRadius: 12, paddingHorizontal: 15, paddingVertical: 12, marginBottom: 12, backgroundColor: '#FFF', fontSize: 16 },
  passwordContainer: { flexDirection: 'row', alignItems: 'center' },
  eyeIcon: { position: 'absolute', right: 15, height: '100%', justifyContent: 'center' },
  button: { backgroundColor: colors.primary, borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginBottom: 20, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4 },
  buttonText: { fontFamily: 'Anton', fontSize: 18, color: '#000' },
  linkText: { color: colors.primary, fontFamily: 'Anton', textAlign: 'center', fontSize: 16 },
});
