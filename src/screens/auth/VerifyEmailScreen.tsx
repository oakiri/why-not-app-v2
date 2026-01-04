import React, { useMemo, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { sendEmailVerification, signOut } from "firebase/auth";
import { auth } from "../../lib/firebase";
import { colors } from "../../theme/theme";

export default function VerifyEmailScreen() {
  const [info, setInfo] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const user = auth.currentUser;

  const canResend = useMemo(() => !busy && cooldown <= 0, [busy, cooldown]);

  const tickCooldown = () => {
    let s = 15;
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
      // Forzar recarga del usuario para obtener el estado actualizado de emailVerified
      await user.reload();
      
      // Obtener la instancia actualizada después del reload
      const updatedUser = auth.currentUser;

      if (updatedUser?.emailVerified) {
        // Redirigir a la home principal
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
      <Text style={styles.title}>Verifica tu correo</Text>

      <Text style={styles.description}>
        Te hemos enviado un email de verificación a {user?.email}. Hasta que lo verifiques, la app queda bloqueada.
      </Text>

      {info ? <Text style={styles.infoText}>{info}</Text> : null}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <TouchableOpacity
        onPress={refresh}
        disabled={busy}
        style={styles.primaryButton}
      >
        {busy ? (
          <ActivityIndicator color="#000" />
        ) : (
          <Text style={styles.primaryButtonText}>Ya lo he verificado</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        onPress={resend}
        disabled={!canResend}
        style={[styles.secondaryButton, !canResend && { opacity: 0.6 }]}
      >
        <Text style={styles.secondaryButtonText}>
          {cooldown > 0 ? `Reenviar (${cooldown}s)` : "Reenviar email"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={logout} style={styles.logoutButton}>
        <Text style={styles.logoutButtonText}>Cerrar sesión</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    backgroundColor: "#FFF",
  },
  title: {
    fontFamily: "Anton",
    fontSize: 32,
    color: "#000",
    marginBottom: 16,
    textAlign: "center",
  },
  description: {
    fontFamily: "Anton",
    fontSize: 16,
    color: "#666",
    marginBottom: 24,
    textAlign: "center",
    lineHeight: 22,
  },
  infoText: {
    fontFamily: "Anton",
    color: "green",
    marginBottom: 12,
    textAlign: "center",
  },
  errorText: {
    fontFamily: "Anton",
    color: "red",
    marginBottom: 12,
    textAlign: "center",
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
    marginBottom: 24,
  },
  secondaryButtonText: {
    fontFamily: "Anton",
    fontSize: 16,
    color: colors.primary,
  },
  logoutButton: {
    alignItems: "center",
  },
  logoutButtonText: {
    fontFamily: "Anton",
    color: "#999",
    fontSize: 14,
    textDecorationLine: "underline",
  },
});
