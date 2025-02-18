import { NextApiRequest, NextApiResponse } from 'next';
import { getGoogleAuthUrl } from '../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const url = await getGoogleAuthUrl();
    res.status(200).json({ url });
  } catch (error) {
    console.error('Sign in error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
