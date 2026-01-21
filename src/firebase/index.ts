'use client';

import {
  initializeApp,
  getApps,
  getApp,
  type FirebaseApp,
} from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import {
  getFirestore,
  type Firestore,
  initializeFirestore,
} from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';

// Define the config using environment variables, as per user's guidance
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
};


// 🔒 Module-level singletons
let firebaseApp: FirebaseApp | null = null;
let auth: Auth | null = null;
let firestore: Firestore | null = null;
let storage: FirebaseStorage | null = null;

// IMPORTANT: DO NOT MODIFY CALL SIGNATURE
export function initializeFirebase() {
  // Simplified initialization logic
  if (!firebaseApp) {
    firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
  }

  return getSdks(firebaseApp);
}

function getSdks(app: FirebaseApp) {
  if (!auth) {
    auth = getAuth(app);
  }

  if (!firestore) {
    firestore = initializeFirestore(app, {
      ignoreUndefinedProperties: true,
    });
  }

  if (!storage) {
    storage = getStorage(app);
  }

  return {
    firebaseApp: app,
    auth,
    firestore,
    storage,
  };
}

// Re-export public APIs
export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';
