import https from 'https';

async function testAPI(path, body) {
  return new Promise((resolve) => {
    const data = JSON.stringify(body);
    const req = https.request({
      hostname: 'getvertexloans.com',
      path,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) }
    }, (res) => {
      let b = '';
      res.on('data', d => b += d);
      res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(b) }));
    });
    req.on('error', e => resolve({ error: e.message }));
    req.write(data);
    req.end();
  });
}

const email = `testuser_${Date.now()}@test.com`;
const password = 'Test@123456';

console.log('\n=== REGISTER TEST ===');
const reg = await testAPI('/api/auth/register', { fullName: 'Test User', email, password });
console.log('Status:', reg.status);
console.log('Response:', JSON.stringify(reg.body, null, 2));

console.log('\n=== LOGIN TEST ===');
const login = await testAPI('/api/auth/login', { email, password });
console.log('Status:', login.status);
console.log('Response:', JSON.stringify(login.body, null, 2));

console.log('\n=== WRONG PASSWORD TEST ===');
const bad = await testAPI('/api/auth/login', { email, password: 'wrongpassword' });
console.log('Status:', bad.status);
console.log('Response:', JSON.stringify(bad.body, null, 2));
