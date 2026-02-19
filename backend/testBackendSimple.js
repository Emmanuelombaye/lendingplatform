// Simple backend test using basic HTTP
const http = require('http');

function testBackend(host, port, path) {
  return new Promise((resolve) => {
    const options = {
      host: host,
      port: port,
      path: path,
      method: 'GET',
      timeout: 10000
    };
    
    const startTime = Date.now();
    
    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        const endTime = Date.now();
        resolve({
          host,
          port,
          path,
          status: res.statusCode,
          responseTime: endTime - startTime,
          data: data.substring(0, 200),
          success: true
        });
      });
    });
    
    req.on('error', (error) => {
      const endTime = Date.now();
      resolve({
        host,
        port,
        path,
        status: 'ERROR',
        responseTime: endTime - startTime,
        error: error.message,
        success: false
      });
    });
    
    req.on('timeout', () => {
      req.destroy();
      resolve({
        host,
        port,
        path,
        status: 'TIMEOUT',
        responseTime: 10000,
        error: 'Request timeout',
        success: false
      });
    });
    
    req.end();
  });
}

async function main() {
  console.log('🔍 BACKEND STATUS TEST');
  console.log('='.repeat(50));
  
  // Test local backend
  console.log('\n🏠 Testing Local Backend...');
  const localResult = await testBackend('localhost', 5000, '/api/applications');
  
  if (localResult.success) {
    console.log(`✅ Local Backend: RUNNING`);
    console.log(`📡 Status: ${localResult.status}`);
    console.log(`⏱️  Response Time: ${localResult.responseTime}ms`);
    console.log(`📄 Response: ${localResult.data}...`);
  } else {
    console.log(`❌ Local Backend: DOWN`);
    console.log(`🔧 Error: ${localResult.error}`);
  }
  
  // Test remote backend
  console.log('\n🌐 Testing Remote Backend...');
  const https = require('https');
  
  const remoteResult = await new Promise((resolve) => {
    const options = {
      host: 'vertexloans.onrender.com',
      port: 443,
      path: '/api/applications',
      method: 'GET',
      timeout: 15000
    };
    
    const startTime = Date.now();
    
    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        const endTime = Date.now();
        resolve({
          host: 'vertexloans.onrender.com',
          port: 443,
          path: '/api/applications',
          status: res.statusCode,
          responseTime: endTime - startTime,
          data: data.substring(0, 200),
          success: true
        });
      });
    });
    
    req.on('error', (error) => {
      const endTime = Date.now();
      resolve({
        host: 'vertexloans.onrender.com',
        port: 443,
        path: '/api/applications',
        status: 'ERROR',
        responseTime: endTime - startTime,
        error: error.message,
        success: false
      });
    });
    
    req.on('timeout', () => {
      req.destroy();
      resolve({
        host: 'vertexloans.onrender.com',
        port: 443,
        path: '/api/applications',
        status: 'TIMEOUT',
        responseTime: 15000,
        error: 'Request timeout',
        success: false
      });
    });
    
    req.end();
  });
  
  if (remoteResult.success) {
    console.log(`✅ Remote Backend: RUNNING`);
    console.log(`📡 Status: ${remoteResult.status}`);
    console.log(`⏱️  Response Time: ${remoteResult.responseTime}ms`);
    console.log(`📄 Response: ${remoteResult.data}...`);
  } else {
    console.log(`❌ Remote Backend: DOWN`);
    console.log(`🔧 Error: ${remoteResult.error}`);
  }
  
  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 SUMMARY:');
  
  if (localResult.success && remoteResult.success) {
    console.log('🎉 BOTH BACKENDS ARE RUNNING!');
    console.log('🏠 Local: http://localhost:5000');
    console.log('🌐 Remote: https://vertexloans.onrender.com');
  } else if (localResult.success && !remoteResult.success) {
    console.log('✅ ONLY LOCAL BACKEND IS RUNNING');
    console.log('🏠 Use: http://localhost:5000');
  } else if (!localResult.success && remoteResult.success) {
    console.log('✅ ONLY REMOTE BACKEND IS RUNNING');
    console.log('🌐 Use: https://vertexloans.onrender.com');
  } else {
    console.log('❌ BOTH BACKENDS ARE DOWN');
    console.log('🔧 Start local: npm run dev');
    console.log('🌐 Check remote: Render dashboard');
  }
  
  console.log('\n🎉 TEST COMPLETED');
}

main().catch(error => {
  console.error('❌ Test failed:', error);
});
