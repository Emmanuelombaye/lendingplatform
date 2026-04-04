/**
 * PesaPal v3 API helper
 */

const BASE_URL = 'https://pay.pesapal.com/v3';

// Read credentials at request time, not module load time
function getCredentials() {
  // Try env vars first, fall back to hardcoded values
  const key = (process.env.PESAPAL_CONSUMER_KEY || 'W4s1/TvCYYPpDvgsLr5AWmGXmIbDBBIu').trim();
  const secret = (process.env.PESAPAL_CONSUMER_SECRET || 'qpLL1K3ebMJgEueZHunD1Dqy3pI=').trim();
  return { key, secret };
}

// Token cache — valid within a single serverless function instance
let _token: string | null = null;
let _tokenExpiry = 0;

export async function getPesapalToken(): Promise<string> {
  if (_token && Date.now() < _tokenExpiry) return _token;

  const { key, secret } = getCredentials();

  const res = await fetch(`${BASE_URL}/api/Auth/RequestToken`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ consumer_key: key, consumer_secret: secret }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`PesaPal auth failed: ${res.status} ${text}`);
  }

  const data = await res.json();
  if (!data.token) throw new Error(`PesaPal auth: no token in response: ${JSON.stringify(data)}`);

  _token = data.token as string;
  // tokens last 5 minutes per PesaPal docs; refresh 30s early
  _tokenExpiry = Date.now() + 4.5 * 60 * 1000;
  return _token;
}

// ── Register IPN URL (idempotent — safe to call on every payment) ─────────────
export async function registerIpnUrl(ipnUrl: string): Promise<string> {
  const token = await getPesapalToken();

  const res = await fetch(`${BASE_URL}/api/URLSetup/RegisterIPN`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ url: ipnUrl, ipn_notification_type: 'GET' }),
  });

  const data = await res.json();
  if (!data.ipn_id) throw new Error(`PesaPal IPN registration failed: ${JSON.stringify(data)}`);
  return data.ipn_id as string;
}

// ── Submit order → returns redirect URL ──────────────────────────────────────
export interface PesapalOrderInput {
  id: string;           // your unique merchant reference
  currency: string;     // e.g. 'KES' or 'TZS'
  amount: number;
  description: string;
  callbackUrl: string;
  ipnId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
}

export async function submitPesapalOrder(order: PesapalOrderInput): Promise<{ redirectUrl: string; orderTrackingId: string }> {
  const token = await getPesapalToken();

  const body = {
    id: order.id,
    currency: order.currency,
    amount: order.amount,
    description: order.description,
    callback_url: order.callbackUrl,
    notification_id: order.ipnId,
    billing_address: {
      email_address: order.email,
      phone_number: order.phone || '',
      first_name: order.firstName,
      last_name: order.lastName,
    },
  };

  const res = await fetch(`${BASE_URL}/api/Transactions/SubmitOrderRequest`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  if (!data.redirect_url) throw new Error(`PesaPal order submit failed: ${JSON.stringify(data)}`);

  return {
    redirectUrl: data.redirect_url as string,
    orderTrackingId: data.order_tracking_id as string,
  };
}

// ── Query transaction status ──────────────────────────────────────────────────
export async function getTransactionStatus(orderTrackingId: string): Promise<{
  status: string;
  paymentMethod: string;
  amount: number;
  currency: string;
  confirmationCode: string;
}> {
  const token = await getPesapalToken();

  const res = await fetch(
    `${BASE_URL}/api/Transactions/GetTransactionStatus?orderTrackingId=${orderTrackingId}`,
    {
      headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
    },
  );

  const data = await res.json();
  return {
    status: data.payment_status_description || data.status_code || 'UNKNOWN',
    paymentMethod: data.payment_method || '',
    amount: Number(data.amount || 0),
    currency: data.currency || '',
    confirmationCode: data.confirmation_code || '',
  };
}
