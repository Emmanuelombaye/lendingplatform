import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://pydxikldcbetxqljnqyx.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB5ZHhpa2xkY2JldHhxbGpucXl4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDc2OTg5OCwiZXhwIjoyMDkwMzQ1ODk4fQ.Co4D4zCUnJQexysarsgHYnIDAaGHCnBhnVmgfMGuG5Y'
);

// 1. Create storage bucket
const { data: bucket, error: bucketErr } = await supabase.storage.createBucket('documents', {
  public: true,
  fileSizeLimit: 10485760, // 10MB
  allowedMimeTypes: ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'],
});

if (bucketErr) {
  if (bucketErr.message?.includes('already exists')) {
    console.log('✓ Bucket "documents" already exists');
  } else {
    console.error('✗ Bucket creation failed:', bucketErr.message);
  }
} else {
  console.log('✓ Bucket "documents" created');
}

// 2. Check if documents table exists by querying it
const { error: tableErr } = await supabase.from('documents').select('id').limit(1);
if (tableErr) {
  console.log('✗ documents table missing. Run this SQL in Supabase SQL Editor:');
  console.log(`
CREATE TABLE IF NOT EXISTS documents (
  id BIGSERIAL PRIMARY KEY,
  application_id BIGINT REFERENCES applications(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL,
  file_path TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
  `);
} else {
  console.log('✓ documents table exists');
}

// 3. Check applications table for pesapal columns
const { error: appErr } = await supabase
  .from('applications')
  .select('pesapal_tracking_id, pesapal_merchant_ref')
  .limit(1);

if (appErr) {
  console.log('✗ pesapal columns missing. Run this SQL in Supabase SQL Editor:');
  console.log(`
ALTER TABLE applications
  ADD COLUMN IF NOT EXISTS pesapal_tracking_id TEXT,
  ADD COLUMN IF NOT EXISTS pesapal_merchant_ref TEXT;
  `);
} else {
  console.log('✓ pesapal columns exist');
}
