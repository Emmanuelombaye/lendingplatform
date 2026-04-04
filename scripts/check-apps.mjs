import { createClient } from '@supabase/supabase-js';

const db = createClient(
  'https://pydxikldcbetxqljnqyx.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB5ZHhpa2xkY2JldHhxbGpucXl4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDc2OTg5OCwiZXhwIjoyMDkwMzQ1ODk4fQ.Co4D4zCUnJQexysarsgHYnIDAaGHCnBhnVmgfMGuG5Y'
);

// All applications with their loans
const { data: apps } = await db
  .from('applications')
  .select('id, user_id, status, loan_amount, processing_fee_paid, loans(id, status)')
  .order('created_at', { ascending: false });

console.log('All applications:');
console.log(JSON.stringify(apps, null, 2));

// Test the blocking query for user_id 2 (qq@gmail.com)
for (const userId of [2, 4, 5, 6]) {
  const { data: existing } = await db
    .from('applications')
    .select('id, status, loans(status)')
    .eq('user_id', userId)
    .in('status', ['SUBMITTED', 'REVIEW', 'APPROVED'])
    .limit(1)
    .maybeSingle();
  
  console.log(`\nUser ${userId} blocking check:`, JSON.stringify(existing));
}
