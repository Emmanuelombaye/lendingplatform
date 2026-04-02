import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { sendResponse } from '@/lib/server/response';
import { getPayloadFromRequest } from '@/lib/server/auth';

export async function GET(req: NextRequest) {
  try {
    const payload = getPayloadFromRequest(req);
    if (!payload) return sendResponse(401, false, 'Unauthorized');

    const { data: loan, error } = await db
      .from('loans')
      .select('id, principal_amount, status')
      .eq('user_id', payload.id)
      .eq('status', 'PENDING_DISBURSEMENT')
      .maybeSingle();

    if (error || !loan) return sendResponse(404, false, 'No pending withdrawal found');

    return sendResponse(200, true, 'Loan fetched', {
      id: loan.id,
      principalAmount: Number(loan.principal_amount),
      status: loan.status,
    });
  } catch {
    return sendResponse(500, false, 'Failed to fetch loan');
  }
}
