import React, { useEffect, useMemo } from 'react';
import { Slot, router, useRootNavigationState, useSegments } from 'expo-router';
import { useAuth } from '../../context/AuthContext';

const AUTH_GROUP = '(auth)';
const TABS_GROUP = '(tabs)';
const BACKOFFICE_GROUP = '(backoffice)';

// Rutas públicas dentro de (auth)
const PUBLIC_AUTH_ROUTES = new Set(['login', 'register', 'forgot-password', 'verify-email', 'role-selector']);

export default function AuthGate({ children }: { children?: React.ReactNode }) {
  const { user, isReady, isVerified, profile, profileLoading } = useAuth();
  const segments = useSegments();
  const rootNavState = useRootNavigationState();

  const isRouterReady = useMemo(() => !!rootNavState?.key, [rootNavState?.key]);

  useEffect(() => {
    // Esperar a que el router, la auth y el perfil estén listos
    if (!isRouterReady || !isReady || profileLoading) return;

    const group = segments[0];          // '(auth)', '(tabs)', '(backoffice)' o undefined
    const route = segments[1] || '';    // login/register/...

    const inAuth = group === AUTH_GROUP;
    const inTabs = group === TABS_GROUP;
    const inBackoffice = group === BACKOFFICE_GROUP;

    // 1) No logado -> siempre a login (salvo si está ya en una pública)
    if (!user) {
      if (!inAuth || (inAuth && !PUBLIC_AUTH_ROUTES.has(route))) {
        router.replace('/(auth)/login');
      }
      return;
    }

    // 2) Logado pero NO verificado -> siempre a verify-email
    if (!user.emailVerified) {
      if (!(inAuth && route === 'verify-email')) {
        router.replace('/(auth)/verify-email');
      }
      return;
    }

    // 3) Logado + verificado -> Redirigir según ROL
    const userRole = profile?.role || 'cliente';

    if (userRole === 'empleado' || userRole === 'master' || userRole === 'admin') {
      // Personal autorizado -> Mostrar selector de roles si no está ya en backoffice o selector
      if (!inBackoffice && route !== 'role-selector') {
        router.replace('/(auth)/role-selector');
      }
    } else {
      // Clientes van a las Tabs normales
      if (!inTabs || inAuth) {
        router.replace('/(tabs)/home');
      }
    }

  }, [isRouterReady, isReady, user, isVerified, segments, profile, profileLoading]);

  // IMPORTANTE: renderizar siempre Slot para que Root Layout esté montado
  return children ? <>{children}</> : <Slot />;
}
