import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';

export interface DecodedToken {
  id: number;
  role: string;
}

export const getPayloadFromRequest = (req: NextRequest): DecodedToken | null => {
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.split(' ')[1];
  try {
    return jwt.verify(token, process.env.TOKEN_SECRET || 'default_secret') as DecodedToken;
  } catch {
    return null;
  }
};
