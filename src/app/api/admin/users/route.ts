import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { sendResponse } from '@/lib/server/response';
import { requireAdmin } from '@/lib/server/adminAuth';

export async function GET(req: NextRequest) {
  const { error } = requireAdmin(req);
  if (error) return error;

  try {
    const { data, error: dbErr } = await db
      .from('users')
      .select('id, full_name, email, phone, role, kyc_status, credit_score, created_at')
      .eq('role', 'USER')
      .order('created_at', { ascending: false });

    if (dbErr) return sendResponse(500, false, dbErr.message);

    return sendResponse(200, true, 'Users fetched', {
      users: (data || []).map((u: any) => ({
        id: u.id,
        fullName: u.full_name,
        email: u.email,
        phone: u.phone,
        kycStatus: u.kyc_status,
        creditScore: u.credit_score,
        createdAt: u.created_at,
      })),
    });
  } catch (err: any) {
    return sendResponse(500, false, err.message || 'Failed to fetch users');
  }
}
