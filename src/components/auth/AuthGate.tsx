import React, { useEffect, useMemo } from 'react';
import { Slot, router, useRootNavigationState, useSegments } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../theme/theme';

const AUTH_GROUP = '(auth)';
const TABS_GROUP = '(tabs)';
const BACKOFFICE_GROUP = '(backoffice)';

const PUBLIC_AUTH_ROUTES = new Set(['login', 'register', 'forgot-password', 'verify-email', 'role-selector']);

export default function AuthGate({ children }: { children?: React.ReactNode }) {
  const { user, isReady, profile, profileLoading } = useAuth();
  const segments = useSegments();
  const rootNavState = useRootNavigationState();

  const isRouterReady = useMemo(() => !!rootNavState?.key, [rootNavState?.key]);

  useEffect(() => {
    if (!isRouterReady || !isReady || profileLoading) return;

    const group = segments[0];
    const route = segments[1] || '';

    const inAuth = group === AUTH_GROUP;
    const inTabs = group === TABS_GROUP;
    const inBackoffice = group === BACKOFFICE_GROUP;

    // 1. No logado
    if (!user) {
      if (!inAuth || (inAuth && !PUBLIC_AUTH_ROUTES.has(route))) {
        router.replace('/(auth)/login');
      }
      return;
    }

    // 2. No verificado (Opcional: puedes comentar esto si no quieres forzar verificación ahora)
    if (!user.emailVerified) {
      if (!(inAuth && route === 'verify-email')) {
        router.replace('/(auth)/verify-email');
      }
      return;
    }

    // 3. Lógica de Roles
    const userRole = profile?.role || 'cliente';
    const isAdmin = ['empleado', 'master', 'admin'].includes(userRole);

    if (isAdmin) {
      // Si es admin y está en el login, mandarlo al selector
      if (inAuth && (route === 'login' || route === 'register')) {
        router.replace('/(auth)/role-selector');
      }
      // Si intenta entrar a tabs sin pasar por selector (opcional, depende de UX deseada)
      // if (inTabs && !segments.includes('from-selector')) { ... }
    } else {
      // Si es cliente e intenta entrar a backoffice o está en auth
      if (inBackoffice || inAuth) {
        router.replace('/(tabs)/home');
      }
    }

  }, [isRouterReady, isReady, user, segments, profile, profileLoading]);

  if (!isReady || profileLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return children ? <>{children}</> : <Slot />;
}
