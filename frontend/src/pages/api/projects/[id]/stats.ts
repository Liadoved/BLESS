import { NextApiRequest, NextApiResponse } from 'next';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { getFirebaseAdminApp } from '../../../../lib/firebase-admin';

// Initialize Firebase Admin SDK
try {
  getFirebaseAdminApp();
} catch (error) {
  console.error('Error initializing Firebase Admin:', error);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle OPTIONS method for CORS preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;
  
  // Get the current user's ID token from the Authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const idToken = authHeader.split('Bearer ')[1];

  try {
    // Verify the ID token
    const decodedToken = await getAuth().verifyIdToken(idToken);
    const userId = decodedToken.uid;

    // First check if the user has access to this project
    const projectDoc = await getFirestore()
      .collection('projects')
      .doc(id as string)
      .get();

    if (!projectDoc.exists) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const projectData = projectDoc.data();
    if (projectData?.createdBy !== userId) {
      return res.status(403).json({ error: 'Not authorized to access this project' });
    }

    // Get the stats from Firestore
    const stats = {
      totalContacts: 0,
      totalResponses: 0,
      lastUpdated: new Date().toISOString()
    };

    // Count the contacts
    const contactsSnapshot = await getFirestore()
      .collection('projects')
      .doc(id as string)
      .collection('contacts')
      .get();

    stats.totalContacts = contactsSnapshot.size;

    // Count the responses (if any)
    // This is a placeholder - you would implement your own logic here
    stats.totalResponses = Math.floor(stats.totalContacts * 0.7); // 70% response rate for demo

    return res.status(200).json(stats);
  } catch (error: any) {
    console.error('Error fetching stats:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch stats',
      details: error?.message 
    });
  }
}
