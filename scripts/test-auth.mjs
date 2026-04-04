import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://pydxikldcbetxqljnqyx.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB5ZHhpa2xkY2JldHhxbGpucXl4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDc2OTg5OCwiZXhwIjoyMDkwMzQ1ODk4fQ.Co4D4zCUnJQexysarsgHYnIDAaGHCnBhnVmgfMGuG5Y'
);

// 1. List all users
const { data: users } = await supabase.from('users').select('id, full_name, email, role, created_at').order('created_at', { ascending: false });
console.log('All users:', JSON.stringify(users, null, 2));

// 2. Test register via API
console.log('\n--- Testing Register ---');
const regRes = await fetch('https://getvertexloans.com/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ fullName: 'Test User', email: 'testuser@vertex.com', password: 'Test@1234', phone: '+254700000001' }),
});
const regData = await regRes.json();
console.log('Register response:', JSON.stringify(regData, null, 2));

// 3. Test login with that user
console.log('\n--- Testing Login ---');
const loginRes = await fetch('https://getvertexloans.com/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'testuser@vertex.com', password: 'Test@1234' }),
});
const loginData = await loginRes.json();
console.log('Login response:', JSON.stringify(loginData, null, 2));

// 4. Test dashboard with token
if (loginData.data?.token) {
  console.log('\n--- Testing Dashboard ---');
  const dashRes = await fetch('https://getvertexloans.com/api/users/dashboard', {
    headers: { Authorization: `Bearer ${loginData.data.token}` },
  });
  const dashData = await dashRes.json();
  console.log('Dashboard success:', dashData.success, '| User:', dashData.data?.user?.fullName);
}
