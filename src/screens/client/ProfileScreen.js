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
  Platform,
  Modal
} from "react-native";
import { router } from "expo-router";
import { signOut, deleteUser, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";
import { doc, setDoc, deleteDoc } from "firebase/firestore";
import { Ionicons } from '@expo/vector-icons';

import { auth, db } from "../../lib/firebase";
import { useAuth } from "../../context/AuthContext";
import { colors } from "../../theme/theme";
import CustomPicker from "../../components/ui/CustomPicker";

const JEREZ_ZIP_CODES = [
  '11401', '11402', '11403', '11404', '11405', '11406', '11407', '11408', '11409',
  '11570', '11580', '11590', '11591', '11592', '11593', '11594', '11595', '11596'
];

export default function ProfileScreen() {
  const { user, profile, profileLoading } = useAuth();
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [info, setInfo] = useState("");
  const [reauthVisible, setReauthVisible] = useState(false);
  const [password, setPassword] = useState("");

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
    setSaving(true);
    try {
      await setDoc(doc(db, "users", user.uid), {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        address: {
          line1: formData.address.trim(),
          city: formData.city,
          province: formData.province,
          postalCode: formData.postalCode.trim(),
        },
        updatedAt: new Date().toISOString(),
      }, { merge: true });
      setInfo("Perfil guardado correctamente.");
      setTimeout(() => setInfo(""), 3000);
    } catch (e) {
      setErrors({ general: "No se pudo guardar el perfil." });
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.replace("/(auth)/login");
  };

  const confirmDelete = async () => {
    if (!password) {
      Alert.alert("Error", "Debes introducir tu contraseña para confirmar.");
      return;
    }

    try {
      const credential = EmailAuthProvider.credential(user.email, password);
      await reauthenticateWithCredential(auth.currentUser, credential);
      await deleteDoc(doc(db, "users", user.uid));
      await deleteUser(auth.currentUser);
      setReauthVisible(false);
      router.replace("/(auth)/login");
    } catch (e) {
      Alert.alert("Error", "Contraseña incorrecta o error al eliminar la cuenta.");
    }
  };

  const renderInput = (label, field, options = {}) => (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputWrapper, errors[field] && styles.inputError, options.editable === false && styles.disabledInput]}>
        <TextInput
          value={field === 'email' ? user?.email : formData[field]}
          onChangeText={(t) => setFormData({ ...formData, [field]: t })}
          editable={options.editable !== false}
          keyboardType={options.keyboardType || "default"}
          maxLength={options.maxLength}
          style={styles.input}
          placeholder={options.placeholder}
        />
      </View>
      {errors[field] && <Text style={styles.errorText}>{errors[field]}</Text>}
    </View>
  );

  if (profileLoading) return <View style={styles.centered}><ActivityIndicator size="large" color={colors.primary} /></View>;

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>MI PERFIL</Text>
        
        <View style={styles.pointsBadge}>
          <Ionicons name="star" size={20} color="#000" />
          <Text style={styles.pointsText}>{profile?.points || 0} PUNTOS WHY NOT</Text>
        </View>

        {info ? <Text style={styles.infoText}>{info}</Text> : null}

        <View style={styles.formSection}>
          {renderInput("Email", "email", { editable: false })}
          {renderInput("Nombre completo", "name")}
          {renderInput("Teléfono", "phone", { keyboardType: "phone-pad", maxLength: 9 })}
          {renderInput("Dirección", "address")}
          
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <View style={{ flex: 1 }}>
              <CustomPicker
                label="Ciudad"
                options={[{ label: 'Jerez de la Frontera', value: 'Jerez de la Frontera' }]}
                selectedValue={formData.city}
                onValueChange={(v) => setFormData({ ...formData, city: v })}
              />
            </View>
            <View style={{ width: 100 }}>
              {renderInput("C.P.", "postalCode", { keyboardType: "numeric", maxLength: 5 })}
            </View>
          </View>

          {(profile?.role === 'master' || profile?.role === 'employee') && (
            <TouchableOpacity style={styles.adminBtn} onPress={() => router.replace("/(auth)/role-selector")}>
              <Ionicons name="settings" size={20} color="#000" />
              <Text style={styles.adminBtnText}>PANEL DE CONTROL</Text>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity onPress={save} disabled={saving} style={styles.primaryButton}>
          {saving ? <ActivityIndicator color="#000" /> : <Text style={styles.primaryButtonText}>GUARDAR CAMBIOS</Text>}
        </TouchableOpacity>

        <TouchableOpacity onPress={handleLogout} style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>CERRAR SESIÓN</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setReauthVisible(true)} style={styles.deleteBtn}>
          <Text style={styles.deleteBtnText}>ELIMINAR CUENTA</Text>
        </TouchableOpacity>

        <Modal visible={reauthVisible} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>CONFIRMAR ELIMINACIÓN</Text>
              <Text style={styles.modalDesc}>Por seguridad, introduce tu contraseña para eliminar permanentemente tu cuenta.</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Contraseña"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity style={styles.modalCancel} onPress={() => setReauthVisible(false)}>
                  <Text style={styles.modalCancelText}>CANCELAR</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalDelete} onPress={confirmDelete}>
                  <Text style={styles.modalDeleteText}>ELIMINAR</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF" },
  scrollContent: { padding: 24 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontFamily: "Anton", fontSize: 32, color: "#000", marginBottom: 10, textAlign: "center" },
  pointsBadge: { backgroundColor: colors.primary, flexDirection: 'row', padding: 10, borderRadius: 20, alignSelf: 'center', alignItems: 'center', marginBottom: 25 },
  pointsText: { fontFamily: "Anton", fontSize: 14, marginLeft: 8 },
  formSection: { marginBottom: 20 },
  inputGroup: { marginBottom: 15 },
  label: { fontFamily: "Anton", fontSize: 12, color: "#666", marginBottom: 5, textTransform: "uppercase" },
  inputWrapper: { borderWidth: 1, borderColor: "#DDD", borderRadius: 10, backgroundColor: "#FFF" },
  input: { fontFamily: "Anton", padding: 12, fontSize: 16, color: "#000" },
  inputError: { borderColor: "#FF4444" },
  disabledInput: { backgroundColor: "#F5F5F5" },
  errorText: { color: "#FF4444", fontSize: 11, marginTop: 3, fontFamily: "Anton" },
  infoText: { color: "#4CAF50", textAlign: "center", marginBottom: 15, fontFamily: "Anton" },
  primaryButton: { backgroundColor: colors.primary, borderRadius: 12, padding: 16, alignItems: "center", marginBottom: 10 },
  primaryButtonText: { fontFamily: "Anton", fontSize: 18, color: "#000" },
  secondaryButton: { borderWidth: 2, borderColor: colors.primary, borderRadius: 12, padding: 16, alignItems: "center", marginBottom: 30 },
  secondaryButtonText: { fontFamily: "Anton", fontSize: 16, color: colors.primary },
  adminBtn: { flexDirection: 'row', backgroundColor: '#eee', padding: 15, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginTop: 10 },
  adminBtnText: { fontFamily: "Anton", marginLeft: 10 },
  deleteBtn: { alignSelf: 'center' },
  deleteBtnText: { fontFamily: "Anton", color: "#FF4444", textDecorationLine: 'underline' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#FFF', borderRadius: 20, padding: 25 },
  modalTitle: { fontFamily: "Anton", fontSize: 20, marginBottom: 10 },
  modalDesc: { fontSize: 14, color: '#666', marginBottom: 20 },
  modalInput: { borderWidth: 1, borderColor: '#DDD', borderRadius: 10, padding: 12, marginBottom: 20 },
  modalButtons: { flexDirection: 'row', gap: 10 },
  modalCancel: { flex: 1, padding: 15, alignItems: 'center' },
  modalCancelText: { fontFamily: "Anton", color: '#666' },
  modalDelete: { flex: 1, backgroundColor: '#FF4444', padding: 15, borderRadius: 10, alignItems: 'center' },
  modalDeleteText: { fontFamily: "Anton", color: '#FFF' }
});
