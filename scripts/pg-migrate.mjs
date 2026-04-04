// Direct postgres migration using the DATABASE_URL
import pg from 'pg';
const { Client } = pg;

const client = new Client({
  connectionString: 'postgresql://postgres:Kenya90!132323@db.pydxikldcbetxqljnqyx.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false },
});

await client.connect();
console.log('Connected to DB');

try {
  await client.query(`ALTER TABLE applications ADD COLUMN IF NOT EXISTS pesapal_tracking_id TEXT`);
  console.log('Added pesapal_tracking_id');
} catch (e) { console.log('pesapal_tracking_id:', e.message); }

try {
  await client.query(`ALTER TABLE applications ADD COLUMN IF NOT EXISTS pesapal_merchant_ref TEXT`);
  console.log('Added pesapal_merchant_ref');
} catch (e) { console.log('pesapal_merchant_ref:', e.message); }

await client.end();
console.log('Done');
