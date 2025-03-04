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

    // Get the contacts from Firestore
    const contactsSnapshot = await getFirestore()
      .collection('projects')
      .doc(id as string)
      .collection('contacts')
      .get();

    const contacts = contactsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Return the contacts
    return res.status(200).json(contacts);
  } catch (error: any) {
    console.error('Error fetching contacts:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch contacts',
      details: error.message 
    });
  }
}
