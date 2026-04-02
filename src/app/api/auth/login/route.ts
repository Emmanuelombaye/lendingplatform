import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '@/lib/db';
import { sendResponse } from '@/lib/server/response';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) return sendResponse(400, false, 'Email and password are required');

    const { data: user, error } = await db
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase().trim())
      .single();

    if (error) {
      console.error('Login DB error:', error.message);
      // Table doesn't exist or DB not connected
      if (error.code === '42P01' || error.message?.includes('relation') || error.message?.includes('does not exist')) {
        return sendResponse(503, false, 'Database tables not set up yet. Please run the SQL setup script.');
      }
      return sendResponse(401, false, 'Invalid email or password');
    }

    if (!user || !user.password_hash) {
      return sendResponse(401, false, 'Invalid email or password');
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return sendResponse(401, false, 'Invalid email or password');

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.TOKEN_SECRET || 'default_secret',
      { expiresIn: '24h' }
    );

    return sendResponse(200, true, 'Login successful', {
      id: user.id,
      fullName: user.full_name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      kycStatus: user.kyc_status,
      isVerified: user.is_verified,
      token,
    });
  } catch (err: any) {
    console.error('Login error:', err);
    return sendResponse(500, false, 'Login failed. Please try again.');
  }
}
