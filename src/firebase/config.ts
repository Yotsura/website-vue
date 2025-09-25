import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import 'firebase/compat/auth';
import firebaseConfig from './keys';

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