import { createContext, useContext, useEffect, useState } from 'react';
import { 
  signInWithPopup, 
  signInWithRedirect, 
  signInWithCredential, 
  getRedirectResult,
  GoogleAuthProvider, 
  onAuthStateChanged, 
  signOut 
} from 'firebase/auth';
import { Capacitor } from '@capacitor/core';
import { auth, googleProvider, firebaseConfigReady } from '../lib/firebase';
import { getMember, createMember, activateOwnMemberProfile } from '../services/membersService';
import {
  clearRedirectStart,
  rememberRedirectStart,
  shouldBlockIOSLogin,
  shouldFallbackToRedirect,
  shouldUseRedirectLogin
} from '../utils/platform';
import { getAuthErrorCode, getFriendlyAuthMessage } from '../utils/authErrors';

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

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [memberProfile, setMemberProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);
  const [configError] = useState(!firebaseConfigReady);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    if (!firebaseConfigReady || !auth || !googleProvider) {
      setLoading(false);
      return undefined;
    }

    let cancelled = false;

    // Initialize native Google Auth if running inside Capacitor
    if (Capacitor.isNativePlatform()) {
      getNativeGoogleAuth().then(({ GoogleAuth }) => {
        GoogleAuth.initialize();
      }).catch((error) => {
        console.warn('Capacitor Google Auth plugin not ready:', getAuthErrorCode(error));
      });
    }

    if (!Capacitor.isNativePlatform() && !shouldBlockIOSLogin()) {
      getRedirectResult(auth)
        .then(() => {
          clearRedirectStart();
        })
        .catch((error) => {
          clearRedirectStart();
          if (!cancelled) {
            setAuthError(getFriendlyAuthMessage(error));
          }
          console.warn('Firebase redirect result failed:', getAuthErrorCode(error));
        });
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      if (firebaseUser) {
        setAuthError(null);
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
          console.error('Error loading member profile:', getAuthErrorCode(error));
          setUnauthorized(true);
        }
      } else {
        setUser(null);
        setMemberProfile(null);
        setUnauthorized(false);
      }
      setLoading(false);
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  const loginWithGoogle = async () => {
    if (!firebaseConfigReady || !auth || !googleProvider) {
      throw new Error('firebase_config_unavailable');
    }

    if (!Capacitor.isNativePlatform() && shouldBlockIOSLogin()) {
      const error = new Error('ios_in_app_browser');
      error.code = 'auth/ios-in-app-browser';
      setAuthError(getFriendlyAuthMessage(error));
      throw error;
    }

    setAuthError(null);
    setLoading(true);
    try {
      if (Capacitor.isNativePlatform()) {
        try {
          const { GoogleAuth } = await getNativeGoogleAuth();
          const nativeUser = await GoogleAuth.signIn();
          const credential = GoogleAuthProvider.credential(nativeUser.authentication.idToken);
          await signInWithCredential(auth, credential);
        } catch (error) {
          console.warn('Native Google login fallback:', getAuthErrorCode(error));
          rememberRedirectStart();
          await signInWithRedirect(auth, googleProvider);
        }
      } else if (shouldUseRedirectLogin()) {
        rememberRedirectStart();
        await signInWithRedirect(auth, googleProvider);
      } else {
        try {
          await signInWithPopup(auth, googleProvider);
        } catch (error) {
          if (!shouldFallbackToRedirect(error)) {
            throw error;
          }

          console.warn('Google popup fallback to redirect:', getAuthErrorCode(error));
          rememberRedirectStart();
          await signInWithRedirect(auth, googleProvider);
        }
      }
    } catch (error) {
      const friendlyMessage = getFriendlyAuthMessage(error);
      setAuthError(friendlyMessage);
      console.error('Login failed:', getAuthErrorCode(error));
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
          console.warn('Native Google sign out failed:', getAuthErrorCode(error));
        }
      }
      await signOut(auth);
    } catch (error) {
      console.error('Logout failed:', getAuthErrorCode(error));
    } finally {
      setLoading(false);
    }
  };

  const clearAuthError = () => setAuthError(null);

  return (
    <AuthContext.Provider value={{
      user,
      memberProfile,
      loading,
      unauthorized,
      configError,
      authError,
      clearAuthError,
      loginWithGoogle,
      logout
    }}>
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
