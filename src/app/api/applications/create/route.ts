import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { sendResponse } from '@/lib/server/response';
import { getPayloadFromRequest } from '@/lib/server/auth';

export async function POST(req: NextRequest) {
  try {
    const payload = getPayloadFromRequest(req);
    if (!payload) return sendResponse(401, false, 'Unauthorized');

    const body = await req.json();
    const { loanAmount, repaymentPeriod, mode, idType, idNumber, tinNumber, businessName, businessRegNo, onlineFormData } = body;

    if (!loanAmount || !repaymentPeriod) return sendResponse(400, false, 'Loan amount and repayment period are required');

    const { data: application, error } = await db
      .from('applications')
      .insert({
        user_id: payload.id,
        loan_amount: loanAmount,
        repayment_period: repaymentPeriod,
        status: 'SUBMITTED',
        mode: mode || 'ONLINE',
        id_type: idType || null,
        id_number: idNumber || null,
        tin_number: tinNumber || null,
        business_name: businessName || null,
        business_reg_no: businessRegNo || null,
        online_form_data: onlineFormData || null,
        processing_fee_paid: false,
        processing_progress: 0,
      })
      .select()
      .single();

    if (error || !application) return sendResponse(500, false, 'Failed to create application');

    return sendResponse(201, true, 'Application submitted successfully', { application });
  } catch {
    return sendResponse(500, false, 'Failed to create application');
  }
}
