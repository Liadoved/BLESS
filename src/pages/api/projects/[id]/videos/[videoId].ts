import { NextApiRequest, NextApiResponse } from 'next';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id, videoId } = req.query;
  
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

    // Delete the video
    await getFirestore()
      .collection('projects')
      .doc(id as string)
      .collection('videos')
      .doc(videoId as string)
      .delete();

    return res.status(200).json({ success: true });
  } catch (error: any) {
    console.error('Error deleting video:', error);
    return res.status(500).json({ 
      error: 'Failed to delete video',
      details: error.message 
    });
  }
}
