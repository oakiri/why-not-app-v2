import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

import { auth, db } from '../lib/firebase';

export type PendingProfile = {
  name?: string;
  phone?: string;
  role?: string;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  isReady: boolean;
  isVerified: boolean;
  profile: PendingProfile | null;
  refreshProfile: () => Promise<void>;
  upsertProfile: (data: PendingProfile) => Promise<void>;
  clearPendingProfile: () => Promise<void>;
  pendingKeyForUid: (uid: string) => string;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const pendingKeyForUid = (uid: string) => `PENDING_PROFILE_${uid}`;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<PendingProfile | null>(null);

  const refreshProfile = async () => {
    if (!auth.currentUser?.uid) {
      setProfile(null);
      return;
    }
    const ref = doc(db, 'users', auth.currentUser.uid);
    const snap = await getDoc(ref);
    if (snap.exists()) setProfile(snap.data() as PendingProfile);
    else setProfile(null);
  };

  const upsertProfile = async (data: PendingProfile) => {
    if (!auth.currentUser?.uid) return;
    const ref = doc(db, 'users', auth.currentUser.uid);
    await setDoc(ref, data, { merge: true });
    await refreshProfile();
  };

  const clearPendingProfile = async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    await AsyncStorage.removeItem(pendingKeyForUid(uid));
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      setLoading(false);

      // Carga perfil Firestore si existe
      if (u?.uid) {
        try {
          const ref = doc(db, 'users', u.uid);
          const snap = await getDoc(ref);
          if (snap.exists()) setProfile(snap.data() as PendingProfile);
          else setProfile(null);
        } catch {
          setProfile(null);
        }
      } else {
        setProfile(null);
      }
    });
    return () => unsub();
  }, []);

  const value = useMemo<AuthContextType>(() => {
    const isReady = !loading;
    const isVerified = !!user?.emailVerified;
    return {
      user,
      loading,
      isReady,
      isVerified,
      profile,
      refreshProfile,
      upsertProfile,
      clearPendingProfile,
      pendingKeyForUid,
    };
  }, [user, loading, profile]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * ✅ Hook CANÓNICO (named export)
 */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}

/**
 * ✅ Para compatibilidad si algo tuyo aún importa default:
 * (puedes borrarlo más adelante si ya no lo usa nadie)
 */
export default function useAuthContext() {
  return useAuth();
}
