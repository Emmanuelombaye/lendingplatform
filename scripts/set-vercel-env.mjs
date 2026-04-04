import { execSync } from 'child_process';

const projectJson = JSON.parse(execSync('type .vercel\\project.json').toString());
const projectId = projectJson.projectId;
const token = 'vca_8pXxchgoWwUsVGeKbIxST85ubxsLeBdEF77jTshSIjnu5bX7qb1pmIpT';

console.log('Project ID:', projectId);
console.log('Token found:', token ? 'yes' : 'no');

const vars = [
  { key: 'PESAPAL_CONSUMER_KEY', value: 'W4s1/TvCYYPpDvgsLr5AWmGXmIbDBBIu' },
  { key: 'PESAPAL_CONSUMER_SECRET', value: 'qpLL1K3ebMJgEueZHunD1Dqy3pI=' },
  { key: 'PESAPAL_BASE_URL', value: 'https://pay.pesapal.com/v3' },
  { key: 'NEXT_PUBLIC_APP_URL', value: 'https://getvertexloans.com' },
  { key: 'TOKEN_SECRET', value: 'pydxikldcbetxqljnqyx-vertex-loans-secret-2024-Kenya90' },
  { key: 'SUPABASE_SERVICE_ROLE_KEY', value: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB5ZHhpa2xkY2JldHhxbGpucXl4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDc2OTg5OCwiZXhwIjoyMDkwMzQ1ODk4fQ.Co4D4zCUnJQexysarsgHYnIDAaGHCnBhnVmgfMGuG5Y' },
  { key: 'NEXT_PUBLIC_SUPABASE_URL', value: 'https://pydxikldcbetxqljnqyx.supabase.co' },
  { key: 'NEXT_PUBLIC_SUPABASE_ANON_KEY', value: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB5ZHhpa2xkY2JldHhxbGpucXl4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3Njk4OTgsImV4cCI6MjA5MDM0NTg5OH0.RHhKlMqkfHsyis1sNL4vvJfV6Fvox47ml2bRe1w0QnE' },
];

for (const { key, value } of vars) {
  // Always get existing ID and PATCH it
  const listRes = await fetch(`https://api.vercel.com/v10/projects/${projectId}/env`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const list = await listRes.json();
  const existing = (list.envs || []).find((e) => e.key === key);

  if (existing) {
    const patchRes = await fetch(`https://api.vercel.com/v10/projects/${projectId}/env/${existing.id}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ value, target: ['production', 'preview'], type: 'encrypted' }),
    });
    const patchData = await patchRes.json();
    if (patchRes.ok) console.log(`✓ ${key} (updated)`);
    else console.error(`✗ ${key}:`, patchData.error?.message);
  } else {
    const res = await fetch(`https://api.vercel.com/v10/projects/${projectId}/env`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, value, type: 'encrypted', target: ['production', 'preview'] }),
    });
    const data = await res.json();
    if (res.ok) console.log(`✓ ${key} (created)`);
    else console.error(`✗ ${key}:`, data.error?.message);
  }
}

console.log('\nDone! Now redeploy: npx vercel --prod');
