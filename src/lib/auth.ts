import { NextApiRequest, NextApiResponse } from 'next';
import { OAuth2Client } from 'google-auth-library';
import { serialize } from 'cookie';
import jwt from 'jsonwebtoken';

// Check if we're in production
const isProd = process.env.NODE_ENV === 'production';

// Configuration
const config = {
  clientId: process.env.GOOGLE_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  jwtSecret: process.env.JWT_SECRET || 'your-jwt-secret',
  redirectUri: isProd
    ? 'https://bless-eosin.vercel.app/api/auth/callback'
    : 'http://localhost:3002/api/auth/callback',
  scopes: [
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/drive.file'
  ]
};

// Initialize OAuth client
const client = new OAuth2Client({
  clientId: config.clientId,
  clientSecret: config.clientSecret,
  redirectUri: config.redirectUri
});

export async function getGoogleAuthUrl() {
  console.log('Redirect URI:', config.redirectUri);
  return client.generateAuthUrl({
    access_type: 'offline',
    scope: config.scopes,
    include_granted_scopes: true,
    prompt: 'consent',
    redirect_uri: config.redirectUri
  });
}

export async function handleGoogleCallback(code: string, req: NextApiRequest, res: NextApiResponse) {
  try {
    console.log('Callback received with code:', code);
    console.log('Using redirect URI:', config.redirectUri);
    
    // Exchange code for tokens
    const { tokens } = await client.getToken({
      code,
      redirect_uri: config.redirectUri
    });
    client.setCredentials(tokens);

    // Verify ID token
    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token!,
      audience: config.clientId
    });

    const payload = ticket.getPayload();
    if (!payload) throw new Error('No payload');

    // Create user object
    const user = {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token
    };

    // Create session
    const session = jwt.sign(user, config.jwtSecret);

    // Set cookie
    res.setHeader('Set-Cookie', serialize('session', session, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7 // 1 week
    }));

  } catch (error) {
    console.error('Auth error:', error);
    throw error;
  }
}

export async function getSession(req: NextApiRequest) {
  const cookie = req.cookies.session;
  if (!cookie) return null;

  try {
    return jwt.verify(cookie, config.jwtSecret);
  } catch {
    return null;
  }
}

export async function clearSession(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Set-Cookie', serialize('session', '', {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
    maxAge: 0
  }));
}

export async function refreshGoogleToken(refreshToken: string) {
  try {
    client.setCredentials({
      refresh_token: refreshToken
    });
    const { credentials } = await client.refreshAccessToken();
    return credentials.access_token;
  } catch (error) {
    console.error('Token refresh error:', error);
    throw error;
  }
}
