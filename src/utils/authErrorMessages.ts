export const mapAuthErrorMessage = (error: unknown) => {
  const code =
    typeof error === 'object' && error && 'code' in error ? (error as { code?: string }).code : undefined;

  const messages: Record<string, string> = {
    'auth/email-already-in-use': 'Este correo ya está registrado.',
    'auth/invalid-email': 'El correo no es válido.',
    'auth/weak-password': 'La contraseña es demasiado débil.',
    'auth/wrong-password': 'La contraseña es incorrecta.',
    'auth/user-not-found': 'No encontramos una cuenta con este correo.',
    'auth/too-many-requests': 'Demasiados intentos. Inténtalo más tarde.',
    'auth/network-request-failed': 'Problema de conexión. Revisa tu internet.',
    'auth/missing-email': 'Ingresa un correo electrónico.',
  };

  if (code && messages[code]) {
    return messages[code];
  }

  return 'Hubo un problema. Inténtalo de nuevo.';
};
