// Simple backend test
const https = require('https');

function testEndpoint(url) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    
    const req = https.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        const endTime = Date.now();
        resolve({
          url,
          status: res.statusCode,
          responseTime: endTime - startTime,
          data: data.substring(0, 200)
        });
      });
    });
    
    req.on('error', (error) => {
      const endTime = Date.now();
      resolve({
        url,
        status: 'ERROR',
        responseTime: endTime - startTime,
        error: error.message
      });
    });
    
    req.setTimeout(10000, () => {
      req.destroy();
      resolve({
        url,
        status: 'TIMEOUT',
        responseTime: 10000,
        error: 'Request timeout'
      });
    });
  });
}

async function testBackend() {
  console.log('🔍 Testing Backend Status...');
  console.log('='.repeat(60));
  
  const baseUrl = 'https://vertexloans.onrender.com';
  const endpoints = [
    '/',
    '/api',
    '/api/applications',
    '/api/admin/applications'
  ];
  
  for (const endpoint of endpoints) {
    console.log(`\n📡 Testing: ${baseUrl}${endpoint}`);
    
    const result = await testEndpoint(`${baseUrl}${endpoint}`);
    
    if (result.status === 'ERROR') {
      console.log(`❌ Connection Error: ${result.error}`);
    } else if (result.status === 'TIMEOUT') {
      console.log(`⏰ Timeout: Request took too long`);
    } else {
      console.log(`✅ Status: ${result.status}`);
      console.log(`⏱️  Response Time: ${result.responseTime}ms`);
      console.log(`📄 Response: ${result.data}...`);
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('🎯 Backend Status Summary:');
  
  // Final check
  try {
    const finalResult = await testEndpoint(`${baseUrl}/api/applications`);
    if (finalResult.status === 200) {
      console.log('✅ Backend is RUNNING and responding');
    } else if (finalResult.status === 'ERROR') {
      console.log('❌ Backend is DOWN - Connection error');
    } else if (finalResult.status === 'TIMEOUT') {
      console.log('⏰ Backend is SLOW or unresponsive');
    } else {
      console.log(`⚠️  Backend responding with status: ${finalResult.status}`);
    }
  } catch (error) {
    console.log('❌ Backend test failed:', error.message);
  }
}

testBackend();
