// Test backend startup
const { spawn } = require('child_process');

console.log('🚀 Starting backend server...');

const backend = spawn('npm', ['run', 'dev'], {
  stdio: 'pipe',
  shell: true
});

backend.stdout.on('data', (data) => {
  console.log('Backend output:', data.toString());
});

backend.stderr.on('data', (data) => {
  console.log('Backend error:', data.toString());
});

backend.on('close', (code) => {
  console.log(`Backend process exited with code ${code}`);
});

// Test after 5 seconds
setTimeout(() => {
  console.log('🔍 Testing backend after 5 seconds...');
  
  const http = require('http');
  
  const req = http.get('http://localhost:5000/api/applications', (res) => {
    console.log('✅ Backend is RUNNING!');
    console.log('📡 Status:', res.statusCode);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('📄 Response:', data.substring(0, 100));
    });
  });
  
  req.on('error', (error) => {
    console.log('❌ Backend is NOT running:', error.message);
  });
  
  req.setTimeout(5000, () => {
    req.destroy();
    console.log('⏰ Backend test timeout');
  });
  
}, 5000);
