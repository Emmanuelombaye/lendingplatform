import { NextRequest } from 'next/server';
import { getPayloadFromRequest } from '@/lib/server/auth';
import { sendResponse } from '@/lib/server/response';

export function requireAdmin(req: NextRequest) {
  const payload = getPayloadFromRequest(req);
  if (!payload) return { error: sendResponse(401, false, 'Unauthorized'), payload: null };
  if (payload.role !== 'ADMIN') return { error: sendResponse(403, false, 'Forbidden: Admin access required'), payload: null };
  return { error: null, payload };
}
