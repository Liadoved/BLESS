import { NextApiRequest, NextApiResponse } from 'next';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin if it hasn't been initialized yet
if (!getApps().length) {
  try {
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;
    if (!privateKey) {
      throw new Error('FIREBASE_PRIVATE_KEY is not set');
    }

    // Remove quotes and convert escaped newlines to actual newlines
    const formattedKey = privateKey
      .replace(/"/g, '')
      .replace(/\\n/g, '\n')
      .trim();

    console.log('Initializing Firebase Admin SDK...');
    initializeApp({
      credential: cert({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: formattedKey
      })
    });
    console.log('Firebase Admin SDK initialized successfully');
  } catch (error) {
    console.error('Error initializing Firebase Admin:', error);
    throw error;
  }
}

const adminAuth = getAuth();
const adminDb = getFirestore();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('Received request to create project');
  
  if (req.method !== 'POST') {
    console.log('Invalid method:', req.method);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Get the current user's ID token from the Authorization header
  const authHeader = req.headers.authorization;
  console.log('Auth header:', authHeader ? 'Present' : 'Missing');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const idToken = authHeader.split('Bearer ')[1];
  console.log('Got ID token');

  try {
    console.log('Verifying token...');
    // Verify the ID token
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const userId = decodedToken.uid;
    console.log('Token verified for user:', userId);

    // Get the project data from the request body
    const projectData = req.body;
    console.log('Project data:', projectData);

    console.log('Creating project in Firestore...');
    // Add the project to Firestore
    const docRef = await adminDb.collection('projects').add({
      ...projectData,
      managerId: userId,
      createdAt: new Date().toISOString(),
      status: 'active'
    });
    console.log('Project created with ID:', docRef.id);

    // Return the new project ID
    return res.status(200).json({ id: docRef.id });
  } catch (error: any) {
    console.error('Error creating project:', {
      name: error.name,
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    return res.status(500).json({ 
      error: 'Failed to create project',
      details: error.message 
    });
  }
}
