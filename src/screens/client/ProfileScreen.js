import React, { useEffect, useMemo, useState } from "react";
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
import { Picker } from '@react-native-picker/picker';

import { auth, db } from "../../lib/firebase";
import useAuth from "../../hooks/useAuth";
import { colors } from "../../theme/theme";

export default function ProfileScreen() {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    city: 'Jerez de la Frontera',
    province: 'Cádiz',
    postalCode: '',
    role: 'cliente'
  });

  const [info, setInfo] = useState("");
  const [error, setError] = useState("");

  const ref = useMemo(() => (user ? doc(db, "users", user.uid) : null), [user]);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      if (!ref || !user) {
        setLoading(false);
        return;
      }

      try {
        const snap = await getDoc(ref);
        if (!mounted) return;

        if (snap.exists()) {
          const data = snap.data();
          setFormData({
            name: data.name || "",
            phone: data.phone || "",
            address: data.address?.line1 || "",
            city: data.address?.city || "Jerez de la Frontera",
            province: data.address?.province || "Cádiz",
            postalCode: data.address?.postalCode || "",
            role: data.role || "cliente"
          });
        }
      } catch (e) {
        if (!mounted) return;
        setError("No se pudo cargar el perfil.");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => { mounted = false; };
  }, [ref, user]);

  const validateForm = () => {
    if (!formData.name.trim() || !formData.phone.trim() || !formData.address.trim() || !formData.postalCode.trim()) {
      Alert.alert('Error', 'Por favor, rellena todos los campos obligatorios.');
      return false;
    }
    if (formData.phone.trim().length !== 9) {
      Alert.alert('Error', 'El teléfono debe tener 9 dígitos.');
      return false;
    }
    return true;
  };

  const save = async () => {
    if (!validateForm()) return;
    setError("");
    setInfo("");
    if (!ref || !user) return;

    setSaving(true);
    try {
      await setDoc(
        ref,
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
    } catch (e) {
      setError("No se pudo guardar el perfil.");
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
      "Eliminar cuenta",
      "¿Estás seguro? Esta acción no se puede deshacer y perderás todos tus datos y puntos.",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Eliminar", 
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);
              const currentUser = auth.currentUser;
              if (currentUser) {
                await deleteDoc(doc(db, "users", currentUser.uid));
                await deleteUser(currentUser);
                router.replace("/(auth)/login");
              }
            } catch (e) {
              Alert.alert("Error", "Por seguridad, cierra sesión e inicia de nuevo antes de eliminar tu cuenta.");
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  if (loading) return <View style={styles.centered}><ActivityIndicator size="large" color={colors.primary} /></View>;

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>MI PERFIL</Text>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        {info ? <Text style={styles.infoText}>{info}</Text> : null}

        <View style={styles.formGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput value={user?.email} editable={false} style={[styles.input, styles.disabledInput]} />

          <Text style={styles.label}>Nombre</Text>
          <TextInput
            value={formData.name}
            onChangeText={(t) => setFormData({...formData, name: t})}
            style={styles.input}
          />

          <Text style={styles.label}>Teléfono</Text>
          <TextInput
            value={formData.phone}
            onChangeText={(t) => setFormData({...formData, phone: t})}
            keyboardType="phone-pad"
            maxLength={9}
            style={styles.input}
          />

          <Text style={styles.label}>Dirección</Text>
          <TextInput
            value={formData.address}
            onChangeText={(t) => setFormData({...formData, address: t})}
            style={styles.input}
          />

          <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
            <View style={[styles.input, { flex: 1, paddingVertical: 0, justifyContent: 'center', marginBottom: 0 }]}>
              <Picker
                selectedValue={formData.city}
                onValueChange={(v) => setFormData({ ...formData, city: v })}
                style={{ height: 50 }}
              >
                <Picker.Item label="Jerez de la Frontera" value="Jerez de la Frontera" />
              </Picker>
            </View>
            <TextInput
              placeholder="C.P."
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
            >
              <Picker.Item label="Cádiz" value="Cádiz" />
            </Picker>
          </View>

          <Text style={styles.label}>Rol</Text>
          <TextInput value={formData.role.toUpperCase()} editable={false} style={[styles.input, styles.disabledInput]} />
        </View>

        <TouchableOpacity onPress={save} disabled={saving} style={styles.primaryButton}>
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
  formGroup: { marginBottom: 24 },
  label: { fontFamily: "Anton", fontSize: 14, color: colors.primary, marginBottom: 8, textTransform: "uppercase" },
  input: { fontFamily: "Anton", borderWidth: 1, borderColor: "#DDD", borderRadius: 12, paddingHorizontal: 15, paddingVertical: 12, marginBottom: 16, fontSize: 16, color: "#000" },
  disabledInput: { backgroundColor: "#F5F5F5", color: "#999" },
  primaryButton: { backgroundColor: colors.primary, borderRadius: 12, paddingVertical: 16, alignItems: "center", marginBottom: 12, elevation: 2 },
  primaryButtonText: { fontFamily: "Anton", fontSize: 18, color: "#000" },
  secondaryButton: { borderWidth: 2, borderColor: colors.primary, borderRadius: 12, paddingVertical: 16, alignItems: "center", marginBottom: 32 },
  secondaryButtonText: { fontFamily: "Anton", fontSize: 16, color: colors.primary },
  deleteButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 12 },
  deleteButtonText: { fontFamily: "Anton", color: "#FF4444", fontSize: 14, marginLeft: 8, textDecorationLine: "underline" },
  errorText: { fontFamily: "Anton", color: "red", marginBottom: 12, textAlign: "center" },
  infoText: { fontFamily: "Anton", color: "green", marginBottom: 12, textAlign: "center" },
});
