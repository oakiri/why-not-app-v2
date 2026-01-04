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
import { router } from 'expo-router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../src/lib/firebase';
import { colors } from '../../src/theme/theme';
import { mapAuthErrorMessage } from '../../src/utils/authErrorMessages';

export default function EmployeeLoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Introduce tus credenciales de empleado.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      // AuthGate se encargará de redirigir al backoffice si el rol es correcto
    } catch (e) {
      setError(mapAuthErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.content}>
        <Text style={styles.badge}>ACCESO EMPLEADOS</Text>
        <Text style={styles.title}>WHY NOT</Text>
        <Text style={styles.subtitle}>Hamburguesería</Text>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <TextInput
          placeholder="Email corporativo"
          placeholderTextColor="#999"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
        />

        <TextInput
          placeholder="Contraseña"
          placeholderTextColor="#999"
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={setPassword}
          style={styles.input}
        />

        <TouchableOpacity
          onPress={handleLogin}
          disabled={loading}
          style={styles.button}
        >
          {loading ? <ActivityIndicator color="#000" /> : <Text style={styles.buttonText}>Entrar al Panel</Text>}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.replace('/(auth)/login')}>
          <Text style={styles.linkText}>Volver al acceso clientes</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
  },
  content: {
    padding: 30,
    alignItems: 'center',
  },
  badge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 4,
    fontFamily: 'Anton',
    fontSize: 12,
    marginBottom: 10,
  },
  title: {
    fontFamily: 'Anton',
    fontSize: 48,
    color: colors.primary,
    lineHeight: 48,
  },
  subtitle: {
    fontFamily: 'Anton',
    fontSize: 24,
    color: '#FFF',
    marginBottom: 40,
  },
  input: {
    width: '100%',
    backgroundColor: '#222',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 15,
    marginBottom: 15,
    color: '#FFF',
    fontFamily: 'Anton',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  button: {
    width: '100%',
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  buttonText: {
    fontFamily: 'Anton',
    fontSize: 18,
    color: '#000',
  },
  linkText: {
    color: '#999',
    fontFamily: 'Anton',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  errorText: {
    color: '#FF4444',
    fontFamily: 'Anton',
    marginBottom: 15,
    textAlign: 'center',
  },
});
