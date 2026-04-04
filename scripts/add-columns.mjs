import { NextRequest } from 'next/server';
import { sendResponse } from '@/lib/server/response';
import { supabaseAdmin } from '@/lib/supabase';

// GET /api/admin/migrate — run once to add pesapal columns
export async function GET(req: NextRequest) {
  try {
    // Use raw postgres via supabase rpc if available, otherwise just test
    const results: string[] = [];

    // Try adding columns one at a time via a workaround:
    // Insert a dummy row with the new columns — Supabase will error if they don't exist
    // Instead, we use the pg extension via a stored procedure approach

    // Best approach: use supabase's built-in sql via the client
    // This requires the pg_net or similar — instead we'll use a raw fetch to the DB
    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    const queries = [
      `ALTER TABLE applications ADD COLUMN IF NOT EXISTS pesapal_tracking_id TEXT`,
      `ALTER TABLE applications ADD COLUMN IF NOT EXISTS pesapal_merchant_ref TEXT`,
    ];

    for (const query of queries) {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SERVICE_KEY,
          'Authorization': `Bearer ${SERVICE_KEY}`,
          'Prefer': 'return=minimal',
        },
      });
      results.push(`${query}: attempted`);
    }

    return sendResponse(200, true, 'Migration attempted', { results });
  } catch (err: any) {
    return sendResponse(500, false, err.message);
  }
}
