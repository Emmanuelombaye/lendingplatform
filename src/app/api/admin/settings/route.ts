import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { sendResponse } from '@/lib/server/response';
import { requireAdmin } from '@/lib/server/adminAuth';

export async function GET(req: NextRequest) {
  const { error } = requireAdmin(req);
  if (error) return error;

  try {
    const { data, error: dbErr } = await db.from('settings').select('*').limit(1).maybeSingle();
    if (dbErr) return sendResponse(500, false, dbErr.message);
    return sendResponse(200, true, 'Settings fetched', { settings: data });
  } catch (err: any) {
    return sendResponse(500, false, err.message);
  }
}

export async function PATCH(req: NextRequest) {
  const { error } = requireAdmin(req);
  if (error) return error;

  try {
    const body = await req.json();
    const { interestRateDefault, processingFeePercent, minLoan, maxLoan, maxMonths } = body;

    const { data: existing } = await db.from('settings').select('id').limit(1).maybeSingle();

    const updates: any = {};
    if (interestRateDefault !== undefined) updates.interest_rate_default = Number(interestRateDefault);
    if (processingFeePercent !== undefined) updates.processing_fee_percent = Number(processingFeePercent);
    if (minLoan !== undefined) updates.min_loan = Number(minLoan);
    if (maxLoan !== undefined) updates.max_loan = Number(maxLoan);
    if (maxMonths !== undefined) updates.max_months = Number(maxMonths);

    if (existing) {
      await db.from('settings').update(updates).eq('id', existing.id);
    } else {
      await db.from('settings').insert({ ...updates });
    }

    return sendResponse(200, true, 'Settings updated successfully');
  } catch (err: any) {
    return sendResponse(500, false, err.message || 'Failed to update settings');
  }
}
