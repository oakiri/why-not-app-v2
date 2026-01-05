import React, { useState } from 'react';
import { 
  View, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform,
  StyleSheet,
  Alert
} from 'react-native';
import AntonText from '../../components/ui/AntonText';
import { router } from 'expo-router';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';

import { auth, db } from '../../lib/firebase';
import AuthLayout from '../../components/auth/AuthLayout';
import { colors } from '../../theme/theme';
import { mapAuthErrorMessage } from '../../utils/authErrorMessages';
import CustomPicker from '../../components/ui/CustomPicker';

const JEREZ_ZIP_CODES = [
  '11401', '11402', '11403', '11404', '11405', '11406', '11407', '11408', '11409',
  '11570', '11580', '11590', '11591', '11592', '11593', '11594', '11595', '11596'
];

export default function RegisterScreen() {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});

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

  const validate = () => {
    let newErrors = {};
    if (!formData.email.trim()) newErrors.email = 'El email es obligatorio';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email no válido';
    if (!formData.password) newErrors.password = 'La contraseña es obligatoria';
    else if (formData.password.length < 6) newErrors.password = 'Mínimo 6 caracteres';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Las contraseñas no coinciden';
    if (!formData.name.trim()) newErrors.name = 'El nombre es obligatorio';
    if (!formData.phone.trim()) newErrors.phone = 'El teléfono es obligatorio';
    else if (!/^\d{9}$/.test(formData.phone.trim())) newErrors.phone = 'Debe tener 9 dígitos';
    if (!formData.address.trim()) newErrors.address = 'La dirección es obligatoria';
    if (!formData.postalCode.trim()) newErrors.postalCode = 'El C.P. es obligatorio';
    else if (!JEREZ_ZIP_CODES.includes(formData.postalCode.trim())) {
      newErrors.postalCode = 'C.P. no válido para Jerez';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const { user } = await createUserWithEmailAndPassword(auth, formData.email.trim(), formData.password);
      await sendEmailVerification(user);
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
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
      });
      router.replace('/verify-email');
    } catch (e) {
      console.error(e);
      setErrors({ general: mapAuthErrorMessage(e) });
    } finally {
      setLoading(false);
    }
  };

  const renderInput = (placeholder, field, options = {}) => (
    <View style={styles.inputGroup}>
      <View style={[styles.inputWrapper, errors[field] && styles.inputError]}>
        <TextInput
          placeholder={placeholder}
          placeholderTextColor="#999"
          autoCapitalize={options.autoCapitalize || "none"}
          keyboardType={options.keyboardType || "default"}
          secureTextEntry={options.secure && !(field === 'password' ? showPassword : showConfirmPassword)}
          value={formData[field]}
          onChangeText={(t) => {
            setFormData({ ...formData, [field]: t });
            if (errors[field]) setErrors({ ...errors, [field]: null });
          }}
          style={[styles.input, options.style]}
          maxLength={options.maxLength}
        />
        {options.secure && (
          <TouchableOpacity 
            onPress={() => field === 'password' ? setShowPassword(!showPassword) : setShowConfirmPassword(!showConfirmPassword)} 
            style={styles.eyeIcon}
          >
            <Ionicons name={(field === 'password' ? showPassword : showConfirmPassword) ? "eye-off" : "eye"} size={20} color="#666" />
          </TouchableOpacity>
        )}
      </View>
      {errors[field] && <AntonText style={styles.errorText}>{errors[field]}</AntonText>}
    </View>
  );

	  return (
	    <AuthLayout>
	      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
	        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
	          <AntonText style={styles.title}>CREAR CUENTA</AntonText>
	          {errors.general && <AntonText style={styles.generalError}>{errors.general}</AntonText>}
	          <View style={styles.section}>
	            <AntonText style={styles.sectionLabel}>Datos de acceso</AntonText>
	            {renderInput("Correo electrónico", "email", { keyboardType: "email-address" })}
	            {renderInput("Contraseña", "password", { secure: true })}
	            {renderInput("Confirmar contraseña", "confirmPassword", { secure: true })}
	          </View>
	          <View style={styles.section}>
	            <AntonText style={styles.sectionLabel}>Datos personales</AntonText>
	            {renderInput("Nombre completo", "name", { autoCapitalize: "words" })}
	            {renderInput("Teléfono (9 dígitos)", "phone", { keyboardType: "phone-pad", maxLength: 9 })}
	          </View>
	          <View style={styles.section}>
	            <AntonText style={styles.sectionLabel}>Dirección de entrega</AntonText>
	            {renderInput("Dirección (Calle, número, piso...)", "address")}
		            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 12 }}>
		              <View style={{ flex: 3 }}>
		                <CustomPicker
		                  options={[{ label: 'Jerez de la Frontera', value: 'Jerez de la Frontera' }]}
		                  selectedValue={formData.city}
		                  onValueChange={(v) => setFormData({ ...formData, city: v })}
		                />
		              </View>
		              <View style={{ flex: 1 }}>
		                {renderInput("C.P.", "postalCode", { keyboardType: "numeric", maxLength: 5 })}
		              </View>
		            </View>
	          </View>
	          <TouchableOpacity onPress={handleRegister} disabled={loading} style={[styles.button, loading && styles.buttonDisabled]}>
	            {loading ? <ActivityIndicator color="#000" /> : <AntonText style={styles.buttonText}>CREAR CUENTA</AntonText>}
	          </TouchableOpacity>
	          <TouchableOpacity onPress={() => router.replace('/login')}>
	            <AntonText style={styles.linkText}>Ya tengo cuenta → Iniciar sesión</AntonText>
	          </TouchableOpacity>
	        </ScrollView>
	      </KeyboardAvoidingView>
	    </AuthLayout>
	  );
}

const styles = StyleSheet.create({
  title: { fontSize: 32, marginBottom: 24, color: '#000', textAlign: 'center' },
  section: { marginBottom: 20 },
  sectionLabel: { fontSize: 14, color: colors.primary, marginBottom: 8, textTransform: 'uppercase' },
  inputGroup: { marginBottom: 12 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', borderWidth: 2, borderColor: '#EEE', borderRadius: 12, backgroundColor: '#FFF' },
  input: { flex: 1, paddingHorizontal: 15, paddingVertical: 12, fontSize: 16, color: '#000', fontFamily: 'Anton' },
  inputError: { borderColor: '#FF4444' },
  errorText: { color: '#FF4444', fontSize: 12, marginTop: 4, marginLeft: 5 },
  generalError: { backgroundColor: '#FF4444', color: '#FFF', padding: 12, borderRadius: 12, textAlign: 'center', marginBottom: 20 },
  eyeIcon: { paddingHorizontal: 15 },
  button: { backgroundColor: colors.primary, borderRadius: 15, paddingVertical: 16, alignItems: 'center', marginBottom: 20 },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { fontSize: 18, color: '#000' },
  linkText: { color: colors.primary, textAlign: 'center', fontSize: 16 },
});
