import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { sendResponse } from '@/lib/server/response';
import { getPayloadFromRequest } from '@/lib/server/auth';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const payload = getPayloadFromRequest(req);
    if (!payload) return sendResponse(401, false, 'Unauthorized');
    await db.from('notifications').update({ read: true }).eq('id', id).eq('user_id', payload.id);
    return sendResponse(200, true, 'Notification marked as read');
  } catch {
    return sendResponse(500, false, 'Failed to update notification');
  }
}
