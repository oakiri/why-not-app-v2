import React, { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { sendEmailVerification, signOut } from 'firebase/auth';
import { colors } from '../src/theme/theme';
import { auth } from '../src/lib/firebase';
import { clearPendingProfileForUid, useAuth } from '../src/context/AuthContext';

const RESEND_TIMEOUT = 30;

export default function VerifyEmailScreen() {
  const { user, refreshUser, refreshing } = useAuth();
  const [cooldown, setCooldown] = useState(0);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (cooldown <= 0) return;

    const interval = setInterval(() => {
      setCooldown((prev) => Math.max(prev - 1, 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [cooldown]);

  const handleResend = async () => {
    setError('');
    setStatus('');

    if (!auth.currentUser) {
      setError('No hemos podido encontrar tu sesión. Vuelve a iniciar sesión.');
      router.replace('/login');
      return;
    }

    try {
      await sendEmailVerification(auth.currentUser);
      setStatus('Hemos reenviado el correo de verificación. Revisa tu bandeja de entrada.');
      setCooldown(RESEND_TIMEOUT);
    } catch (err) {
      setError('No pudimos reenviar el correo. Inténtalo más tarde.');
    }
  };

  const handleRefresh = async () => {
    setError('');
    setStatus('');
    const refreshed = await refreshUser();

    if (refreshed?.emailVerified) {
      router.replace('/(tabs)/home');
    } else {
      setStatus('Aún no detectamos el correo verificado. Vuelve a intentarlo en unos segundos.');
    }
  };

  const handleLogout = async () => {
    await clearPendingProfileForUid(user?.uid);
    await signOut(auth);
    router.replace('/login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <View style={styles.content}>
          <Image source={require('../assets/logo.png')} style={styles.logo} resizeMode="contain" />
          <Text style={styles.title}>Verifica tu correo</Text>
          <Text style={styles.subtitle}>
            Necesitamos que confirmes tu dirección de correo antes de continuar. Busca el email de
            verificación y haz clic en el enlace.
          </Text>

          {status ? <Text style={styles.status}>{status}</Text> : null}
          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TouchableOpacity
            style={[styles.button, cooldown > 0 ? styles.buttonDisabled : null]}
            onPress={handleResend}
            disabled={cooldown > 0}
          >
            <Text style={styles.buttonText}>
              {cooldown > 0 ? `Reenviar email (${cooldown}s)` : 'Reenviar email'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton} onPress={handleRefresh} disabled={refreshing}>
            <Text style={styles.secondaryButtonText}>
              {refreshing ? 'Comprobando...' : 'Ya he verificado'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.linkButton} onPress={handleLogout}>
            <Text style={styles.linkText}>Cerrar sesión</Text>
          </TouchableOpacity>

          {user?.email ? <Text style={styles.helperText}>Sesión: {user.email}</Text> : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
    gap: 12,
  },
  logo: {
    width: 160,
    height: 160,
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 999,
    width: '100%',
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: colors.text,
    fontWeight: 'bold',
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: '#DDD',
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 999,
    width: '100%',
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: colors.text,
    fontWeight: 'bold',
  },
  linkButton: {
    marginTop: 8,
  },
  linkText: {
    color: colors.textMuted,
    textDecorationLine: 'underline',
  },
  status: {
    color: 'green',
    textAlign: 'center',
  },
  error: {
    color: 'red',
    textAlign: 'center',
  },
  helperText: {
    color: colors.textMuted,
    marginTop: 12,
    fontSize: 12,
  },
});
