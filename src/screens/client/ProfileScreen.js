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
import { signOut, deleteUser, reauthenticateWithCredential, EmailAuthProvider, updatePassword, updateEmail } from "firebase/auth";
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
  const { user, profile, profileLoading, logout } = useAuth();
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [info, setInfo] = useState("");
  const [reauthVisible, setReauthVisible] = useState(false);
  const [reauthAction, setReauthAction] = useState(null); 
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newEmail, setNewEmail] = useState("");

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    city: 'Jerez de la Frontera',
    province: 'Cádiz',
    postalCode: '',
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
    setErrors({});
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
      
      setInfo("¡Perfil guardado correctamente!");
      setTimeout(() => setInfo(""), 3000);
    } catch (e) {
      setErrors({ general: "Error al guardar los cambios." });
    } finally {
      setSaving(false);
    }
  };

  const handleReauth = async () => {
    if (!password) {
      Alert.alert("Error", "Introduce tu contraseña actual.");
      return;
    }
    try {
      const credential = EmailAuthProvider.credential(user.email, password);
      await reauthenticateWithCredential(auth.currentUser, credential);
      
      if (reauthAction === 'delete') {
        await deleteDoc(doc(db, "users", user.uid));
        await deleteUser(auth.currentUser);
        router.replace("/(auth)/login");
      } else if (reauthAction === 'password') {
        await updatePassword(auth.currentUser, newPassword);
        setInfo("Contraseña actualizada.");
      } else if (reauthAction === 'email') {
        await updateEmail(auth.currentUser, newEmail);
        setInfo("Email actualizado.");
      }
      
      setReauthVisible(false);
      setPassword("");
      setNewPassword("");
      setNewEmail("");
    } catch (e) {
      Alert.alert("Error", "Contraseña incorrecta o error en la operación.");
    }
  };

  const renderInput = (label, field, options = {}) => (
    <View style={[styles.inputGroup, options.containerStyle]}>
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
          placeholderTextColor="#999"
        />
      </View>
      {errors[field] && <Text style={styles.errorText}>{errors[field]}</Text>}
    </View>
  );

  if (profileLoading) return <View style={styles.centered}><ActivityIndicator size="large" color={colors.primary} /></View>;

  const isStaff = profile?.role === 'master' || profile?.role === 'employee';

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>MI PERFIL</Text>
        
        {info ? <View style={styles.successBox}><Text style={styles.successText}>{info}</Text></View> : null}

        <View style={styles.formSection}>
          {renderInput("Email", "email", { editable: false })}
          {renderInput("Nombre completo", "name")}
          {renderInput("Teléfono", "phone", { keyboardType: "phone-pad", maxLength: 9 })}
          {renderInput("Dirección", "address")}
          
          <View style={styles.row}>
            <View style={{ flex: 1.5 }}>
              <CustomPicker
                label="Ciudad"
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

        <TouchableOpacity onPress={save} disabled={saving} style={styles.primaryButton}>
          {saving ? <ActivityIndicator color="#000" /> : <Text style={styles.primaryButtonText}>GUARDAR CAMBIOS</Text>}
        </TouchableOpacity>

        <View style={styles.actionGrid}>
          <TouchableOpacity 
            style={styles.actionBtn} 
            onPress={() => { setReauthAction('password'); setReauthVisible(true); }}
          >
            <Ionicons name="key-outline" size={22} color="#000" />
            <Text style={styles.actionBtnText}>CAMBIAR CONTRASEÑA</Text>
          </TouchableOpacity>

          {isStaff && (
            <TouchableOpacity 
              style={[styles.actionBtn, { backgroundColor: '#000' }]} 
              onPress={() => router.replace("/(auth)/role-selector")}
            >
              <Ionicons name="settings-outline" size={22} color={colors.primary} />
              <Text style={[styles.actionBtnText, { color: colors.primary }]}>PANEL CONTROL</Text>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity onPress={logout} style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>CERRAR SESIÓN</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => { setReauthAction('delete'); setReauthVisible(true); }} style={styles.deleteBtn}>
          <Text style={styles.deleteBtnText}>ELIMINAR MI CUENTA PERMANENTEMENTE</Text>
        </TouchableOpacity>

        <Modal visible={reauthVisible} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>
                {reauthAction === 'delete' ? 'ELIMINAR CUENTA' : 'CONFIRMAR CAMBIOS'}
              </Text>
              
              <Text style={styles.modalDesc}>Introduce tu contraseña actual para continuar.</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Contraseña actual"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                placeholderTextColor="#999"
              />

              {reauthAction === 'password' && (
                <TextInput
                  style={styles.modalInput}
                  placeholder="Nueva contraseña"
                  secureTextEntry
                  value={newPassword}
                  onChangeText={setNewPassword}
                  placeholderTextColor="#999"
                />
              )}

              <View style={styles.modalButtons}>
                <TouchableOpacity style={styles.modalCancel} onPress={() => setReauthVisible(false)}>
                  <Text style={styles.modalCancelText}>CANCELAR</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalConfirm} onPress={handleReauth}>
                  <Text style={styles.modalConfirmText}>CONFIRMAR</Text>
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
  scrollContent: { padding: 24, paddingBottom: 60 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontFamily: "Anton", fontSize: 36, color: "#000", marginBottom: 30, textAlign: "center" },
  formSection: { marginBottom: 25 },
  inputGroup: { marginBottom: 18 },
  row: { flexDirection: 'row', gap: 15, alignItems: 'flex-start' },
  label: { fontFamily: "Anton", fontSize: 13, color: "#333", marginBottom: 8, textTransform: "uppercase" },
  inputWrapper: { borderWidth: 2, borderColor: "#EEE", borderRadius: 12, backgroundColor: "#FFF" },
  input: { fontFamily: "Anton", padding: 14, fontSize: 16, color: "#000" },
  inputError: { borderColor: "#FF4444" },
  disabledInput: { backgroundColor: "#F9F9F9", borderColor: '#EEE' },
  errorText: { color: "#FF4444", fontSize: 12, marginTop: 4, fontFamily: "Anton" },
  successBox: { backgroundColor: '#E8F5E9', padding: 15, borderRadius: 12, marginBottom: 20 },
  successText: { color: '#2E7D32', textAlign: 'center', fontFamily: "Anton" },
  primaryButton: { backgroundColor: colors.primary, borderRadius: 15, padding: 18, alignItems: "center", marginBottom: 15, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  primaryButtonText: { fontFamily: "Anton", fontSize: 20, color: "#000" },
  actionGrid: { flexDirection: 'row', gap: 12, marginBottom: 15 },
  actionBtn: { flex: 1, backgroundColor: '#F8F8F8', padding: 15, borderRadius: 15, alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 1, borderColor: '#EEE' },
  actionBtnText: { fontFamily: "Anton", fontSize: 11, textAlign: 'center', color: '#000' },
  secondaryButton: { borderWidth: 2, borderColor: colors.primary, borderRadius: 15, padding: 18, alignItems: "center", marginBottom: 40 },
  secondaryButtonText: { fontFamily: "Anton", fontSize: 18, color: colors.primary },
  deleteBtn: { alignSelf: 'center', padding: 10 },
  deleteBtnText: { fontFamily: "Anton", color: "#FF4444", textDecorationLine: 'underline', fontSize: 13 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#FFF', borderRadius: 25, padding: 30 },
  modalTitle: { fontFamily: "Anton", fontSize: 24, marginBottom: 15, color: '#000' },
  modalDesc: { fontSize: 14, color: '#666', marginBottom: 20 },
  modalInput: { borderWidth: 2, borderColor: '#EEE', borderRadius: 12, padding: 15, marginBottom: 15, fontFamily: 'Anton' },
  modalButtons: { flexDirection: 'row', gap: 15, marginTop: 10 },
  modalCancel: { flex: 1, padding: 15, alignItems: 'center' },
  modalCancelText: { fontFamily: "Anton", color: '#999', fontSize: 16 },
  modalConfirm: { flex: 1, backgroundColor: colors.primary, padding: 15, borderRadius: 12, alignItems: 'center' },
  modalConfirmText: { fontFamily: "Anton", color: '#000', fontSize: 16 }
});
