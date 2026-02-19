// Comprehensive backend status test
console.log('🔍 BACKEND STATUS TEST');
console.log('='.repeat(60));

const testResults = {
  local: { status: 'UNKNOWN', responseTime: 0, error: null },
  remote: { status: 'UNKNOWN', responseTime: 0, error: null }
};

// Test local backend
async function testLocalBackend() {
  console.log('\n🏠 Testing Local Backend (http://localhost:5000)...');
  
  try {
    const startTime = Date.now();
    
    const response = await fetch('http://localhost:5000/api/applications', {
      method: 'GET',
      signal: AbortSignal.timeout(5000)
    });
    
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    testResults.local = {
      status: response.status,
      responseTime,
      error: null
    };
    
    console.log(`✅ Local Backend Status: ${response.status}`);
    console.log(`⏱️  Response Time: ${responseTime}ms`);
    
    const data = await response.text();
    console.log(`📄 Response: ${data.substring(0, 100)}...`);
    
  } catch (error) {
    testResults.local = {
      status: 'ERROR',
      responseTime: 0,
      error: error.message
    };
    
    console.log(`❌ Local Backend Error: ${error.message}`);
  }
}

// Test remote backend
async function testRemoteBackend() {
  console.log('\n🌐 Testing Remote Backend (https://vertexloans.onrender.com)...');
  
  try {
    const startTime = Date.now();
    
    const response = await fetch('https://vertexloans.onrender.com/api/applications', {
      method: 'GET',
      signal: AbortSignal.timeout(15000)
    });
    
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    testResults.remote = {
      status: response.status,
      responseTime,
      error: null
    };
    
    console.log(`✅ Remote Backend Status: ${response.status}`);
    console.log(`⏱️  Response Time: ${responseTime}ms`);
    
    const data = await response.text();
    console.log(`📄 Response: ${data.substring(0, 100)}...`);
    
  } catch (error) {
    testResults.remote = {
      status: 'ERROR',
      responseTime: 0,
      error: error.message
    };
    
    console.log(`❌ Remote Backend Error: ${error.message}`);
  }
}

// Run tests
async function runTests() {
  await testLocalBackend();
  await testRemoteBackend();
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 BACKEND STATUS SUMMARY:');
  console.log('='.repeat(60));
  
  console.log('\n🏠 LOCAL BACKEND:');
  if (testResults.local.status === 'ERROR') {
    console.log(`❌ Status: DOWN`);
    console.log(`🔧 Error: ${testResults.local.error}`);
    console.log(`💡 Solution: Start with 'npm run dev' in backend directory`);
  } else {
    console.log(`✅ Status: RUNNING`);
    console.log(`📡 HTTP Status: ${testResults.local.status}`);
    console.log(`⏱️  Response Time: ${testResults.local.responseTime}ms`);
  }
  
  console.log('\n🌐 REMOTE BACKEND:');
  if (testResults.remote.status === 'ERROR') {
    console.log(`❌ Status: DOWN`);
    console.log(`🔧 Error: ${testResults.remote.error}`);
    console.log(`💡 Solution: Check Render deployment or restart service`);
  } else {
    console.log(`✅ Status: RUNNING`);
    console.log(`📡 HTTP Status: ${testResults.remote.status}`);
    console.log(`⏱️  Response Time: ${testResults.remote.responseTime}ms`);
  }
  
  console.log('\n🎯 RECOMMENDATIONS:');
  
  if (testResults.local.status === 'ERROR' && testResults.remote.status !== 'ERROR') {
    console.log('✅ Use remote backend for development');
    console.log('🌐 URL: https://vertexloans.onrender.com');
  } else if (testResults.local.status !== 'ERROR' && testResults.remote.status === 'ERROR') {
    console.log('✅ Use local backend for development');
    console.log('🏠 URL: http://localhost:5000');
  } else if (testResults.local.status !== 'ERROR' && testResults.remote.status !== 'ERROR') {
    console.log('✅ Both backends are running!');
    console.log('🏠 Local: http://localhost:5000');
    console.log('🌐 Remote: https://vertexloans.onrender.com');
  } else {
    console.log('❌ Both backends are down');
    console.log('🔧 Start local backend: npm run dev');
    console.log('🌐 Check remote deployment: Render dashboard');
  }
  
  console.log('\n🎉 Backend status check completed!');
}

// Run the tests
runTests().catch(error => {
  console.error('❌ Test failed:', error);
});
