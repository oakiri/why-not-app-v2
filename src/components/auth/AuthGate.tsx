import React, { useEffect, useMemo } from 'react';
import { Slot, router, useRootNavigationState, useSegments } from 'expo-router';
import { useAuth } from '../../context/AuthContext';

const AUTH_GROUP = '(auth)';
const TABS_GROUP = '(tabs)';

// Rutas públicas dentro de (auth)
const PUBLIC_AUTH_ROUTES = new Set(['login', 'register', 'forgot-password', 'verify-email']);

export default function AuthGate({ children }: { children?: React.ReactNode }) {
  const { user, isReady, isVerified } = useAuth();
  const segments = useSegments();
  const rootNavState = useRootNavigationState();

  const isRouterReady = useMemo(() => !!rootNavState?.key, [rootNavState?.key]);

  useEffect(() => {
    if (!isRouterReady || !isReady) return;

    const group = segments[0];          // '(auth)' o '(tabs)' o undefined
    const route = segments[1] || '';    // login/register/...

    const inAuth = group === AUTH_GROUP;
    const inTabs = group === TABS_GROUP;

    // 1) No logado -> siempre a login (salvo si está ya en una pública)
    if (!user) {
      if (!inAuth || (inAuth && !PUBLIC_AUTH_ROUTES.has(route))) {
        router.replace('/(auth)/login');
      }
      return;
    }

    // 2) Logado pero NO verificado -> siempre a verify-email
    if (!isVerified) {
      if (!(inAuth && route === 'verify-email')) {
        router.replace('/(auth)/verify-email');
      }
      return;
    }

    // 3) Logado + verificado -> siempre a tabs (si está en auth, lo sacamos)
    if (inAuth) {
      router.replace('/(tabs)/home');
      return;
    }

    // 4) Si no está en tabs, lo llevamos a tabs/home
    if (!inTabs) {
      router.replace('/(tabs)/home');
    }
  }, [isRouterReady, isReady, user, isVerified, segments]);

  // IMPORTANTE: renderizar siempre Slot para que Root Layout esté montado
  return children ? <>{children}</> : <Slot />;
}
