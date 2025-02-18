import { NextApiRequest, NextApiResponse } from 'next';
import { handleGoogleCallback } from '../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Get the authorization code from the query parameters
  const { code, error } = req.query;

  // Handle any OAuth errors
  if (error) {
    console.error('OAuth error:', error);
    return res.redirect(`/error?message=${encodeURIComponent(String(error))}`);
  }

  // Validate the authorization code
  if (!code || typeof code !== 'string') {
    console.error('Invalid or missing code');
    return res.redirect('/error?message=Invalid authorization code');
  }

  try {
    // Process the callback
    await handleGoogleCallback(code, req, res);
    
    // Redirect to home page on success
    res.redirect('/');
  } catch (error) {
    console.error('Callback error:', error);
    
    // Get a more specific error message if possible
    const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
    
    // Redirect to error page with the message
    res.redirect(`/error?message=${encodeURIComponent(errorMessage)}`);
  }
}
