import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://pydxikldcbetxqljnqyx.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB5ZHhpa2xkY2JldHhxbGpucXl4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDc2OTg5OCwiZXhwIjoyMDkwMzQ1ODk4fQ.Co4D4zCUnJQexysarsgHYnIDAaGHCnBhnVmgfMGuG5Y'
);

// Test connection by reading applications table columns
const { data, error } = await supabase.from('applications').select('id').limit(1);
if (error) {
  console.error('DB connection failed:', error.message);
  process.exit(1);
}
console.log('DB connected. Sample row:', data);
console.log('Run this SQL in Supabase SQL Editor:');
console.log(`
ALTER TABLE applications
  ADD COLUMN IF NOT EXISTS pesapal_tracking_id TEXT,
  ADD COLUMN IF NOT EXISTS pesapal_merchant_ref TEXT;
`);
