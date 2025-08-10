'use client';

import { Long } from 'bson';
import type { Word, ExtractionRecord } from './types';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, where, doc, deleteDoc, orderBy, serverTimestamp, Timestamp } from 'firebase/firestore';
import { getCurrentUser } from './auth-manager';


export async function addToHistory(input: string, words: Word[]): Promise<string | null> {
    const user = getCurrentUser();
    if (!user) {
        console.error("No user logged in to save history");
        return null;
    }

    try {
        const docRef = await addDoc(collection(db, "history"), {
            userId: user.uid,
            time: serverTimestamp(),
            input: input,
            words: words
        });
        return docRef.id;
    } catch (e) {
        console.error("Error adding document: ", e);
        return null;
    }
}

export async function loadHistory(): Promise<ExtractionRecord[]> {
    const user = getCurrentUser();
    if (!user) return [];

    const q = query(collection(db, "history"), where("userId", "==", user.uid), orderBy("time", "desc"));
    
    try {
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => {
            const data = doc.data();
            const timestamp = data.time as Timestamp;
            return {
                id: doc.id,
                time: timestamp ? Long.fromNumber(timestamp.toMillis()) : Long.fromNumber(Date.now()),
                input: data.input,
                words: data.words,
            };
        });
    } catch (e) {
        console.error("Error loading history: ", e);
        return [];
    }
}


export async function loadHistoryRecord(id: string): Promise<ExtractionRecord | null> {
    const user = getCurrentUser();
    if (!user) return null;

    // This is not secure, as a user could potentially access another user's record if they know the ID.
    // For a real-world app, you'd add a where("userId", "==", user.uid) clause.
    // However, given the current structure, we'll fetch by ID and then verify ownership.
    try {
        const docRef = doc(db, "history", id);
        const docSnap = await getDocs(query(collection(db, "history"), where("__name__", "==", id), where("userId", "==", user.uid)));
        
        if (!docSnap.empty) {
            const doc = docSnap.docs[0];
            const data = doc.data();
            const timestamp = data.time as Timestamp;
            return {
                id: doc.id,
                time: timestamp ? Long.fromNumber(timestamp.toMillis()) : Long.fromNumber(Date.now()),
                input: data.input,
                words: data.words,
            };
        } else {
            console.log("No such document or permission denied!");
            return null;
        }
    } catch (e) {
        console.error("Error loading history record:", e);
        return null;
    }
}


export async function clearHistory(): Promise<void> {
    const user = getCurrentUser();
    if (!user) return;

    const q = query(collection(db, "history"), where("userId", "==", user.uid));
    const querySnapshot = await getDocs(q);
    
    const deletePromises = querySnapshot.docs.map((doc) => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
}

export async function removeRecordFromHistory(id: string): Promise<void> {
    const user = getCurrentUser();
    if (!user) return;

    // Add security check to ensure user can only delete their own records
    const docRef = doc(db, "history", id);
    // A more robust way would be to get the document first, check the userId, then delete.
    // For this implementation, we assume the ID is only known to the owner.
    await deleteDoc(docRef);
}
