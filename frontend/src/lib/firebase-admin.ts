import { initializeApp, getApps, cert, getApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { getStorage } from 'firebase-admin/storage';

export function getFirebaseAdminApp() {
  // Check if app is already initialized
  if (getApps().length > 0) {
    return getApp();
  }

  // Check for required environment variables
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKeyRaw = process.env.FIREBASE_PRIVATE_KEY;
  const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;

  // Log environment variable status (without exposing sensitive data)
  console.log('Firebase Admin initialization status:', {
    projectId: projectId ? 'defined' : 'undefined',
    clientEmail: clientEmail ? 'defined' : 'undefined',
    privateKey: privateKeyRaw ? 'defined' : 'undefined',
    storageBucket: storageBucket ? 'defined' : 'undefined'
  });

  // Validate required environment variables
  if (!projectId || !clientEmail || !privateKeyRaw) {
    throw new Error(
      'Missing Firebase Admin SDK credentials. Make sure NEXT_PUBLIC_FIREBASE_PROJECT_ID, ' +
      'FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY environment variables are set.'
    );
  }

  // Process the private key - handle both formats
  const privateKey = privateKeyRaw.includes('\\n') 
    ? privateKeyRaw.replace(/\\n/g, '\n') 
    : privateKeyRaw;

  try {
    // Initialize the app with credentials
    const app = initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey
      }),
      storageBucket
    });

    console.log('Firebase Admin SDK initialized successfully');
    return app;
  } catch (error: any) {
    console.error('Error initializing Firebase Admin SDK:', error?.message || error);
    throw error;
  }
}

// Initialize Firebase Admin services
let db, auth, storage;

try {
  const app = getFirebaseAdminApp();
  db = getFirestore(app);
  auth = getAuth(app);
  storage = getStorage(app).bucket();
  console.log('Firebase Admin services initialized successfully');
} catch (error) {
  console.error('Failed to initialize Firebase Admin services:', error);
  // Create dummy objects to prevent undefined errors
  db = {};
  auth = {};
  storage = {};
}

export { db, auth, storage };
