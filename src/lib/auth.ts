import { NextApiRequest, NextApiResponse } from 'next';
import { OAuth2Client } from 'google-auth-library';
import { serialize, parse } from 'cookie';
import jwt from 'jsonwebtoken';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret';
const REDIRECT_URI = process.env.NODE_ENV === 'production' 
  ? 'https://bless-eosin.vercel.app/api/auth/callback'
  : 'http://localhost:3002/api/auth/callback';

const client = new OAuth2Client({
  clientId: GOOGLE_CLIENT_ID,
  clientSecret: GOOGLE_CLIENT_SECRET,
  redirectUri: REDIRECT_URI
});

// הגדרת הרשאות Google
const SCOPES = [
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/drive.file'
];

export async function getGoogleAuthUrl() {
  return client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    include_granted_scopes: true,
    prompt: 'consent'
  });
}

export async function handleGoogleCallback(code: string, req: NextApiRequest, res: NextApiResponse) {
  try {
    const { tokens } = await client.getToken(code);
    client.setCredentials(tokens);

    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token!,
      audience: GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    if (!payload) throw new Error('No payload');

    const user = {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token
    };

    const session = jwt.sign(user, JWT_SECRET);

    res.setHeader('Set-Cookie', serialize('session', session, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
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
    return jwt.verify(cookie, JWT_SECRET);
  } catch {
    return null;
  }
}

export async function clearSession(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Set-Cookie', serialize('session', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
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
