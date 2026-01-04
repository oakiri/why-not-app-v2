import React, { useEffect, useMemo } from 'react';
import { Slot, router, useRootNavigationState, useSegments } from 'expo-router';
import { useAuth } from '../../context/AuthContext';

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

    // 2. No verificado
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
      // Si es admin y no está en una ruta permitida de admin, forzar selector
      if (!inBackoffice && !inTabs && route !== 'role-selector') {
        router.replace('/(auth)/role-selector');
      }
    } else {
      // Si es cliente y no está en tabs, forzar tabs
      if (!inTabs) {
        router.replace('/(tabs)/home');
      }
    }

  }, [isRouterReady, isReady, user, segments, profile, profileLoading]);

  // Mientras carga o redirige, mostramos un estado neutro para evitar parpadeos
  if (!isReady || profileLoading) return null;

  return children ? <>{children}</> : <Slot />;
}
