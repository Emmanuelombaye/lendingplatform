import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '@/lib/db';
import { sendResponse } from '@/lib/server/response';

export async function POST(req: NextRequest) {
  try {
    const { fullName, email, phone, password } = await req.json();
    if (!fullName || !email || !password) return sendResponse(400, false, 'Full name, email and password are required');

    if (password.length < 6) return sendResponse(400, false, 'Password must be at least 6 characters');

    // Check existing user
    const { data: existing } = await db
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase().trim())
      .maybeSingle();

    if (existing) return sendResponse(400, false, 'An account with this email already exists');

    // Check phone if provided
    if (phone?.trim()) {
      const { data: existingPhone } = await db
        .from('users')
        .select('id')
        .eq('phone', phone.trim())
        .maybeSingle();
      if (existingPhone) return sendResponse(400, false, 'An account with this phone already exists');
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const { data: user, error } = await db
      .from('users')
      .insert({
        full_name: fullName.trim(),
        email: email.toLowerCase().trim(),
        phone: phone?.trim() || null,
        password_hash: passwordHash,
        role: 'USER',
        is_verified: true,
        kyc_status: 'PENDING',
      })
      .select()
      .single();

    if (error || !user) {
      console.error('Register error:', error?.message);
      return sendResponse(500, false, 'Failed to create account. Please try again.');
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.TOKEN_SECRET || 'default_secret',
      { expiresIn: '24h' }
    );

    return sendResponse(201, true, 'Account created successfully', {
      id: user.id,
      fullName: user.full_name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      token,
    });
  } catch (err: any) {
    console.error('Registration error:', err);
    return sendResponse(500, false, 'Registration failed. Please try again.');
  }
}
