import React, { useEffect, useState } from "react";
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  Alert, 
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from "react-native";
import { router } from "expo-router";
import { signOut, deleteUser } from "firebase/auth";
import { doc, getDoc, setDoc, deleteDoc } from "firebase/firestore";
import { Ionicons } from '@expo/vector-icons';

import { auth, db } from "../../lib/firebase";
import { useAuth } from "../../context/AuthContext";
import { colors } from "../../theme/theme";
import CustomPicker from "../../components/ui/CustomPicker";

// Códigos postales válidos de Jerez de la Frontera
const JEREZ_ZIP_CODES = [
  '11401', '11402', '11403', '11404', '11405', '11406', '11407', '11408', '11409',
  '11570', '11580', '11590', '11591', '11592', '11593', '11594', '11595', '11596'
];

export default function ProfileScreen() {
  const { user, profile, profileLoading } = useAuth();

  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [info, setInfo] = useState("");

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    city: 'Jerez de la Frontera',
    province: 'Cádiz',
    postalCode: '',
    role: 'cliente'
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || "",
        phone: profile.phone || "",
        address: profile.address?.line1 || "",
        city: profile.address?.city || "Jerez de la Frontera",
        province: profile.address?.province || "Cádiz",
        postalCode: profile.address?.postalCode || "",
        role: profile.role || "cliente"
      });
    }
  }, [profile]);

  const cityOptions = [
    { label: 'Jerez de la Frontera', value: 'Jerez de la Frontera' }
  ];

  const provinceOptions = [
    { label: 'Cádiz', value: 'Cádiz' }
  ];

  const validate = () => {
    let newErrors = {};

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

  const save = async () => {
    if (!validate()) return;
    setErrors({});
    setInfo("");
    if (!user) return;

    setSaving(true);
    try {
      await setDoc(
        doc(db, "users", user.uid),
        {
          name: formData.name.trim(),
          phone: formData.phone.trim(),
          address: {
            line1: formData.address.trim(),
            city: formData.city,
            province: formData.province,
            postalCode: formData.postalCode.trim(),
          },
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
      setInfo("Perfil guardado correctamente.");
      setTimeout(() => setInfo(""), 3000);
    } catch (e) {
      setErrors({ general: "No se pudo guardar el perfil." });
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.replace("/(auth)/login");
    } catch (e) {
      router.replace("/(auth)/login");
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "ELIMINAR CUENTA",
      "¿Estás seguro? Esta acción no se puede deshacer y perderás todos tus datos y puntos.",
      [
        { text: "CANCELAR", style: "cancel" },
        { 
          text: "ELIMINAR", 
          style: "destructive",
          onPress: async () => {
            try {
              const currentUser = auth.currentUser;
              if (currentUser) {
                await deleteDoc(doc(db, "users", currentUser.uid));
                await deleteUser(currentUser);
                router.replace("/(auth)/login");
              }
            } catch (e) {
              Alert.alert("ERROR", "Por seguridad, cierra sesión e inicia de nuevo antes de eliminar tu cuenta.");
            }
          }
        }
      ]
    );
  };

  const renderInput = (label, field, options = {}) => (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputWrapper, errors[field] && styles.inputError, options.editable === false && styles.disabledInput]}>
        <TextInput
          value={field === 'email' ? user?.email : formData[field]}
          onChangeText={(t) => {
            setFormData({ ...formData, [field]: t });
            if (errors[field]) setErrors({ ...errors, [field]: null });
          }}
          editable={options.editable !== false}
          keyboardType={options.keyboardType || "default"}
          maxLength={options.maxLength}
          style={[styles.input, options.style]}
        />
      </View>
      {errors[field] && <Text style={styles.errorText}>{errors[field]}</Text>}
    </View>
  );

  if (profileLoading) return <View style={styles.centered}><ActivityIndicator size="large" color={colors.primary} /></View>;

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>MI PERFIL</Text>

        {errors.general && <Text style={styles.generalError}>{errors.general}</Text>}
        {info ? <Text style={styles.infoText}>{info}</Text> : null}

        <View style={styles.formSection}>
          {renderInput("Email", "email", { editable: false })}
          {renderInput("Nombre completo", "name", { autoCapitalize: "words" })}
          {renderInput("Teléfono (9 dígitos)", "phone", { keyboardType: "phone-pad", maxLength: 9 })}
          {renderInput("Dirección de entrega", "address")}

          <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
            <View style={{ flex: 1 }}>
              <CustomPicker
                label="Ciudad"
                options={cityOptions}
                selectedValue={formData.city}
                onValueChange={(v) => setFormData({ ...formData, city: v })}
                style={{ marginBottom: 0 }}
              />
            </View>
            <View style={{ width: 100 }}>
              {renderInput("C.P.", "postalCode", { keyboardType: "numeric", maxLength: 5, style: { marginBottom: 0 } })}
            </View>
          </View>

          <CustomPicker
            label="Provincia"
            options={provinceOptions}
            selectedValue={formData.province}
            onValueChange={(v) => setFormData({ ...formData, province: v })}
            style={{ marginBottom: 16 }}
          />

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Rol de usuario</Text>
            <View style={[styles.inputWrapper, styles.disabledInput]}>
              <Text style={[styles.input, { color: '#999' }]}>{formData.role.toUpperCase()}</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity onPress={save} disabled={saving} style={[styles.primaryButton, saving && styles.buttonDisabled]}>
          {saving ? <ActivityIndicator color="#000" /> : <Text style={styles.primaryButtonText}>GUARDAR CAMBIOS</Text>}
        </TouchableOpacity>

        <TouchableOpacity onPress={handleLogout} style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>CERRAR SESIÓN</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleDeleteAccount} style={styles.deleteButton}>
          <Ionicons name="trash-outline" size={18} color="#FF4444" />
          <Text style={styles.deleteButtonText}>ELIMINAR MI CUENTA</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF" },
  scrollContent: { padding: 24, paddingBottom: 40 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontFamily: "Anton", fontSize: 32, color: "#000", marginBottom: 24, textAlign: "center" },
  formSection: { marginBottom: 24 },
  inputGroup: { marginBottom: 16 },
  label: { fontFamily: "Anton", fontSize: 14, color: colors.primary, marginBottom: 8, textTransform: "uppercase" },
  inputWrapper: { borderWidth: 1, borderColor: "#DDD", borderRadius: 12, backgroundColor: "#FFF", overflow: 'hidden' },
  input: { fontFamily: "Anton", paddingHorizontal: 15, paddingVertical: 12, fontSize: 16, color: "#000" },
  inputError: { borderColor: "#FF4444", backgroundColor: "#FFF5F5" },
  disabledInput: { backgroundColor: "#F5F5F5" },
  errorText: { color: "#FF4444", fontSize: 12, marginTop: 4, marginLeft: 5, fontFamily: "Anton" },
  generalError: { backgroundColor: "#FF4444", color: "#FFF", padding: 12, borderRadius: 12, textAlign: "center", marginBottom: 20, fontFamily: "Anton" },
  infoText: { backgroundColor: "#4CAF50", color: "#FFF", padding: 12, borderRadius: 12, textAlign: "center", marginBottom: 20, fontFamily: "Anton" },
  primaryButton: { backgroundColor: colors.primary, borderRadius: 12, paddingVertical: 16, alignItems: "center", marginBottom: 12, elevation: 2 },
  buttonDisabled: { opacity: 0.7 },
  primaryButtonText: { fontFamily: "Anton", fontSize: 18, color: "#000" },
  secondaryButton: { borderWidth: 2, borderColor: colors.primary, borderRadius: 12, paddingVertical: 16, alignItems: "center", marginBottom: 32 },
  secondaryButtonText: { fontFamily: "Anton", fontSize: 16, color: colors.primary },
  deleteButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 12 },
  deleteButtonText: { fontFamily: "Anton", color: "#FF4444", fontSize: 14, marginLeft: 8, textDecorationLine: "underline" },
});
