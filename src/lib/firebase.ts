import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyDNp2Y8lX5_YdOt-SasOa12V-zgZIOpuIs',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'bless-c1e71.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'bless-c1e71',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'bless-c1e71.firebasestorage.app',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '208057533739',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:208057533739:web:32e5f5c4b1d016f1bcf16e',
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || 'G-XNLELFP6N5'
};

// Initialize Firebase
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;

// Check if we're in the browser
if (typeof window !== 'undefined') {
  try {
    if (!getApps().length) {
      console.log('Initializing Firebase app...');
      app = initializeApp(firebaseConfig);
    } else {
      console.log('Using existing Firebase app...');
      app = getApps()[0];
    }
    
    console.log('Getting Firebase auth...');
    auth = getAuth(app);
    console.log('Auth initialized:', !!auth);
    
    db = getFirestore(app);
    storage = getStorage(app);
    
    // Enable Firebase Auth emulator if in development
    if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === 'true') {
      console.log('Connecting to Firebase Auth emulator...');
      connectAuthEmulator(auth, 'http://localhost:9099');
    }
  } catch (error) {
    console.error('Error initializing Firebase:', error);
    // Create dummy objects to prevent crashes
    app = {} as FirebaseApp;
    auth = {} as Auth;
    db = {} as Firestore;
    storage = {} as FirebaseStorage;
  }
} else {
  // Server-side - create dummy objects to prevent errors
  console.log('Server-side Firebase initialization with dummy objects');
  app = {} as FirebaseApp;
  auth = {} as Auth;
  db = {} as Firestore;
  storage = {} as FirebaseStorage;
}

export { app, auth, db, storage };
