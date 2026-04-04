import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { sendResponse } from '@/lib/server/response';
import { getPayloadFromRequest } from '@/lib/server/auth';
import { registerIpnUrl, submitPesapalOrder } from '@/lib/pesapal';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://getvertexloans.com';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const payload = getPayloadFromRequest(req);
    if (!payload) return sendResponse(401, false, 'Unauthorized');

    const { id } = await params;
    const applicationId = Number(id);
    if (!applicationId) return sendResponse(400, false, 'Application ID required');

    const { data: app, error: appErr } = await db
      .from('applications')
      .select('*, users(id, full_name, email, phone)')
      .eq('id', applicationId)
      .eq('user_id', payload.id)
      .maybeSingle();

    if (appErr || !app) return sendResponse(404, false, 'Application not found');
    if (app.status !== 'APPROVED') return sendResponse(400, false, 'Application is not approved');
    if (app.processing_fee_paid) return sendResponse(400, false, 'Processing fee already paid');

    const { data: settings } = await db.from('settings').select('*').limit(1).maybeSingle();
    const feePercent = Number(settings?.processing_fee_percent || 6.5);
    const feeAmount = Math.round(Number(app.loan_amount) * (feePercent / 100));

    const user = app.users as any;
    const nameParts = (user.full_name || 'Customer').split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ') || firstName;

    const ipnUrl = `${APP_URL}/api/payments/pesapal/ipn`;
    const ipnId = await registerIpnUrl(ipnUrl);

    const merchantRef = `VTX-FEE-${applicationId}-${Date.now()}`;
    const callbackUrl = `${APP_URL}/api/payments/pesapal/callback?ref=${merchantRef}&appId=${applicationId}`;

    const { redirectUrl, orderTrackingId } = await submitPesapalOrder({
      id: merchantRef,
      currency: 'KES',
      amount: feeAmount,
      description: `Processing fee for loan application #${applicationId}`,
      callbackUrl,
      ipnId,
      firstName,
      lastName,
      email: user.email,
      phone: user.phone || '',
    });

    // Persist tracking id — resilient to missing columns
    try {
      await db.from('applications').update({
        pesapal_tracking_id: orderTrackingId,
        pesapal_merchant_ref: merchantRef,
      }).eq('id', applicationId);
    } catch (_) {}

    // Always store in transactions as reliable fallback
    await db.from('transactions').insert({
      user_id: payload.id,
      type: 'PROCESSING_FEE',
      amount: feeAmount,
      description: `PESAPAL_PENDING|ref:${merchantRef}|tracking:${orderTrackingId}|appId:${applicationId}`,
      status: 'PENDING',
    });

    return sendResponse(200, true, 'Payment initiated', { link: redirectUrl });
  } catch (err: any) {
    console.error('Processing fee initiate error:', err);
    return sendResponse(500, false, err.message || 'Failed to initiate payment');
  }
}
