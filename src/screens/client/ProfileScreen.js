import React, { useEffect, useMemo, useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { signOut } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

import { auth, db } from "../../lib/firebase";
import useAuth from "../../hooks/useAuth";
import { colors, typography } from "../../theme/theme";

export default function ProfileScreen() {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
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
      setError("");
      setInfo("");

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
        } else {
          setProfileExists(false);
        }
      } catch (e) {
        if (!mounted) return;
        setError("No se pudo cargar el perfil desde Firestore.");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, [ref, user]);

  const save = async () => {
    setError("");
    setInfo("");
    if (!ref || !user) return;

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

  if (!user) {
    return (
      <View style={{ flex: 1, padding: 24, justifyContent: "center" }}>
        <Text style={typography.title}>PERFIL</Text>
        <Text style={[typography.body, { marginTop: 10 }]}>No hay sesión activa.</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 24, backgroundColor: colors.background }}>
      <Text style={[typography.title, { marginBottom: 12 }]}>PERFIL</Text>

      {loading ? <Text style={typography.body}>Cargando…</Text> : null}
      {error ? <Text style={{ color: "red", marginBottom: 8 }}>{error}</Text> : null}
      {info ? <Text style={{ color: "green", marginBottom: 8 }}>{info}</Text> : null}

      {!loading && !profileExists ? (
        <Text style={[typography.body, { marginBottom: 12, color: colors.textMuted }]}>
          No hay perfil en Firestore para este usuario (users/{user.uid}). Puedes crearlo guardando el
          formulario.
        </Text>
      ) : null}

      <Text style={[typography.body, { marginTop: 8 }]}>Email</Text>
      <TextInput
        value={email}
        editable={false}
        style={{
          borderWidth: 1,
          borderColor: "#DDD",
          borderRadius: 8,
          paddingHorizontal: 12,
          paddingVertical: 10,
          marginBottom: 12,
          color: colors.text,
          opacity: 0.8,
        }}
      />

      <Text style={typography.body}>Nombre</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Tu nombre"
        style={{
          borderWidth: 1,
          borderColor: "#DDD",
          borderRadius: 8,
          paddingHorizontal: 12,
          paddingVertical: 10,
          marginBottom: 12,
          color: colors.text,
        }}
      />

      <Text style={typography.body}>Teléfono</Text>
      <TextInput
        value={phone}
        onChangeText={setPhone}
        placeholder="Tu teléfono"
        keyboardType="phone-pad"
        style={{
          borderWidth: 1,
          borderColor: "#DDD",
          borderRadius: 8,
          paddingHorizontal: 12,
          paddingVertical: 10,
          marginBottom: 12,
          color: colors.text,
        }}
      />

      <Text style={typography.body}>Rol</Text>
      <TextInput
        value={role}
        onChangeText={setRole}
        placeholder="cliente"
        style={{
          borderWidth: 1,
          borderColor: "#DDD",
          borderRadius: 8,
          paddingHorizontal: 12,
          paddingVertical: 10,
          marginBottom: 18,
          color: colors.text,
        }}
      />

      <TouchableOpacity
        onPress={save}
        style={{
          borderWidth: 2,
          borderColor: colors.primary,
          borderRadius: 999,
          paddingVertical: 14,
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <Text style={{ fontWeight: "bold", color: colors.primary }}>Guardar cambios</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={handleLogout}
        style={{
          backgroundColor: colors.primary,
          borderRadius: 999,
          paddingVertical: 14,
          alignItems: "center",
        }}
      >
        <Text style={{ fontWeight: "bold" }}>Cerrar sesión</Text>
      </TouchableOpacity>
    </View>
  );
}
