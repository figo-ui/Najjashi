import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import type { AuthMethod, UserProfile, SupportedLocale } from '../types';
import { createUserProfile } from './firestoreService';

// Configure Google Sign-In (call once at app start)
export function configureGoogleSignIn(webClientId: string) {
  GoogleSignin.configure({ webClientId });
}

// ─── Sign In Methods ───

export async function signInWithGoogle(): Promise<UserProfile | null> {
  try {
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    const { idToken } = await GoogleSignin.signIn();
    const credential = auth.GoogleAuthProvider.credential(idToken);
    const result = await auth().signInWithCredential(credential);
    return mapFirebaseUser(result.user, 'google');
  } catch (e) {
    console.warn('Google sign-in failed:', e);
    return null;
  }
}

export async function signInWithEmail(email: string, password: string): Promise<UserProfile | null> {
  try {
    const result = await auth().signInWithEmailAndPassword(email, password);
    return mapFirebaseUser(result.user, 'email');
  } catch (e: any) {
    // If user doesn't exist, create account
    if (e.code === 'auth/user-not-found' || e.code === 'auth/invalid-credential') {
      return signUpWithEmail(email, password);
    }
    console.warn('Email sign-in failed:', e);
    return null;
  }
}

export async function signUpWithEmail(email: string, password: string): Promise<UserProfile | null> {
  try {
    const result = await auth().createUserWithEmailAndPassword(email, password);
    return mapFirebaseUser(result.user, 'email');
  } catch (e) {
    console.warn('Email sign-up failed:', e);
    return null;
  }
}

export async function signInAsGuest(): Promise<UserProfile | null> {
  try {
    const result = await auth().signInAnonymously();
    return mapFirebaseUser(result.user, 'guest');
  } catch (e) {
    console.warn('Guest sign-in failed:', e);
    return null;
  }
}

export async function signOut(): Promise<void> {
  try {
    await auth().signOut();
    if (await GoogleSignin.isSignedIn()) {
      await GoogleSignin.signOut();
    }
  } catch (e) {
    console.warn('Sign out failed:', e);
  }
}

// ─── Auth State Listener ───

export function onAuthStateChanged(callback: (user: UserProfile | null) => void) {
  return auth().onAuthStateChanged(async (firebaseUser) => {
    if (firebaseUser) {
      const profile = mapFirebaseUser(firebaseUser, 'guest'); // method will be overridden by Firestore
      callback(profile);
    } else {
      callback(null);
    }
  });
}

// ─── Helpers ───

function mapFirebaseUser(fbUser: FirebaseAuthTypes.User, authMethod: AuthMethod): UserProfile {
  return {
    uid: fbUser.uid,
    email: fbUser.email || undefined,
    displayName: fbUser.displayName || undefined,
    photoURL: fbUser.photoURL || undefined,
    authMethod,
    locale: 'en' as SupportedLocale,
    createdAt: fbUser.metadata.creationTime ? new Date(fbUser.metadata.creationTime).getTime() : Date.now(),
    lastLoginAt: fbUser.metadata.lastSignInTime ? new Date(fbUser.metadata.lastSignInTime).getTime() : Date.now(),
  };
}
