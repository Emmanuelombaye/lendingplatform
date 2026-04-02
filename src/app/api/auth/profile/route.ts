import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { sendResponse } from '@/lib/server/response';
import { getPayloadFromRequest } from '@/lib/server/auth';

export async function GET(req: NextRequest) {
  try {
    const payload = getPayloadFromRequest(req);
    if (!payload) return sendResponse(401, false, 'Unauthorized');

    const { data: user, error } = await db
      .from('users')
      .select('id, full_name, email, phone, role, kyc_status, is_verified, created_at')
      .eq('id', payload.id)
      .single();

    if (error || !user) return sendResponse(404, false, 'User not found');

    return sendResponse(200, true, 'Profile retrieved', {
      id: user.id,
      fullName: user.full_name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      kycStatus: user.kyc_status,
      isVerified: user.is_verified,
      createdAt: user.created_at,
    });
  } catch {
    return sendResponse(500, false, 'Failed to get profile');
  }
}
