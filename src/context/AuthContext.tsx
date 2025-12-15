import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { reload, onAuthStateChanged, type User } from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

export type PendingProfile = {
  nombre?: string;
  apellidos?: string;
  telefono?: string;
  direccion?: string;
  email?: string;
};

export const PENDING_PROFILE_KEY = 'pendingProfile';
export const getPendingProfileKey = (uid: string) => `${PENDING_PROFILE_KEY}:${uid}`;

export const clearPendingProfileForUid = async (uid?: string) => {
  const keys = [PENDING_PROFILE_KEY]; // Cleanup legacy global key to avoid leaking across accounts.
  if (uid) {
    keys.push(getPendingProfileKey(uid));
  }

  await AsyncStorage.multiRemove(keys);
};

type AuthContextValue = {
  user: User | null;
  initializing: boolean;
  refreshing: boolean;
  syncingProfile: boolean;
  refreshUser: () => Promise<User | null>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [syncingProfile, setSyncingProfile] = useState(false);

  useEffect(() => {
    // Remove legacy global pending profile key so data is always scoped by UID.
    AsyncStorage.removeItem(PENDING_PROFILE_KEY).catch(() => undefined);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setInitializing(false);
    });

    return unsubscribe;
  }, []);

  const refreshUser = async () => {
    if (!auth.currentUser) return null;
    setRefreshing(true);
    try {
      await reload(auth.currentUser);
      setUser(auth.currentUser);
      return auth.currentUser;
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const syncProfile = async () => {
      if (!user || !user.emailVerified) return;

      setSyncingProfile(true);
      try {
        const scopedKey = getPendingProfileKey(user.uid);
        // Scope pending profile to the authenticated UID to prevent leaking data between accounts.
        const pendingRaw = await AsyncStorage.getItem(scopedKey);
        const pending: PendingProfile | null = pendingRaw ? JSON.parse(pendingRaw) : null;
        const userRef = doc(db, 'users', user.uid);
        const existing = await getDoc(userRef);

        const profileData: Record<string, unknown> = {
          email: pending?.email ?? user.email ?? '',
          updatedAt: serverTimestamp(),
        };

        if (pending) {
          profileData.nombre = pending.nombre ?? '';
          profileData.apellidos = pending.apellidos ?? '';
          profileData.telefono = pending.telefono ?? '';
          profileData.direccion = pending.direccion ?? '';
        }

        if (!existing.exists()) {
          profileData.createdAt = serverTimestamp();
        }

        await setDoc(userRef, profileData, { merge: true });

        await clearPendingProfileForUid(user.uid);
      } catch (error) {
        console.warn('No se pudo sincronizar el perfil del usuario', error);
      } finally {
        setSyncingProfile(false);
      }
    };

    syncProfile();
  }, [user?.uid, user?.emailVerified, user?.email]);

  const value = useMemo(
    () => ({ user, initializing, refreshing, refreshUser, syncingProfile }),
    [user, initializing, refreshing, syncingProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};
