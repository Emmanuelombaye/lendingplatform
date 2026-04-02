import { NextRequest } from 'next/server';
import { sendResponse } from '@/lib/server/response';
import { getPayloadFromRequest } from '@/lib/server/auth';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const payload = getPayloadFromRequest(req);
    if (!payload) return sendResponse(401, false, 'Unauthorized');

    // TODO: initiate PesaPal payment
    return sendResponse(503, false, 'Payment gateway not connected yet');
  } catch {
    return sendResponse(500, false, 'Failed to initiate PesaPal payment');
  }
}
