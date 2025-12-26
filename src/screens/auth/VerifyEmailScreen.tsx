import React, { useMemo, useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { sendEmailVerification, signOut } from "firebase/auth";
import { auth } from "../../lib/firebase";
import { colors, typography } from "../../theme/theme";

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
    if (!user) return;

    try {
      setBusy(true);
      await user.reload();

      if (auth.currentUser?.emailVerified) {
        router.replace("/(tabs)/home");
      } else {
        setInfo("Aún no verificado. Si acabas de verificar, espera unos segundos y pulsa de nuevo.");
      }
    } catch (e) {
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
    <View style={{ flex: 1, padding: 24, justifyContent: "center" }}>
      <Text style={[typography.title, { color: colors.text, marginBottom: 12 }]}>
        Verifica tu correo
      </Text>

      <Text style={[typography.body, { color: colors.textMuted, marginBottom: 12 }]}>
        Te hemos enviado un email de verificación. Hasta que lo verifiques, la app queda bloqueada.
      </Text>

      {info ? <Text style={{ color: "green", marginBottom: 8 }}>{info}</Text> : null}
      {error ? <Text style={{ color: "red", marginBottom: 8 }}>{error}</Text> : null}

      <TouchableOpacity
        onPress={refresh}
        disabled={busy}
        style={{
          backgroundColor: colors.primary,
          borderRadius: 999,
          paddingVertical: 14,
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <Text style={{ fontWeight: "bold" }}>{busy ? "Comprobando..." : "Ya lo he verificado"}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={resend}
        disabled={!canResend}
        style={{
          borderWidth: 2,
          borderColor: colors.primary,
          borderRadius: 999,
          paddingVertical: 14,
          alignItems: "center",
          marginBottom: 12,
          opacity: canResend ? 1 : 0.6,
        }}
      >
        <Text style={{ fontWeight: "bold", color: colors.primary }}>
          {cooldown > 0 ? `Reenviar (${cooldown}s)` : "Reenviar email"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={logout} style={{ alignItems: "center" }}>
        <Text style={{ color: colors.textMuted, fontWeight: "bold" }}>Cerrar sesión</Text>
      </TouchableOpacity>
    </View>
  );
}
