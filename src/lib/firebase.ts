// src/lib/firebase.ts
'use client';

import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    projectId: "lexical-extractor-9jpyf",
    appId: "1:6527030964:web:ed86d93f03ad5a8dc0a9e1",
    storageBucket: "lexical-extractor-9jpyf.firebasestorage.app",
    apiKey: "AIzaSyC5Udy7tz47EqsY7OMJROshbj6745Rvz5A",
    authDomain: "lexical-extractor-9jpyf.firebaseapp.com",
    messagingSenderId: "6527030964"
};

// Initialize Firebase
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
