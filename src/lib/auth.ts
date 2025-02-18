import { NextApiRequest, NextApiResponse } from 'next';
import { OAuth2Client } from 'google-auth-library';
import { serialize, parse } from 'cookie';
import jwt from 'jsonwebtoken';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret';

const client = new OAuth2Client(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  'http://localhost:3002/api/auth/callback'
);

// הגדרת הרשאות Google
const SCOPES = [
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/drive.file'
];

export async function getGoogleAuthUrl() {
  const url = client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent'
  });
  return url;
}

export async function handleGoogleCallback(code: string, req: NextApiRequest, res: NextApiResponse) {
  const { tokens } = await client.getToken(code);
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
    maxAge: 60 * 60 * 24 * 7 // שבוע
  }));

  return user;
}

export async function getSession(req: NextApiRequest) {
  const cookies = parse(req.headers.cookie || '');
  const session = cookies.session;

  if (!session) return null;

  try {
    const user = jwt.verify(session, JWT_SECRET);
    return { user };
  } catch (error) {
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
    const { credentials } = await client.refreshToken(refreshToken);
    return credentials.access_token;
  } catch (error) {
    console.error('Failed to refresh token:', error);
    throw error;
  }
}
