import { NextApiRequest, NextApiResponse } from 'next';
import { handleGoogleCallback } from '../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { code } = req.query;
    
    if (typeof code !== 'string') {
      return res.status(400).json({ message: 'Invalid code' });
    }

    await handleGoogleCallback(code, req, res);
    res.redirect('/');
  } catch (error) {
    console.error('Callback error:', error);
    res.redirect('/error?message=Authentication failed');
  }
}
