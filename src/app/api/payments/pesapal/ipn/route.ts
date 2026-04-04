import { NextRequest, NextResponse } from 'next/server';
import { getTransactionStatus } from '@/lib/pesapal';
import { markFeePaid } from '@/lib/markFeePaid';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const orderTrackingId = searchParams.get('orderTrackingId');
    const merchantRef = searchParams.get('orderMerchantReference');

    if (!orderTrackingId || !merchantRef) {
      return NextResponse.json({ orderNotificationType: 'IPNCHANGE', orderTrackingId: '', orderMerchantReference: '', status: '500' });
    }

    const txStatus = await getTransactionStatus(orderTrackingId);
    if (txStatus.status === 'Completed') {
      await markFeePaid(merchantRef, orderTrackingId, txStatus.confirmationCode);
    }

    return NextResponse.json({
      orderNotificationType: 'IPNCHANGE',
      orderTrackingId,
      orderMerchantReference: merchantRef,
      status: '200',
    });
  } catch (err) {
    console.error('PesaPal IPN error:', err);
    return NextResponse.json({ orderNotificationType: 'IPNCHANGE', orderTrackingId: '', orderMerchantReference: '', status: '500' });
  }
}
