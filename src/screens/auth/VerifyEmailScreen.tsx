import React, { useMemo, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Image, Alert } from "react-native";
import { router } from "expo-router";
import { sendEmailVerification, signOut, reload } from "firebase/auth";
import { auth } from "../../lib/firebase";
import { colors } from "../../theme/theme";
import { Ionicons } from '@expo/vector-icons';

export default function VerifyEmailScreen() {
  const [info, setInfo] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const user = auth.currentUser;

  const canResend = useMemo(() => !busy && cooldown <= 0, [busy, cooldown]);

  const tickCooldown = () => {
    let s = 30;
    setCooldown(s);
    const id = setInterval(() => {
      s -= 1;
      setCooldown(s);
      if (s <= 0) clearInterval(id);
    }, 1000);
  };

  const resend = async () => {
    setError("");
    setInfo("");
    if (!user) return;

    try {
      setBusy(true);
      await sendEmailVerification(user);
      setInfo("Email reenviado. Revisa bandeja de entrada y spam.");
      tickCooldown();
    } catch (e) {
      setError("No se pudo reenviar el email. Inténtalo en unos segundos.");
    } finally {
      setBusy(false);
    }
  };

  const refresh = async () => {
    setError("");
    setInfo("");
    if (!user) {
      router.replace("/(auth)/login");
      return;
    }

    try {
      setBusy(true);
      await reload(user);
      
      if (auth.currentUser?.emailVerified) {
        router.replace("/(tabs)/home");
      } else {
        setInfo("Aún no verificado. Si acabas de verificar, espera unos segundos y pulsa de nuevo.");
      }
    } catch (e) {
      console.error("Error al refrescar usuario:", e);
      setError("No se pudo comprobar el estado. Inténtalo de nuevo.");
    } finally {
      setBusy(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      router.replace("/(auth)/login");
    } catch {
      router.replace("/(auth)/login");
    }
  };

  return (
    <View style={styles.container}>
      <Image 
        source={require('../../../assets/logo.png')} 
        style={styles.logo}
        resizeMode="contain"
      />
      
      <Text style={styles.title}>VERIFICA TU EMAIL</Text>

      <Text style={styles.description}>
        Hemos enviado un enlace de verificación a: {'\n'}
        <Text style={styles.emailText}>{user?.email}</Text>
      </Text>

      {info ? <Text style={styles.infoText}>{info}</Text> : null}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <View style={styles.infoBox}>
        <Ionicons name="information-circle-outline" size={24} color={colors.primary} />
        <Text style={styles.infoBoxText}>
          Si no lo encuentras, revisa tu carpeta de correo no deseado o spam.
        </Text>
      </View>

      <TouchableOpacity
        onPress={refresh}
        disabled={busy}
        style={styles.primaryButton}
      >
        {busy ? (
          <ActivityIndicator color="#000" />
        ) : (
          <Text style={styles.primaryButtonText}>YA LO HE VERIFICADO</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        onPress={resend}
        disabled={!canResend}
        style={[styles.secondaryButton, !canResend && { opacity: 0.6 }]}
      >
        <Text style={styles.secondaryButtonText}>
          {cooldown > 0 ? `REENVIAR (${cooldown}s)` : "REENVIAR EMAIL"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={logout} style={styles.logoutButton}>
        <Text style={styles.logoutButtonText}>Cerrar sesión</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: "center", alignItems: 'center', backgroundColor: "#FFF" },
  logo: { width: 120, height: 120, marginBottom: 20 },
  title: { fontFamily: "Anton", fontSize: 28, color: "#000", marginBottom: 16, textAlign: "center" },
  description: { fontFamily: "Anton", fontSize: 16, color: "#666", marginBottom: 24, textAlign: "center", lineHeight: 22 },
  emailText: { color: '#000', fontSize: 18 },
  infoBox: { flexDirection: 'row', backgroundColor: '#F8F8F8', padding: 15, borderRadius: 12, alignItems: 'center', marginBottom: 30 },
  infoBoxText: { flex: 1, fontSize: 14, color: '#666', marginLeft: 10 },
  infoText: { fontFamily: "Anton", color: "green", marginBottom: 12, textAlign: "center" },
  errorText: { fontFamily: "Anton", color: "red", marginBottom: 12, textAlign: "center" },
  primaryButton: { backgroundColor: colors.primary, width: '100%', borderRadius: 12, paddingVertical: 16, alignItems: "center", marginBottom: 12, elevation: 2 },
  primaryButtonText: { fontFamily: "Anton", fontSize: 18, color: "#000" },
  secondaryButton: { width: '100%', borderWidth: 2, borderColor: colors.primary, borderRadius: 12, paddingVertical: 16, alignItems: "center", marginBottom: 24 },
  secondaryButtonText: { fontFamily: "Anton", fontSize: 16, color: colors.primary },
  logoutButton: { alignItems: "center" },
  logoutButtonText: { fontFamily: "Anton", color: "#999", fontSize: 14, textDecorationLine: "underline" },
});
