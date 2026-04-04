import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getTransactionStatus } from '@/lib/pesapal';
import { markFeePaid } from '../ipn/route';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://getvertexloans.com';

// PesaPal redirects user here: GET /api/payments/pesapal/callback?ref=...&appId=...&OrderTrackingId=...
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const orderTrackingId = searchParams.get('OrderTrackingId') || searchParams.get('orderTrackingId');
    const merchantRef = searchParams.get('ref');
    const appId = searchParams.get('appId');

    if (!orderTrackingId || !merchantRef) {
      return NextResponse.redirect(`${APP_URL}/dashboard?payment=failed`);
    }

    // Query PesaPal for final status
    const txStatus = await getTransactionStatus(orderTrackingId);

    if (txStatus.status === 'Completed') {
      await markFeePaid(merchantRef, orderTrackingId, txStatus.confirmationCode);
      return NextResponse.redirect(`${APP_URL}/dashboard?payment=success`);
    }

    if (txStatus.status === 'Failed') {
      return NextResponse.redirect(`${APP_URL}/dashboard?payment=failed`);
    }

    // Pending — redirect to dashboard, IPN will complete it
    return NextResponse.redirect(`${APP_URL}/dashboard?payment=pending`);
  } catch (err) {
    console.error('PesaPal callback error:', err);
    return NextResponse.redirect(`${APP_URL}/dashboard?payment=error`);
  }
}
