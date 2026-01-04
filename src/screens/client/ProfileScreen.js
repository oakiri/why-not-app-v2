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

import { auth, db } from "../../lib/firebase";
import useAuth from "../../hooks/useAuth";
import { colors } from "../../theme/theme";

export default function ProfileScreen() {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileExists, setProfileExists] = useState(false);

  const [email, setEmail] = useState(user?.email ?? "");
  const [role, setRole] = useState("cliente");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

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
          setProfileExists(true);
          setEmail(data.email || user.email || "");
          setRole(data.role || "cliente");
          setName(data.name || "");
          setPhone(data.phone || "");
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

  const save = async () => {
    setError("");
    setInfo("");
    if (!ref || !user) return;

    setSaving(true);
    try {
      await setDoc(
        ref,
        {
          email: user.email ?? email,
          role,
          name: name.trim(),
          phone: phone.trim(),
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
      setProfileExists(true);
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
      "¿Estás seguro de que quieres eliminar tu cuenta? Esta acción no se puede deshacer y perderás todos tus datos y puntos.",
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
                // 1. Eliminar documento de Firestore
                await deleteDoc(doc(db, "users", currentUser.uid));
                // 2. Eliminar usuario de Auth
                await deleteUser(currentUser);
                router.replace("/(auth)/login");
              }
            } catch (e) {
              console.error(e);
              Alert.alert(
                "Error", 
                "Para eliminar tu cuenta por seguridad debes haber iniciado sesión recientemente. Por favor, cierra sesión e inicia de nuevo antes de intentar eliminarla."
              );
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  if (!user) {
    return (
      <View style={styles.centered}>
        <Text style={styles.title}>PERFIL</Text>
        <Text style={styles.description}>No hay sesión activa.</Text>
        <TouchableOpacity 
          style={styles.primaryButton}
          onPress={() => router.replace("/(auth)/login")}
        >
          <Text style={styles.primaryButtonText}>Ir al Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

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
          <TextInput
            value={email}
            editable={false}
            style={[styles.input, styles.disabledInput]}
          />

          <Text style={styles.label}>Nombre</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Tu nombre"
            style={styles.input}
          />

          <Text style={styles.label}>Teléfono</Text>
          <TextInput
            value={phone}
            onChangeText={setPhone}
            placeholder="Tu teléfono"
            keyboardType="phone-pad"
            style={styles.input}
          />

          <Text style={styles.label}>Rol</Text>
          <TextInput
            value={role}
            editable={false}
            style={[styles.input, styles.disabledInput]}
          />
        </View>

        <TouchableOpacity
          onPress={save}
          disabled={saving}
          style={styles.primaryButton}
        >
          {saving ? <ActivityIndicator color="#000" /> : <Text style={styles.primaryButtonText}>Guardar cambios</Text>}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleLogout}
          style={styles.secondaryButton}
        >
          <Text style={styles.secondaryButtonText}>Cerrar sesión</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleDeleteAccount}
          style={styles.deleteButton}
        >
          <Ionicons name="trash-outline" size={18} color="#FF4444" />
          <Text style={styles.deleteButtonText}>Eliminar mi cuenta</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  title: {
    fontFamily: "Anton",
    fontSize: 32,
    color: "#000",
    marginBottom: 24,
    textAlign: "center",
  },
  description: {
    fontFamily: "Anton",
    fontSize: 16,
    color: "#666",
    marginBottom: 24,
  },
  formGroup: {
    marginBottom: 24,
  },
  label: {
    fontFamily: "Anton",
    fontSize: 14,
    color: colors.primary,
    marginBottom: 8,
    textTransform: "uppercase",
  },
  input: {
    fontFamily: "Anton",
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 16,
    fontSize: 16,
    color: "#000",
  },
  disabledInput: {
    backgroundColor: "#F5F5F5",
    color: "#999",
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 12,
    elevation: 2,
  },
  primaryButtonText: {
    fontFamily: "Anton",
    fontSize: 18,
    color: "#000",
  },
  secondaryButton: {
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 32,
  },
  secondaryButtonText: {
    fontFamily: "Anton",
    fontSize: 16,
    color: colors.primary,
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
  },
  deleteButtonText: {
    fontFamily: "Anton",
    color: "#FF4444",
    fontSize: 14,
    marginLeft: 8,
    textDecorationLine: "underline",
  },
  errorText: {
    fontFamily: "Anton",
    color: "red",
    marginBottom: 12,
    textAlign: "center",
  },
  infoText: {
    fontFamily: "Anton",
    color: "green",
    marginBottom: 12,
    textAlign: "center",
  },
});
