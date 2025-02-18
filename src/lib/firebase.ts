import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: 'AIzaSyDNp2Y8lX5_YdOt-SasOa12V-zgZIOpuIs',
  authDomain: 'bless-c1e71.firebaseapp.com',
  projectId: 'bless-c1e71',
  storageBucket: 'bless-c1e71.firebasestorage.app',
  messagingSenderId: '208057533739',
  appId: '1:208057533739:web:32e5f5c4b1d016f1bcf16e',
  measurementId: 'G-XNLELFP6N5'
};

// Initialize Firebase only if we're in the browser and it hasn't been initialized yet
let app;
let auth;
let db;
let storage;

if (typeof window !== 'undefined') {
  app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
}

export { app, auth, db, storage };
