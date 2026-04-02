import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { sendResponse } from '@/lib/server/response';
import { getPayloadFromRequest } from '@/lib/server/auth';

export async function GET(req: NextRequest) {
  try {
    const payload = getPayloadFromRequest(req);
    if (!payload) return sendResponse(401, false, 'Unauthorized');

    const { data, error } = await db
      .from('notifications')
      .select('*')
      .eq('user_id', payload.id)
      .order('created_at', { ascending: false })
      .limit(30);

    if (error) return sendResponse(500, false, 'Failed to fetch notifications');

    return sendResponse(200, true, 'Notifications fetched', (data || []).map((n: any) => ({
      id: n.id,
      type: n.type?.toLowerCase(),
      title: n.title,
      message: n.message,
      read: n.read,
      actionUrl: n.action_url,
      time: n.created_at,
    })));
  } catch {
    return sendResponse(500, false, 'Failed to fetch notifications');
  }
}
