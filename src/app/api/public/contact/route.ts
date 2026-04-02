import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { sendResponse } from '@/lib/server/response';

export async function POST(req: NextRequest) {
  try {
    const { fullName, email, subject, message } = await req.json();
    if (!fullName || !email || !message) return sendResponse(400, false, 'Name, email and message are required');

    await db.from('messages').insert({
      full_name: fullName.trim(),
      email: email.toLowerCase().trim(),
      subject: subject?.trim() || null,
      message: message.trim(),
      read: false,
    });

    return sendResponse(201, true, "Message received. We'll be in touch soon.");
  } catch {
    return sendResponse(500, false, 'Failed to send message');
  }
}
