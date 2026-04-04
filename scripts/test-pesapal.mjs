import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

const db = createClient(
  'https://pydxikldcbetxqljnqyx.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB5ZHhpa2xkY2JldHhxbGpucXl4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDc2OTg5OCwiZXhwIjoyMDkwMzQ1ODk4fQ.Co4D4zCUnJQexysarsgHYnIDAaGHCnBhnVmgfMGuG5Y'
);

// Reset password for aa@gmail.com
const hash = await bcrypt.hash('Test@1234', 12);
await db.from('users').update({ password_hash: hash }).eq('email', 'aa@gmail.com');
console.log('Password reset for aa@gmail.com -> Test@1234');

// Login
const loginRes = await fetch('https://getvertexloans.com/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'aa@gmail.com', password: 'Test@1234' }),
});
const login = await loginRes.json();
console.log('Login:', login.success, 'role:', login.data?.role);

const token = login.data?.token;
if (!token) { console.error('No token'); process.exit(1); }

// Test PesaPal initiate for application 1
const pesapalRes = await fetch('https://getvertexloans.com/api/payments/pesapal/initiate/1', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
});
const pesapal = await pesapalRes.json();
console.log('PesaPal result:', JSON.stringify(pesapal, null, 2));
