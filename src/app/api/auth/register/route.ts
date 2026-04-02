import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '@/lib/db';
import { sendResponse } from '@/lib/server/response';

export async function POST(req: NextRequest) {
  try {
    const { fullName, email, phone, password } = await req.json();
    if (!fullName || !email || !password) return sendResponse(400, false, 'Full name, email and password are required');

    // Check existing user
    const { data: existing } = await db
      .from('users')
      .select('id')
      .or(`email.eq.${email.toLowerCase().trim()}${phone ? `,phone.eq.${phone.trim()}` : ''}`)
      .maybeSingle();

    if (existing) return sendResponse(400, false, 'Account with this email or phone already exists');

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

    if (error || !user) return sendResponse(500, false, 'Failed to create account');

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.TOKEN_SECRET!,
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
  } catch {
    return sendResponse(500, false, 'Registration failed');
  }
}
