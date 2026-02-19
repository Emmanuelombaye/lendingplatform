// Test backend API endpoints
const axios = require('axios');

async function testBackend() {
  const baseUrl = 'https://vertexloans.onrender.com';
  
  console.log('🔍 Testing Backend API Status...');
  console.log('='.repeat(50));
  
  const endpoints = [
    { path: '/', name: 'Root' },
    { path: '/api', name: 'API Base' },
    { path: '/api/applications', name: 'Applications' },
    { path: '/api/admin/applications', name: 'Admin Applications' },
    { path: '/api/users/dashboard', name: 'User Dashboard' },
    { path: '/api/admin/dashboard', name: 'Admin Dashboard' }
  ];
  
  for (const endpoint of endpoints) {
    try {
      console.log(`\n📡 Testing ${endpoint.name} (${endpoint.path})...`);
      
      const response = await axios.get(`${baseUrl}${endpoint.path}`, {
        timeout: 10000,
        validateStatus: () => true // Don't throw on any status code
      });
      
      console.log(`✅ Status: ${response.status}`);
      console.log(`📄 Response: ${JSON.stringify(response.data).substring(0, 100)}...`);
      
    } catch (error) {
      if (error.code === 'ECONNABORTED') {
        console.log(`⏰ Timeout: ${endpoint.name} - Request took too long`);
      } else if (error.response) {
        console.log(`📡 Status: ${error.response.status}`);
        console.log(`❌ Error: ${error.response.data?.message || 'Unknown error'}`);
      } else {
        console.log(`❌ Connection Error: ${error.message}`);
      }
    }
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('🎯 Backend Test Summary:');
  
  // Test with POST request
  try {
    console.log('\n📤 Testing POST endpoint...');
    const testResponse = await axios.post(`${baseUrl}/api/applications/create`, {
      userId: 1,
      loanAmount: 10000,
      repaymentPeriod: 6
    }, {
      timeout: 10000,
      validateStatus: () => true
    });
    
    console.log(`✅ POST Status: ${testResponse.status}`);
    console.log(`📄 Response: ${JSON.stringify(testResponse.data).substring(0, 100)}...`);
    
  } catch (error) {
    if (error.response) {
      console.log(`📡 POST Status: ${error.response.status}`);
      console.log(`❌ POST Error: ${error.response.data?.message || 'Unknown error'}`);
    } else {
      console.log(`❌ POST Connection Error: ${error.message}`);
    }
  }
  
  console.log('\n🎉 Backend testing completed!');
}

testBackend().catch(error => {
  console.error('❌ Test failed:', error.message);
});
