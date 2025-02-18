import { NextApiRequest, NextApiResponse } from 'next';
import { addDoc, collection } from 'firebase/firestore';
import { auth, db } from '../../../lib/firebase';

// Helper function to ensure auth is initialized
const getAuth = () => {
  if (!auth) {
    throw new Error('Auth is not initialized');
  }
  return auth;
};

// Helper function to ensure db is initialized
const getDB = () => {
  if (!db) {
    throw new Error('Firestore is not initialized');
  }
  return db;
};

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
    const decodedToken = await getAuth().verifyIdToken(idToken);
    const userId = decodedToken.uid;
    console.log('Token verified for user:', userId);

    // Get the project data from the request body
    const projectData = req.body;
    console.log('Project data:', projectData);

    console.log('Creating project in Firestore...');
    // Add the project to Firestore
    const docRef = await addDoc(collection(getDB(), 'projects'), {
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
