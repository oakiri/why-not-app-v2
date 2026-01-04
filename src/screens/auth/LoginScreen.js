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

      // Si no está verificado, lo mandamos a la pantalla de verificación
      if (!user.emailVerified) {
        router.replace('/(auth)/verify-email');
        return;
      }

      // AuthGate se encargará de la redirección final basada en el rol
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
        <Text style={styles.title}>Iniciar sesión</Text>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        {info ? <Text style={styles.infoText}>{info}</Text> : null}

        <TextInput
          placeholder="Correo electrónico"
          placeholderTextColor="#999"
          autoCapitalize="none"
          keyboardType="email-address"
          style={styles.input}
          value={email}
          onChangeText={setEmail}
        />

        <View style={styles.passwordContainer}>
          <TextInput
            placeholder="Contraseña"
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

        <TouchableOpacity onPress={() => router.push('/(auth)/forgot-password')} style={styles.forgotPassword}>
          <Text style={styles.forgotPasswordText}>
            ¿Olvidaste tu contraseña?
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleLogin}
          disabled={loading}
          style={styles.button}
        >
          {loading ? <ActivityIndicator color="#000" /> : <Text style={styles.buttonText}>Entrar</Text>}
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>¿No tienes cuenta?</Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
            <Text style={styles.linkText}>Crear cuenta</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          onPress={() => router.replace('/(auth)/employee-login')}
          style={styles.employeeLink}
        >
          <Text style={styles.employeeLinkText}>Acceso Empleados →</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  title: {
    fontFamily: 'Anton',
    fontSize: 32,
    color: '#000',
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    fontFamily: 'Anton',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 12,
    fontSize: 16,
    color: '#000',
    backgroundColor: '#FFF',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  eyeIcon: {
    position: 'absolute',
    right: 15,
    height: '100%',
    justifyContent: 'center',
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    fontFamily: 'Anton',
    color: colors.primary,
    fontSize: 14,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 24,
    elevation: 2,
  },
  buttonText: {
    fontFamily: 'Anton',
    fontSize: 18,
    color: '#000',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 32,
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
  employeeLink: {
    alignItems: 'center',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#EEE',
  },
  employeeLinkText: {
    fontFamily: 'Anton',
    color: '#999',
    fontSize: 12,
    textTransform: 'uppercase',
  },
  errorText: {
    fontFamily: 'Anton',
    color: 'red',
    marginBottom: 12,
    textAlign: 'center',
  },
  infoText: {
    fontFamily: 'Anton',
    color: 'green',
    marginBottom: 12,
    textAlign: 'center',
  },
});
