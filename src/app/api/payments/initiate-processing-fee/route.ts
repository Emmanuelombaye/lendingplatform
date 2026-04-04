import { NextRequest } from 'next/server';
import { sendResponse } from '@/lib/server/response';

// This route is superseded by /api/payments/initiate-processing-fee/[id]
export async function POST(req: NextRequest) {
  return sendResponse(400, false, 'Please use /api/payments/initiate-processing-fee/{applicationId}');
}
