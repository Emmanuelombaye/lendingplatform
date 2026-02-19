console.log('Starting backend test...');
console.log('Current directory:', process.cwd());
console.log('Node version:', process.version);

try {
  const { spawn } = require('child_process');
  
  console.log('Starting backend server...');
  const backend = spawn('npm', ['run', 'dev'], {
    cwd: process.cwd(),
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
    console.log('Backend process exited with code:', code);
  });
  
  // Wait a bit then test
  setTimeout(() => {
    console.log('Testing backend after 5 seconds...');
    
    const http = require('http');
    
    const req = http.get('http://localhost:5000/api/applications', (res) => {
      console.log('Backend test response status:', res.statusCode);
      res.on('data', (data) => {
        console.log('Backend test response:', data.toString().substring(0, 100));
      });
    });
    
    req.on('error', (error) => {
      console.log('Backend test error:', error.message);
    });
    
    req.setTimeout(5000, () => {
      console.log('Backend test timeout');
      req.destroy();
    });
    
  }, 5000);
  
} catch (error) {
  console.error('Error starting backend:', error);
}
