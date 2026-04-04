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
      .maybeSingle();

    if (error) {
      console.error('Profile DB error:', error.message);
      return sendResponse(500, false, 'Failed to get profile');
    }

    if (!user) return sendResponse(404, false, 'User not found');

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
  } catch (err: any) {
    console.error('Profile error:', err);
    return sendResponse(500, false, 'Failed to get profile');
  }
}
