import { NextApiRequest, NextApiResponse } from 'next';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET' && req.method !== 'POST') {
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

    if (req.method === 'GET') {
      // Get the videos from Firestore
      const videosSnapshot = await getFirestore()
        .collection('projects')
        .doc(id as string)
        .collection('videos')
        .get();

      const videos = videosSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Return the videos
      return res.status(200).json(videos);
    } else if (req.method === 'POST') {
      // Add a new video
      const videoData = req.body;
      const videoRef = await getFirestore()
        .collection('projects')
        .doc(id as string)
        .collection('videos')
        .add({
          ...videoData,
          uploadedBy: userId,
          uploadedAt: new Date().toISOString(),
          status: 'active'
        });

      // Return the new video data
      return res.status(200).json({
        id: videoRef.id,
        ...videoData,
        uploadedBy: userId,
        uploadedAt: new Date().toISOString(),
        status: 'active'
      });
    }
  } catch (error: any) {
    console.error('Error handling videos:', error);
    return res.status(500).json({ 
      error: 'Failed to handle videos request',
      details: error.message 
    });
  }
}
