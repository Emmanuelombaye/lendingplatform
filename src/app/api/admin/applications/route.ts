import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { sendResponse } from '@/lib/server/response';
import { requireAdmin } from '@/lib/server/adminAuth';

export async function GET(req: NextRequest) {
  const { error } = requireAdmin(req);
  if (error) return error;

  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    let query = db
      .from('applications')
      .select('*, users(id, full_name, email, phone), loans(*)')
      .order('created_at', { ascending: false });

    if (status && status !== 'ALL') {
      query = query.eq('status', status);
    }

    const { data, error: dbErr } = await query;
    if (dbErr) return sendResponse(500, false, dbErr.message);

    return sendResponse(200, true, 'Applications fetched', {
      applications: (data || []).map((a: any) => ({
        id: a.id,
        loanAmount: Number(a.loan_amount),
        repaymentPeriod: a.repayment_period,
        status: a.status,
        mode: a.mode,
        processingFeePaid: a.processing_fee_paid,
        idType: a.id_type,
        idNumber: a.id_number,
        tinNumber: a.tin_number,
        businessName: a.business_name,
        onlineFormData: a.online_form_data,
        createdAt: a.created_at,
        user: a.users ? {
          id: a.users.id,
          fullName: a.users.full_name,
          email: a.users.email,
          phone: a.users.phone,
        } : null,
        loan: a.loans ? {
          id: a.loans.id,
          status: a.loans.status,
          totalRepayment: Number(a.loans.total_repayment),
          monthlyInstallment: Number(a.loans.monthly_installment),
        } : null,
      })),
    });
  } catch (err: any) {
    return sendResponse(500, false, err.message || 'Failed to fetch applications');
  }
}
