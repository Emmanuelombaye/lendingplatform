import { db } from '@/lib/db';

export async function markFeePaid(merchantRef: string, trackingId: string, confirmationCode: string) {
  let app: any = null;

  try {
    const { data } = await db
      .from('applications')
      .select('id, user_id, loan_amount, repayment_period, processing_fee_paid')
      .eq('pesapal_merchant_ref', merchantRef)
      .maybeSingle();
    app = data;
  } catch (_) {}

  if (!app) {
    const { data: txRows } = await db
      .from('transactions')
      .select('description, user_id')
      .ilike('description', `%ref:${merchantRef}%`)
      .limit(1);

    if (txRows && txRows.length > 0) {
      const desc = txRows[0].description as string;
      const appIdMatch = desc.match(/appId:(\d+)/);
      if (appIdMatch) {
        const { data } = await db
          .from('applications')
          .select('id, user_id, loan_amount, repayment_period, processing_fee_paid')
          .eq('id', Number(appIdMatch[1]))
          .maybeSingle();
        app = data;
      }
    }
  }

  if (!app || app.processing_fee_paid) return;

  const { data: settings } = await db.from('settings').select('*').limit(1).maybeSingle();
  const interestRate = Number(settings?.interest_rate_default || 6.0);
  const feePercent = Number(settings?.processing_fee_percent || 6.5);
  const loanAmount = Number(app.loan_amount);
  const months = Number(app.repayment_period);
  const totalRepayment = loanAmount + loanAmount * (interestRate / 100) * months;
  const monthlyInstallment = totalRepayment / months;

  const startDate = new Date();
  const endDate = new Date();
  endDate.setMonth(endDate.getMonth() + months);

  try {
    await db.from('applications').update({
      processing_fee_paid: true,
      pesapal_tracking_id: trackingId,
    }).eq('id', app.id);
  } catch (_) {
    await db.from('applications').update({ processing_fee_paid: true }).eq('id', app.id);
  }

  const { data: existingLoan } = await db
    .from('loans')
    .select('id')
    .eq('application_id', app.id)
    .maybeSingle();

  if (!existingLoan) {
    await db.from('loans').insert({
      application_id: app.id,
      user_id: app.user_id,
      loan_amount: loanAmount,
      interest_rate: interestRate,
      total_repayment: totalRepayment,
      monthly_installment: monthlyInstallment,
      repayment_period: months,
      status: 'PENDING_DISBURSEMENT',
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString(),
    });
  } else {
    await db.from('loans').update({ status: 'PENDING_DISBURSEMENT' }).eq('id', existingLoan.id);
  }

  await db.from('transactions')
    .update({ status: 'COMPLETED', description: `Processing fee paid via PesaPal (${confirmationCode})` })
    .ilike('description', `%ref:${merchantRef}%`);

  await db.from('notifications').insert({
    user_id: app.user_id,
    type: 'SUCCESS',
    title: 'Processing Fee Paid',
    message: 'Your processing fee has been received. Your loan is now being prepared for disbursement.',
    read: false,
  });
}
