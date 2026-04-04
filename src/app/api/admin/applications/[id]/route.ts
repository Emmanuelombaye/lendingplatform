import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { sendResponse } from '@/lib/server/response';
import { requireAdmin } from '@/lib/server/adminAuth';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = requireAdmin(req);
  if (error) return error;

  try {
    const { id } = await params;
    const { action, reason } = await req.json(); // action: 'APPROVE' | 'REJECT'

    if (!['APPROVE', 'REJECT'].includes(action)) {
      return sendResponse(400, false, 'Action must be APPROVE or REJECT');
    }

    const { data: app, error: appErr } = await db
      .from('applications')
      .select('*, users(id, full_name, email)')
      .eq('id', id)
      .maybeSingle();

    if (appErr || !app) return sendResponse(404, false, 'Application not found');
    if (!['SUBMITTED', 'REVIEW'].includes(app.status)) {
      return sendResponse(400, false, `Cannot ${action.toLowerCase()} an application with status ${app.status}`);
    }

    const newStatus = action === 'APPROVE' ? 'APPROVED' : 'REJECTED';

    await db.from('applications').update({ status: newStatus }).eq('id', id);

    // Notify user
    const user = app.users as any;
    await db.from('notifications').insert({
      user_id: user.id,
      type: action === 'APPROVE' ? 'SUCCESS' : 'ERROR',
      title: action === 'APPROVE' ? 'Loan Application Approved! 🎉' : 'Loan Application Update',
      message: action === 'APPROVE'
        ? `Your loan application for TZS ${Number(app.loan_amount).toLocaleString()} has been approved. Please pay the processing fee to activate your loan.`
        : `Your loan application has been declined. ${reason ? `Reason: ${reason}` : 'Please contact support for more information.'}`,
      read: false,
    });

    return sendResponse(200, true, `Application ${newStatus.toLowerCase()} successfully`);
  } catch (err: any) {
    return sendResponse(500, false, err.message || 'Failed to update application');
  }
}
