import { db } from '@/lib/db';
import { sendResponse } from '@/lib/server/response';

export async function GET() {
  try {
    const { data: settings } = await db.from('settings').select('*').limit(1).maybeSingle();

    return sendResponse(200, true, 'Settings fetched', {
      interestRateDefault: Number(settings?.interest_rate_default || 6.0),
      processingFeePercent: Number(settings?.processing_fee_percent || 6.5),
      minLoan: Number(settings?.min_loan || 40000),
      maxLoan: Number(settings?.max_loan || 1000000),
      maxMonths: Number(settings?.max_months || 6),
      supportEmail: settings?.support_email || 'support@getvertexloans.com',
      supportPhone: settings?.support_phone || '+255 762 100 431',
    });
  } catch {
    return sendResponse(200, true, 'Settings fetched (defaults)', {
      interestRateDefault: 6.0,
      processingFeePercent: 6.5,
      minLoan: 40000,
      maxLoan: 1000000,
      maxMonths: 6,
      supportEmail: 'support@getvertexloans.com',
      supportPhone: '+255 762 100 431',
    });
  }
}
