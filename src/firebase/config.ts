import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import 'firebase/compat/auth';

// Firebase config は Vite の環境変数から読み込み（CI/Pages でも動く）
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const projectFirestore  = firebase.firestore();
const projectAuth = firebase.auth();
const projectGoogleAuth = new firebase.auth.GoogleAuthProvider()
const authPersistence = firebase.auth.Auth.Persistence;

export {
  projectFirestore,
  projectAuth,
  authPersistence,
  projectGoogleAuth
}