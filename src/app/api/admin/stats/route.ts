import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { sendResponse } from '@/lib/server/response';
import { requireAdmin } from '@/lib/server/adminAuth';

export async function GET(req: NextRequest) {
  const { error } = requireAdmin(req);
  if (error) return error;

  try {
    const [usersRes, appsRes, loansRes, transRes] = await Promise.all([
      db.from('users').select('id, role, created_at').eq('role', 'USER'),
      db.from('applications').select('id, status, loan_amount'),
      db.from('loans').select('id, status, loan_amount, total_repayment'),
      db.from('transactions').select('id, type, amount, status'),
    ]);

    const users = usersRes.data || [];
    const apps = appsRes.data || [];
    const loans = loansRes.data || [];
    const transactions = transRes.data || [];

    const totalDisbursed = loans
      .filter((l: any) => ['ACTIVE', 'COMPLETED'].includes(l.status))
      .reduce((s: number, l: any) => s + Number(l.loan_amount || 0), 0);

    const totalRepaid = transactions
      .filter((t: any) => t.type === 'PAYMENT' && t.status === 'COMPLETED')
      .reduce((s: number, t: any) => s + Number(t.amount || 0), 0);

    const totalFees = transactions
      .filter((t: any) => t.type === 'PROCESSING_FEE' && t.status === 'COMPLETED')
      .reduce((s: number, t: any) => s + Number(t.amount || 0), 0);

    return sendResponse(200, true, 'Stats fetched', {
      totalUsers: users.length,
      totalApplications: apps.length,
      pendingApplications: apps.filter((a: any) => ['SUBMITTED', 'REVIEW'].includes(a.status)).length,
      approvedApplications: apps.filter((a: any) => a.status === 'APPROVED').length,
      rejectedApplications: apps.filter((a: any) => a.status === 'REJECTED').length,
      activeLoans: loans.filter((l: any) => l.status === 'ACTIVE').length,
      totalDisbursed,
      totalRepaid,
      totalFees,
    });
  } catch (err: any) {
    return sendResponse(500, false, err.message || 'Failed to fetch stats');
  }
}
