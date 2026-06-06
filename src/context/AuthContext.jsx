import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  signInWithPopup, 
  signInWithRedirect, 
  signInWithCredential, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  signOut 
} from 'firebase/auth';
import { Capacitor } from '@capacitor/core';
import { auth, googleProvider } from '../lib/firebase';
import { getMember, createMember } from '../services/membersService';

const AuthContext = createContext(null);

const BOOTSTRAP_ADMIN_EMAIL = "fundacionsocial@gimnasioemocionalmb.com";

// Helper to dynamically load the native google auth plugin safely at runtime
const getNativeGoogleAuth = async () => {
  try {
    return await import(/* @vite-ignore */ '@codetrix-studio/capacitor-google-auth');
  } catch (e) {
    try {
      return await import(/* @vite-ignore */ '@capacitor-community/google-auth');
    } catch (err) {
      throw new Error("Capacitor Google Auth plugin not found at runtime");
    }
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [memberProfile, setMemberProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);

  useEffect(() => {
    // Initialize native Google Auth if running inside Capacitor
    if (Capacitor.isNativePlatform()) {
      getNativeGoogleAuth().then(({ GoogleAuth }) => {
        GoogleAuth.initialize();
      }).catch(err => {
        console.warn("Capacitor Google Auth plugin not loaded/configured yet. Falling back to Firebase Web Auth.", err);
      });
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      if (firebaseUser) {
        setUser(firebaseUser);
        try {
          let profile = await getMember(firebaseUser.uid);
          
          // Auto-bootstrap admin account
          if (!profile && firebaseUser.email === BOOTSTRAP_ADMIN_EMAIL) {
            const adminData = {
              email: firebaseUser.email,
              displayName: firebaseUser.displayName || 'Admin GEMB',
              photoURL: firebaseUser.photoURL || '',
              role: 'admin',
              active: true
            };
            await createMember(firebaseUser.uid, adminData);
            profile = await getMember(firebaseUser.uid);
          } 
          // Auto-create active member account for new users
          // All new Google sign-ins are automatically active (active:true)
          // Unauthorized screen only shows if an admin manually sets active:false
          else if (!profile) {
            const memberData = {
              email: firebaseUser.email,
              displayName: firebaseUser.displayName || 'Miembro Nuevo',
              photoURL: firebaseUser.photoURL || '',
              role: 'member',
              active: true
            };
            await createMember(firebaseUser.uid, memberData);
            profile = await getMember(firebaseUser.uid);
          }

          setMemberProfile(profile);
          setUnauthorized(!profile || !profile.active);
        } catch (error) {
          console.error("Error fetching member profile:", error);
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
    setLoading(true);
    try {
      if (Capacitor.isNativePlatform()) {
        try {
          const { GoogleAuth } = await getNativeGoogleAuth();
          const nativeUser = await GoogleAuth.signIn();
          const credential = GoogleAuthProvider.credential(nativeUser.authentication.idToken);
          await signInWithCredential(auth, credential);
        } catch (err) {
          console.warn("Native Google Login plugin failed, trying standard popup/redirect fallback:", err);
          // Redirect is generally more stable on mobile browsers / hybrid apps
          await signInWithRedirect(auth, googleProvider);
        }
      } else {
        await signInWithPopup(auth, googleProvider);
      }
    } catch (error) {
      console.error("Login failed:", error);
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
        } catch (e) {
          console.warn("Error signing out from native Google Auth:", e);
        }
      }
      await signOut(auth);
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, memberProfile, loading, unauthorized, loginWithGoogle, logout }}>
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
