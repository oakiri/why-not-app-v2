import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged, User, signOut } from 'firebase/auth';
import { doc, getDoc, onSnapshot, setDoc } from 'firebase/firestore';

import { auth, db } from '../lib/firebase';

export type AddressProfile = {
  line1?: string;
  line2?: string;
  city?: string;
  province?: string;
  postalCode?: string;
};

export type UserProfile = {
  email?: string;
  name?: string;
  phone?: string;
  role?: string;
  points?: number;
  address?: AddressProfile;
  updatedAt?: unknown;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  isReady: boolean;
  isVerified: boolean;
  profile: UserProfile | null;
  profileLoading: boolean;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

const isOfflineError = (error: unknown) => {
  const message = String((error as { message?: string })?.message ?? error).toLowerCase();
  return message.includes('offline');
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setProfile(null);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const refreshProfile = async () => {
    if (!auth.currentUser?.uid) {
      setProfile(null);
      return;
    }
    const ref = doc(db, 'users', auth.currentUser.uid);
    setProfileLoading(true);
    try {
      const snap = await getDoc(ref);
      if (snap.exists()) setProfile(snap.data() as UserProfile);
      else setProfile(null);
    } catch (error) {
      if (!isOfflineError(error)) {
        setProfile(null);
      }
    } finally {
      setProfileLoading(false);
    }
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!auth.currentUser?.uid) return;
    const ref = doc(db, 'users', auth.currentUser.uid);
    await setDoc(ref, data, { merge: true });
    await refreshProfile();
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!user?.uid) {
      setProfile(null);
      setProfileLoading(false);
      return;
    }

    setProfileLoading(true);
    const ref = doc(db, 'users', user.uid);
    const unsubscribe = onSnapshot(
      ref,
      (snap) => {
        setProfile(snap.exists() ? (snap.data() as UserProfile) : null);
        setProfileLoading(false);
      },
      (error) => {
        if (!isOfflineError(error)) {
          setProfile(null);
        }
        setProfileLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user?.uid]);

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      loading,
      isReady: !loading,
      isVerified: !!user?.emailVerified,
      profile,
      profileLoading,
      logout,
      refreshProfile,
      updateProfile,
    }),
    [user, loading, profile, profileLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}
