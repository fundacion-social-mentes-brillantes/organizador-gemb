import { createContext, useContext, useEffect, useState } from 'react';
import { 
  signInWithPopup, 
  signInWithRedirect, 
  signInWithCredential, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  signOut 
} from 'firebase/auth';
import { Capacitor } from '@capacitor/core';
import { auth, googleProvider, firebaseConfigReady } from '../lib/firebase';
import { getMember, createMember, activateOwnMemberProfile } from '../services/membersService';

const AuthContext = createContext(null);

const getNativeGoogleAuth = async () => {
  try {
    return await import(/* @vite-ignore */ '@codetrix-studio/capacitor-google-auth');
  } catch {
    try {
      return await import(/* @vite-ignore */ '@capacitor-community/google-auth');
    } catch (error) {
      throw new Error('Capacitor Google Auth plugin not found at runtime', { cause: error });
    }
  }
};

const getErrorCode = (error) => error?.code || error?.name || 'unknown_error';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [memberProfile, setMemberProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);
  const [configError] = useState(!firebaseConfigReady);

  useEffect(() => {
    if (!firebaseConfigReady || !auth || !googleProvider) {
      setLoading(false);
      return undefined;
    }

    // Initialize native Google Auth if running inside Capacitor
    if (Capacitor.isNativePlatform()) {
      getNativeGoogleAuth().then(({ GoogleAuth }) => {
        GoogleAuth.initialize();
      }).catch((error) => {
        console.warn('Capacitor Google Auth plugin not ready:', getErrorCode(error));
      });
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      if (firebaseUser) {
        setUser(firebaseUser);
        try {
          let profile = await getMember(firebaseUser.uid);

          if (!profile) {
            const memberData = {
              email: firebaseUser.email,
              displayName: firebaseUser.displayName || 'Miembro Nuevo',
              photoURL: firebaseUser.photoURL || '',
              role: 'member',
              active: true
            };
            await createMember(firebaseUser.uid, memberData);
            profile = await getMember(firebaseUser.uid);
          } else if (profile.active !== true) {
            await activateOwnMemberProfile(firebaseUser.uid, {
              displayName: firebaseUser.displayName || profile.displayName || 'Miembro',
              photoURL: firebaseUser.photoURL || profile.photoURL || ''
            });
            profile = await getMember(firebaseUser.uid);
          }

          const normalizedProfile = profile ? { ...profile, active: true } : null;
          setMemberProfile(normalizedProfile);
          setUnauthorized(!normalizedProfile);
        } catch (error) {
          console.error('Error loading member profile:', getErrorCode(error));
          setUnauthorized(true);
        }
      } else {
        setUser(null);
        setMemberProfile(null);
        setUnauthorized(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    if (!firebaseConfigReady || !auth || !googleProvider) {
      throw new Error('firebase_config_unavailable');
    }

    setLoading(true);
    try {
      if (Capacitor.isNativePlatform()) {
        try {
          const { GoogleAuth } = await getNativeGoogleAuth();
          const nativeUser = await GoogleAuth.signIn();
          const credential = GoogleAuthProvider.credential(nativeUser.authentication.idToken);
          await signInWithCredential(auth, credential);
        } catch (error) {
          console.warn('Native Google login fallback:', getErrorCode(error));
          await signInWithRedirect(auth, googleProvider);
        }
      } else {
        await signInWithPopup(auth, googleProvider);
      }
    } catch (error) {
      console.error('Login failed:', getErrorCode(error));
      setLoading(false);
      throw error;
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      if (Capacitor.isNativePlatform()) {
        try {
          const { GoogleAuth } = await getNativeGoogleAuth();
          await GoogleAuth.signOut();
        } catch (error) {
          console.warn('Native Google sign out failed:', getErrorCode(error));
        }
      }
      await signOut(auth);
    } catch (error) {
      console.error('Logout failed:', getErrorCode(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, memberProfile, loading, unauthorized, configError, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
