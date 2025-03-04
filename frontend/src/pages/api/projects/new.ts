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
    
    if (!privateKey || !clientEmail || !projectId) {
      console.error('Missing Firebase Admin credentials');
    } else {
      // Remove quotes and convert escaped newlines to actual newlines
      const formattedKey = privateKey
        .replace(/"/g, '')
        .replace(/\\n/g, '\n')
        .trim();

      initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey: formattedKey
        })
      });
      console.log('Firebase Admin SDK initialized successfully');
    }
  } catch (error: any) {
    console.error('Error initializing Firebase Admin:', error?.message || error);
  }
}

const adminAuth = getAuth();
const adminDb = getFirestore();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle OPTIONS method for CORS preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get the current user's ID token from the Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const idToken = authHeader.split('Bearer ')[1];
    
    try {
      // Verify the ID token
      const decodedToken = await adminAuth.verifyIdToken(idToken);
      
      const { celebrantName, celebrantGender, eventType, deadline, managerName } = req.body;
      
      // Validate the required fields
      if (!celebrantName || !celebrantGender || !eventType) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      
      // Create the project in Firestore
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
      
      // Return the project data with the ID
      return res.status(201).json({
        id: projectRef.id,
        ...projectData
      });
    } catch (error: any) {
      return res.status(401).json({ error: 'Invalid token', details: error?.message });
    }
  } catch (error: any) {
    return res.status(500).json({ error: 'Internal server error', details: error?.message });
  }
}
