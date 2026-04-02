import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { sendResponse } from '@/lib/server/response';
import { getPayloadFromRequest } from '@/lib/server/auth';

export async function GET(req: NextRequest) {
  try {
    const payload = getPayloadFromRequest(req);
    if (!payload) return sendResponse(401, false, 'Unauthorized');

    const [userRes, applicationsRes, transactionsRes, chargesRes, notificationsRes, loansRes, settingsRes] =
      await Promise.all([
        db.from('users').select('*').eq('id', payload.id).single(),
        db.from('applications').select('*, loans(*)').eq('user_id', payload.id).order('created_at', { ascending: false }),
        db.from('transactions').select('*').eq('user_id', payload.id).order('created_at', { ascending: false }).limit(20),
        db.from('charges').select('*').eq('user_id', payload.id).order('created_at', { ascending: false }),
        db.from('notifications').select('*').eq('user_id', payload.id).order('created_at', { ascending: false }).limit(20),
        db.from('loans').select('*, repayments(*)').eq('user_id', payload.id).eq('status', 'ACTIVE').maybeSingle(),
        db.from('settings').select('*').limit(1).maybeSingle(),
      ]);

    const user = userRes.data;
    const applications = applicationsRes.data || [];
    const transactions = transactionsRes.data || [];
    const charges = chargesRes.data || [];
    const notifications = notificationsRes.data || [];
    const activeLoan = loansRes.data;
    const settings = settingsRes.data;

    const totalBorrowed = applications.reduce((s: number, a: any) => s + Number(a.loan_amount || 0), 0);
    const totalRepaid = transactions.filter((t: any) => t.type === 'PAYMENT').reduce((s: number, t: any) => s + Number(t.amount || 0), 0);
    const totalChargesPaid = charges.filter((c: any) => c.status === 'PAID').reduce((s: number, c: any) => s + Number(c.amount || 0), 0);

    const remainingBalance = activeLoan
      ? Number(activeLoan.total_repayment) - activeLoan.repayments.reduce((s: number, r: any) => s + Number(r.amount_paid || 0), 0)
      : 0;

    return sendResponse(200, true, 'Dashboard data fetched', {
      user: {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        kycStatus: user.kyc_status,
        creditScore: user.credit_score,
        memberSince: user.created_at,
      },
      applications: applications.map((a: any) => ({
        id: a.id,
        loanAmount: Number(a.loan_amount),
        repaymentPeriod: a.repayment_period,
        status: a.status,
        processingFeePaid: a.processing_fee_paid,
        paymentEvidenceUrl: a.payment_evidence_url,
        createdAt: a.created_at,
        loan: a.loans ? {
          id: a.loans.id,
          status: a.loans.status,
          interestRate: Number(a.loans.interest_rate),
          totalRepayment: Number(a.loans.total_repayment),
          monthlyInstallment: Number(a.loans.monthly_installment),
          startDate: a.loans.start_date,
          endDate: a.loans.end_date,
          repayments: [],
        } : null,
      })),
      transactions: transactions.map((t: any) => ({
        id: t.id,
        type: t.type,
        amount: Number(t.amount),
        description: t.description,
        date: t.created_at,
        status: t.status,
      })),
      charges: charges.map((c: any) => ({
        id: c.id,
        type: c.type,
        amount: Number(c.amount),
        description: c.description,
        status: c.status,
        date: c.created_at,
        loanId: c.loan_id,
      })),
      notifications: notifications.map((n: any) => ({
        id: n.id,
        type: n.type?.toLowerCase(),
        title: n.title,
        message: n.message,
        read: n.read,
        actionUrl: n.action_url,
        time: n.created_at,
      })),
      activeLoan: activeLoan ? {
        id: activeLoan.id,
        remainingBalance,
        monthlyPayment: Number(activeLoan.monthly_installment),
        nextPaymentDate: activeLoan.end_date,
      } : null,
      statistics: {
        totalBorrowed,
        totalRepaid,
        totalChargesPaid,
        availableCredit: Math.max(0, (settings?.max_loan || 1000000) - totalBorrowed),
        creditScore: user.credit_score,
        creditScoreRating: user.credit_score >= 750 ? 'Excellent' : user.credit_score >= 650 ? 'Good' : user.credit_score >= 550 ? 'Fair' : 'Building',
        scoreChange: '0',
        onTimePaymentsStreak: 0,
        maxCreditLimit: settings?.max_loan || 1000000,
        processingFeePercent: Number(settings?.processing_fee_percent || 6.5),
      },
    });
  } catch {
    return sendResponse(500, false, 'Failed to fetch dashboard data');
  }
}
