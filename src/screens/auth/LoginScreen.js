import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator, 
  StyleSheet,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import AuthLayout from '../../components/auth/AuthLayout';
import { colors } from '../../theme/theme';
import { mapAuthErrorMessage } from '../../utils/authErrorMessages';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [info, setInfo] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError('');
    setInfo('');

    if (!email || !password) {
      setError('Por favor, introduce tu correo y contraseña.');
      return;
    }

    setLoading(true);
    try {
      const { user } = await signInWithEmailAndPassword(auth, email.trim(), password);

      if (!user.emailVerified) {
        router.replace('/(auth)/verify-email');
        return;
      }
    } catch (e) {
      setError(mapAuthErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ width: '100%' }}
      >
        <Text style={styles.title}>INICIAR SESIÓN</Text>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        {info ? <Text style={styles.infoText}>{info}</Text> : null}

        <View style={styles.inputGroup}>
          <Text style={styles.label}>EMAIL</Text>
          <TextInput
            placeholder="tu@email.com"
            placeholderTextColor="#999"
            autoCapitalize="none"
            keyboardType="email-address"
            style={styles.input}
            value={email}
            onChangeText={setEmail}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>CONTRASEÑA</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              placeholder="••••••••"
              placeholderTextColor="#999"
              secureTextEntry={!showPassword}
              style={[styles.input, { flex: 1, marginBottom: 0 }]}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity 
              onPress={() => setShowPassword((prev) => !prev)}
              style={styles.eyeIcon}
            >
              <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={20} color="#888" />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity onPress={() => router.push('/(auth)/forgot-password')} style={styles.forgotPassword}>
          <Text style={styles.forgotPasswordText}>
            ¿OLVIDASTE TU CONTRASEÑA?
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleLogin}
          disabled={loading}
          style={styles.button}
        >
          {loading ? <ActivityIndicator color="#000" /> : <Text style={styles.buttonText}>ENTRAR</Text>}
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>¿NO TIENES CUENTA?</Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
            <Text style={styles.linkText}>CREAR CUENTA</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  title: {
    fontFamily: 'Anton',
    fontSize: 36,
    color: '#000',
    marginBottom: 30,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontFamily: 'Anton',
    fontSize: 12,
    color: '#666',
    marginBottom: 6,
    marginLeft: 4,
  },
  input: {
    fontFamily: 'Anton',
    borderWidth: 2,
    borderColor: '#EEE',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 14,
    fontSize: 16,
    color: '#000',
    backgroundColor: '#FFF',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eyeIcon: {
    position: 'absolute',
    right: 15,
    height: '100%',
    justifyContent: 'center',
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 25,
  },
  forgotPasswordText: {
    fontFamily: 'Anton',
    color: colors.primary,
    fontSize: 13,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 15,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 25,
    elevation: 2,
  },
  buttonText: {
    fontFamily: 'Anton',
    fontSize: 20,
    color: '#000',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  footerText: {
    fontFamily: 'Anton',
    color: '#666',
    fontSize: 14,
  },
  linkText: {
    fontFamily: 'Anton',
    color: colors.primary,
    marginLeft: 8,
    fontSize: 14,
  },
  errorText: {
    fontFamily: 'Anton',
    color: '#FF4444',
    marginBottom: 15,
    textAlign: 'center',
  },
  infoText: {
    fontFamily: 'Anton',
    color: '#4CAF50',
    marginBottom: 15,
    textAlign: 'center',
  },
});
