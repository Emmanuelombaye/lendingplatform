import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://pydxikldcbetxqljnqyx.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB5ZHhpa2xkY2JldHhxbGpucXl4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDc2OTg5OCwiZXhwIjoyMDkwMzQ1ODk4fQ.Co4D4zCUnJQexysarsgHYnIDAaGHCnBhnVmgfMGuG5Y'
);

const { data, error } = await supabase
  .from('users')
  .select('id, full_name, email, role, created_at')
  .eq('role', 'ADMIN');

if (error) {
  console.error('Error:', error.message);
} else {
  console.log('Admin users:', JSON.stringify(data, null, 2));
}
