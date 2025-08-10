// src/domain/auth-manager.ts
'use client';

import { auth } from '@/lib/firebase';
import { 
    signInAnonymously as firebaseSignInAnonymously, 
    User,
    GoogleAuthProvider,
    signInWithPopup,
    signOut,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword
} from 'firebase/auth';

const googleProvider = new GoogleAuthProvider();

export async function signInWithGoogle(): Promise<User | null> {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        return result.user;
    } catch (error) {
        console.error("Google sign-in failed", error);
        throw error;
    }
}

export async function signInWithEmail(email: string, password: string):Promise<User | null> {
    try {
        const result = await signInWithEmailAndPassword(auth, email, password);
        return result.user;
    } catch(error) {
        console.error("Email sign-in failed", error);
        throw error;
    }
}

export async function createUserWithEmail(email: string, password: string):Promise<User | null> {
    try {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        return result.user;
    } catch(error) {
        console.error("Email account creation failed", error);
        throw error;
    }
}


export async function signInAnonymously(): Promise<User | null> {
  try {
    const userCredential = await firebaseSignInAnonymously(auth);
    return userCredential.user;
  } catch (error) {
    console.error("Anonymous sign-in failed", error);
    return null;
  }
}

export async function signOutUser(): Promise<void> {
    try {
        await signOut(auth);
    } catch(error) {
        console.error("Sign out failed", error);
        throw error;
    }
}

export function getCurrentUser(): User | null {
    return auth.currentUser;
}
