"use client";

import { LearningEvent, LearningStatus } from './topics';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { FirebaseError } from 'firebase/app';
import { getCurrentUser } from './auth-manager';

const PREFIX = 'learning:';

// cache per-user remote availability to avoid repeated permission errors
const remoteAvailableByUser = new Map<string, boolean>();

function keyFor(slug: string, name: number | string) {
  return `${PREFIX}${slug}:${name}`;
}

function readRaw(key: string): { status?: LearningStatus; history?: LearningEvent[] } | null {
  try {
    if (typeof window === 'undefined') return null;
    const v = window.localStorage.getItem(key);
    if (!v) return null;
    return JSON.parse(v);
  } catch (e) {
    console.error('learning-manager: read error', e);
    return null;
  }
}

function writeRaw(key: string, payload: { status?: LearningStatus; history?: LearningEvent[] }) {
  try {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(key, JSON.stringify(payload));
  } catch (e) {
    console.error('learning-manager: write error', e);
  }
}

export function getStatusFor(slug: string, name: number | string): LearningStatus {
  const raw = readRaw(keyFor(slug, name));
  if (!raw) return 'Chưa học';
  return raw.status ?? (raw.history && raw.history.length > 0 ? computeStatusFromHistory(raw.history) : 'Chưa học');
}

export function getHistoryFor(slug: string, name: number | string): LearningEvent[] {
  const raw = readRaw(keyFor(slug, name));
  return raw?.history ?? [];
}

function computeStatusFromHistory(history: LearningEvent[]): LearningStatus {
  if (!history || history.length === 0) return 'Chưa học';
  const sorted = [...history].sort((a, b) => b.time - a.time);
  const last = sorted[0];
  switch (last.action) {
    case 'mark_learned':
      return 'Đã thuộc';
    case 'skip':
      return 'Bỏ qua';
    case 'study':
    case 'review':
      return 'Đang học';
    default:
      return 'Chưa học';
  }
}

export function setStatusFor(
  slug: string,
  name: string | string,
  status: LearningStatus,
  note?: string,
  result?: 'correct' | 'incorrect'
) {
  const key = keyFor(slug, name);
  const raw = readRaw(key) || { history: [] };

  if (status === 'Chưa học') {
    // clear history
    writeRaw(key, {});
    return;
  }

  const action: LearningEvent['action'] =
    status === 'Đã thuộc' ? 'mark_learned' : status === 'Bỏ qua' ? 'skip' : 'study';

  const ev: LearningEvent = {
    time: Date.now(),
    action,
    note,
    result,
  };

  const history = raw.history ? [...raw.history, ev] : [ev];
  writeRaw(key, { status, history });
  // write to Firestore in background if user is signed in
  (async () => {
    try {
      const user = getCurrentUser();
      if (!user) return;
      // skip if we previously detected permission denied for this user
      if (remoteAvailableByUser.get(user.uid) === false) return;
      const docRef = doc(db, 'users', user.uid, 'learning', `${slug}:${name}`);
      // sanitize history events to remove undefined fields (Firestore rejects undefined)
      const cleanHistory = history.map((h) => {
        const out: any = { time: h.time, action: h.action };
        if (h.note !== undefined) out.note = h.note;
        if (h.result !== undefined) out.result = h.result;
        return out;
      });
      await setDoc(docRef, { status, history: cleanHistory }, { merge: true });
    } catch (e) {
      const code = (e as any)?.code ?? (e as FirebaseError)?.code;
      if (code === 'permission-denied') {
        const user = getCurrentUser();
        if (user) remoteAvailableByUser.set(user.uid, false);
        console.warn('learning-manager: Firestore permission denied. Remote sync disabled for this user. Check Firestore rules to allow users/{uid}/learning access.');
      }
      console.error('learning-manager: remote write failed', e);
    }
  })();
}

export function clearRecord(slug: string, name: number | string) {
  try {
    if (typeof window === 'undefined') return;
    window.localStorage.removeItem(keyFor(slug, name));
  } catch (e) {
    console.error('learning-manager: clear error', e);
  }
  // also clear remote record in background if signed in
  (async () => {
    try {
      const user = getCurrentUser();
      if (!user) return;
      if (remoteAvailableByUser.get(user.uid) === false) return;
      const docRef = doc(db, 'users', user.uid, 'learning', `${slug}:${name}`);
      await deleteDoc(docRef);
    } catch (e) {
      const code = (e as any)?.code ?? (e as FirebaseError)?.code;
      if (code === 'permission-denied') {
        const user = getCurrentUser();
        if (user) remoteAvailableByUser.set(user.uid, false);
        console.warn('learning-manager: Firestore permission denied. Remote clear disabled for this user.');
      }
      console.error('learning-manager: remote clear failed', e);
    }
  })();
}


export async function syncFromRemote(slug: string, name: number | string) {
  try {
    const user = getCurrentUser();
    if (!user) return null;
    if (remoteAvailableByUser.get(user.uid) === false) return null;
    const docRef = doc(db, 'users', user.uid, 'learning', `${slug}:${name}`);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;
    const data = snap.data() as { status?: LearningStatus; history?: LearningEvent[] };
    // persist locally for fast reads
    writeRaw(keyFor(slug, name), data);
    return data;
  } catch (e) {
    const code = (e as any)?.code ?? (e as FirebaseError)?.code;
    if (code === 'permission-denied') {
      const user = getCurrentUser();
      if (user) remoteAvailableByUser.set(user.uid, false);
      console.warn('learning-manager: Firestore permission denied. Remote sync disabled for this user.');
      return null;
    }
    console.error('learning-manager: syncFromRemote failed', e);
    return null;
  }
}

export async function writeRemoteClear(slug: string, name: number | string) {
  try {
    const user = getCurrentUser();
    if (!user) return;
    const docRef = doc(db, 'users', user.uid, 'learning', `${slug}:${name}`);
    await deleteDoc(docRef);
  } catch (e) {
    console.error('learning-manager: writeRemoteClear failed', e);
  }
}
