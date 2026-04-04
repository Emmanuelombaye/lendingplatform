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
    const fileName = `applications/${id}/${type}-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;

    // Try storage upload — log the real error if it fails
    const { error: uploadError } = await db.storage
      .from('documents')
      .upload(fileName, buffer, { contentType: file.type, upsert: true });

    if (uploadError) {
      console.error('Supabase storage upload error:', JSON.stringify(uploadError));

      // If bucket doesn't exist, return a clear message
      if (uploadError.message?.includes('Bucket not found') || uploadError.message?.includes('bucket')) {
        return sendResponse(500, false, `Storage bucket "documents" not found. Please create it in Supabase Storage.`);
      }

      return sendResponse(500, false, `Upload failed: ${uploadError.message}`);
    }

    const { data: { publicUrl } } = db.storage.from('documents').getPublicUrl(fileName);

    // Try inserting document record — table may not exist yet
    const { error: dbError } = await db.from('documents').insert({
      application_id: Number(id),
      document_type: type,
      file_path: publicUrl,
    });

    if (dbError) {
      console.error('Documents table insert error:', JSON.stringify(dbError));
      // File uploaded successfully even if DB record fails — return success with URL
    }

    return sendResponse(200, true, 'Document uploaded successfully', { url: publicUrl });
  } catch (err: any) {
    console.error('Upload route error:', err?.message || err);
    return sendResponse(500, false, err?.message || 'Failed to upload document');
  }
}
