import { NextApiRequest, NextApiResponse } from 'next';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
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
    if (projectData?.managerId !== userId) {
      return res.status(403).json({ error: 'Not authorized to access this project' });
    }

    // Get the stats from Firestore
    const stats = {
      totalContacts: 0,
      totalResponses: 0,
      lastUpdated: new Date().toISOString()
    };

    // Count contacts
    const contactsSnapshot = await getFirestore()
      .collection('projects')
      .doc(id as string)
      .collection('contacts')
      .count()
      .get();
    
    stats.totalContacts = contactsSnapshot.data().count;

    // Count responses
    const responsesSnapshot = await getFirestore()
      .collection('projects')
      .doc(id as string)
      .collection('responses')
      .count()
      .get();
    
    stats.totalResponses = responsesSnapshot.data().count;

    // Return the stats
    return res.status(200).json(stats);
  } catch (error: any) {
    console.error('Error fetching stats:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch stats',
      details: error.message 
    });
  }
}
