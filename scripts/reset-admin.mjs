import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

const supabase = createClient(
  'https://pydxikldcbetxqljnqyx.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB5ZHhpa2xkY2JldHhxbGpucXl4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDc2OTg5OCwiZXhwIjoyMDkwMzQ1ODk4fQ.Co4D4zCUnJQexysarsgHYnIDAaGHCnBhnVmgfMGuG5Y'
);

const newPassword = 'Admin@Vertex2024';
const hash = await bcrypt.hash(newPassword, 12);

const { error } = await supabase
  .from('users')
  .update({ password_hash: hash })
  .eq('email', 'admin@getvertexloans.com');

if (error) {
  console.error('Failed:', error.message);
} else {
  console.log('Admin password reset successfully.');
  console.log('Email:    admin@getvertexloans.com');
  console.log('Password: Admin@Vertex2024');
}
