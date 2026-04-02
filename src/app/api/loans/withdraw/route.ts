import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { sendResponse } from '@/lib/server/response';
import { getPayloadFromRequest } from '@/lib/server/auth';

export async function POST(req: NextRequest) {
  try {
    const payload = getPayloadFromRequest(req);
    if (!payload) return sendResponse(401, false, 'Unauthorized');

    const { method, accountDetails } = await req.json();
    if (!method || !accountDetails) return sendResponse(400, false, 'Method and account details are required');

    await db.from('transactions').insert({
      user_id: payload.id,
      type: 'DISBURSEMENT',
      amount: 0,
      description: `Withdrawal request via ${method} to ${accountDetails}`,
      status: 'PENDING',
    });

    return sendResponse(200, true, 'Withdrawal request submitted. Funds will be disbursed within 1-2 hours.');
  } catch {
    return sendResponse(500, false, 'Failed to submit withdrawal');
  }
}
