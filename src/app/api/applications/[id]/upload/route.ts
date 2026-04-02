import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { sendResponse } from '@/lib/server/response';
import { getPayloadFromRequest } from '@/lib/server/auth';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const payload = getPayloadFromRequest(req);
    if (!payload) return sendResponse(401, false, 'Unauthorized');

    const formData = await req.formData();
    const file = formData.get('document') as File;
    const type = formData.get('type') as string;

    if (!file) return sendResponse(400, false, 'No file provided');

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const fileName = `applications/${id}/${type}-${Date.now()}-${file.name}`;

    const { error: uploadError } = await db.storage
      .from('documents')
      .upload(fileName, buffer, { contentType: file.type, upsert: true });

    if (uploadError) return sendResponse(500, false, 'Failed to upload file');

    const { data: { publicUrl } } = db.storage.from('documents').getPublicUrl(fileName);

    await db.from('documents').insert({
      application_id: Number(id),
      document_type: type,
      file_path: publicUrl,
    });

    return sendResponse(200, true, 'Document uploaded successfully', { url: publicUrl });
  } catch {
    return sendResponse(500, false, 'Failed to upload document');
  }
}
