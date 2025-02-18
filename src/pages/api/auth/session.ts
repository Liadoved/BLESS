import { NextApiRequest, NextApiResponse } from 'next';
import { auth } from '../../../lib/firebase';

// Helper function to ensure auth is initialized
const getAuth = () => {
  if (!auth) {
    throw new Error('Auth is not initialized');
  }
  return auth;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const idToken = req.headers.authorization?.split('Bearer ')[1];
  if (!idToken) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    // Verify the ID token
    const decodedToken = await getAuth().verifyIdToken(idToken);

    // Return the user information
    return res.status(200).json({
      user: {
        id: decodedToken.uid,
        email: decodedToken.email,
        name: decodedToken.name,
        picture: decodedToken.picture
      }
    });
  } catch (error: any) {
    console.error('Error verifying token:', error);
    return res.status(401).json({ error: 'Invalid token' });
  }
}
