import { NextApiRequest, NextApiResponse } from 'next';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin if it hasn't been initialized yet
if (!getApps().length) {
  try {
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    
    console.log('Firebase Admin initialization params:', {
      projectId: projectId || 'Missing',
      clientEmail: clientEmail ? 'Present' : 'Missing',
      privateKey: privateKey ? 'Present (length: ' + privateKey.length + ')' : 'Missing'
    });
    
    if (!privateKey) {
      throw new Error('FIREBASE_PRIVATE_KEY is not set');
    }
    
    if (!clientEmail) {
      throw new Error('FIREBASE_CLIENT_EMAIL is not set');
    }
    
    if (!projectId) {
      throw new Error('NEXT_PUBLIC_FIREBASE_PROJECT_ID is not set');
    }

    // Remove quotes and convert escaped newlines to actual newlines
    const formattedKey = privateKey
      .replace(/"/g, '')
      .replace(/\\n/g, '\n')
      .trim();

    console.log('Initializing Firebase Admin SDK...');
    initializeApp({
      credential: cert({
        projectId: projectId,
        clientEmail: clientEmail,
        privateKey: formattedKey
      })
    });
    console.log('Firebase Admin SDK initialized successfully');
  } catch (error: any) {
    console.error('Error initializing Firebase Admin:', error?.message || error);
    // Don't throw the error, just log it and continue
    // This allows the API to still respond with an error message instead of crashing
  }
}

const adminAuth = getAuth();
const adminDb = getFirestore();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('Received request to create project, method:', req.method);
  
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle OPTIONS method for CORS preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    console.log('Invalid method:', req.method);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get the current user's ID token from the Authorization header
    const authHeader = req.headers.authorization;
    console.log('Auth header:', authHeader ? 'Present' : 'Missing');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const idToken = authHeader.split('Bearer ')[1];
    
    try {
      // Verify the ID token
      console.log('Verifying ID token...');
      const decodedToken = await adminAuth.verifyIdToken(idToken);
      console.log('ID token verified for user:', decodedToken.uid);
      
      const { celebrantName, celebrantGender, eventType, deadline, managerName } = req.body;
      
      // Validate the required fields
      if (!celebrantName || !celebrantGender || !eventType) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      
      // Create the project in Firestore
      console.log('Creating project in Firestore...');
      const projectRef = adminDb.collection('projects').doc();
      const projectData = {
        celebrantName,
        celebrantGender,
        eventType,
        deadline: deadline || null,
        managerName: managerName || null,
        createdBy: decodedToken.uid,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      await projectRef.set(projectData);
      console.log('Project created with ID:', projectRef.id);
      
      // Return the project data with the ID
      return res.status(201).json({
        id: projectRef.id,
        ...projectData
      });
    } catch (error: any) {
      console.error('Error verifying ID token:', error?.message || error);
      return res.status(401).json({ error: 'Invalid token', details: error?.message });
    }
  } catch (error: any) {
    console.error('Unexpected error in project creation:', error?.message || error);
    return res.status(500).json({ error: 'Internal server error', details: error?.message });
  }
}
