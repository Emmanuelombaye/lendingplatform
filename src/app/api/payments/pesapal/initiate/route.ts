import { NextRequest } from 'next/server';
import { sendResponse } from '@/lib/server/response';

// Superseded by /api/payments/pesapal/initiate/[id]
export async function POST(req: NextRequest) {
  return sendResponse(400, false, 'Please use /api/payments/pesapal/initiate/{applicationId}');
}
