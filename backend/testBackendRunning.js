// Simple backend test
console.log('🔍 Testing Backend Status...');

const http = require('http');

// Test local backend
const options = {
  host: 'localhost',
  port: 5000,
  path: '/api/applications',
  method: 'GET',
  timeout: 5000
};

const req = http.request(options, (res) => {
  console.log('✅ Backend Response Status:', res.statusCode);
  console.log('✅ Backend Headers:', res.headers);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('✅ Backend Response:', data.substring(0, 200));
    console.log('🎉 BACKEND IS RUNNING!');
  });
});

req.on('error', (error) => {
  console.log('❌ Backend Error:', error.message);
  console.log('💡 Backend is NOT running');
  console.log('🔧 Start with: npm run dev');
});

req.on('timeout', () => {
  console.log('⏰ Backend Timeout');
  console.log('💡 Backend is NOT responding');
});

req.end();
