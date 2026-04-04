// Runs the ALTER TABLE via Supabase's pg REST endpoint
const SUPABASE_URL = 'https://pydxikldcbetxqljnqyx.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB5ZHhpa2xkY2JldHhxbGpucXl4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDc2OTg5OCwiZXhwIjoyMDkwMzQ1ODk4fQ.Co4D4zCUnJQexysarsgHYnIDAaGHCnBhnVmgfMGuG5Y';

const sql = `
ALTER TABLE applications
  ADD COLUMN IF NOT EXISTS pesapal_tracking_id TEXT,
  ADD COLUMN IF NOT EXISTS pesapal_merchant_ref TEXT;
`;

const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'apikey': SERVICE_KEY,
    'Authorization': `Bearer ${SERVICE_KEY}`,
  },
  body: JSON.stringify({ sql }),
});

const text = await res.text();
console.log('Status:', res.status);
console.log('Response:', text);
