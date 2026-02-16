const axios = require('axios');

// Configuration
const BASE_URL = process.env.API_URL || 'http://localhost:3000/api';
const TEST_USER = {
  fullName: 'Test User Enhanced',
  email: 'testuser.enhanced@example.com',
  phone: '+1234567890',
  password: 'TestPassword123!'
};

let authToken = '';
let userId = null;

// Test utilities
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor for auth token
api.interceptors.request.use((config) => {
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`;
  }
  return config;
});

// Test functions
async function testHealthCheck() {
  console.log('\n🔍 Testing Health Check...');
  try {
    const response = await api.get('/public/health');
    console.log('✅ Health Check:', response.data);
    return true;
  } catch (error) {
    console.log('❌ Health Check Failed:', error.response?.data || error.message);
    return false;
  }
}

async function testUserRegistration() {
  console.log('\n📝 Testing User Registration...');
  try {
    // First, try to clean up any existing test user
    try {
      await api.post('/auth/login', {
        email: TEST_USER.email,
        password: TEST_USER.password
      });
      console.log('⚠️  Test user already exists, continuing with tests...');
      return true;
    } catch (cleanupError) {
      // User doesn't exist, proceed with registration
    }

    const response = await api.post('/auth/register', TEST_USER);

    if (response.data.success) {
      authToken = response.data.data.token;
      userId = response.data.data.id;
      console.log('✅ Registration successful:', {
        id: response.data.data.id,
        fullName: response.data.data.fullName,
        email: response.data.data.email,
        role: response.data.data.role
      });
      return true;
    } else {
      console.log('❌ Registration failed:', response.data.message);
      return false;
    }
  } catch (error) {
    if (error.response?.data?.message?.includes('already exists')) {
      console.log('⚠️  User already exists, testing login instead...');
      return await testUserLogin();
    }
    console.log('❌ Registration Error:', error.response?.data || error.message);
    return false;
  }
}

async function testUserLogin() {
  console.log('\n🔐 Testing User Login...');
  try {
    const response = await api.post('/auth/login', {
      email: TEST_USER.email,
      password: TEST_USER.password
    });

    if (response.data.success) {
      authToken = response.data.data.token;
      userId = response.data.data.id;
      console.log('✅ Login successful:', {
        id: response.data.data.id,
        fullName: response.data.data.fullName,
        email: response.data.data.email,
        role: response.data.data.role
      });
      return true;
    } else {
      console.log('❌ Login failed:', response.data.message);
      return false;
    }
  } catch (error) {
    console.log('❌ Login Error:', error.response?.data || error.message);
    return false;
  }
}

async function testGetProfile() {
  console.log('\n👤 Testing Get Profile...');
  try {
    const response = await api.get('/auth/profile');

    if (response.data.success) {
      console.log('✅ Profile retrieved:', {
        id: response.data.data.id,
        fullName: response.data.data.fullName,
        email: response.data.data.email,
        applications: response.data.data.applications?.length || 0
      });
      return true;
    } else {
      console.log('❌ Profile retrieval failed:', response.data.message);
      return false;
    }
  } catch (error) {
    console.log('❌ Profile Error:', error.response?.data || error.message);
    return false;
  }
}

async function testCreateApplication() {
  console.log('\n📋 Testing Create Application...');
  try {
    const applicationData = {
      loanAmount: 50000,
      repaymentPeriod: 12
    };

    const response = await api.post('/applications/create', applicationData);

    if (response.data.success) {
      console.log('✅ Application created:', {
        id: response.data.data.id,
        loanAmount: response.data.data.loanAmount,
        repaymentPeriod: response.data.data.repaymentPeriod,
        status: response.data.data.status
      });
      return response.data.data.id;
    } else {
      console.log('❌ Application creation failed:', response.data.message);
      return null;
    }
  } catch (error) {
    console.log('❌ Application Error:', error.response?.data || error.message);
    return null;
  }
}

async function testGetMyApplications() {
  console.log('\n📄 Testing Get My Applications...');
  try {
    const response = await api.get('/applications/my');

    if (response.data.success) {
      console.log('✅ Applications retrieved:', {
        count: response.data.data.length,
        applications: response.data.data.map(app => ({
          id: app.id,
          amount: app.loanAmount,
          status: app.status,
          createdAt: app.createdAt
        }))
      });
      return true;
    } else {
      console.log('❌ Applications retrieval failed:', response.data.message);
      return false;
    }
  } catch (error) {
    console.log('❌ Applications Error:', error.response?.data || error.message);
    return false;
  }
}

async function testFormValidation() {
  console.log('\n✏️  Testing Form Validation...');

  // Test invalid registration data
  const invalidTests = [
    {
      name: 'Missing required fields',
      data: { email: 'test@test.com' },
      endpoint: '/auth/register'
    },
    {
      name: 'Invalid email format',
      data: { fullName: 'Test', email: 'invalid-email', password: 'Test123!' },
      endpoint: '/auth/register'
    },
    {
      name: 'Weak password',
      data: { fullName: 'Test', email: 'test2@test.com', password: '123' },
      endpoint: '/auth/register'
    },
    {
      name: 'Invalid loan amount',
      data: { loanAmount: -100, repaymentPeriod: 12 },
      endpoint: '/applications/create'
    }
  ];

  let passedTests = 0;

  for (const test of invalidTests) {
    try {
      const response = await api.post(test.endpoint, test.data);
      console.log(`❌ ${test.name}: Expected validation error but got success`);
    } catch (error) {
      if (error.response?.status >= 400 && error.response?.status < 500) {
        console.log(`✅ ${test.name}: Correctly rejected - ${error.response.data.message}`);
        passedTests++;
      } else {
        console.log(`❌ ${test.name}: Unexpected error - ${error.message}`);
      }
    }
  }

  console.log(`📊 Validation Tests: ${passedTests}/${invalidTests.length} passed`);
  return passedTests === invalidTests.length;
}

async function testDatabaseOperations() {
  console.log('\n💾 Testing Database Operations...');

  try {
    // Test settings retrieval
    const settingsResponse = await api.get('/public/settings');
    if (settingsResponse.data.success) {
      console.log('✅ Settings retrieved successfully');
    }

    // Test contact form submission
    const contactData = {
      fullName: 'Test Contact',
      email: 'contact@test.com',
      subject: 'Test Message',
      message: 'This is a test message from enhanced auth testing.'
    };

    const contactResponse = await api.post('/public/contact', contactData);
    if (contactResponse.data.success) {
      console.log('✅ Contact form submitted successfully');
    }

    return true;
  } catch (error) {
    console.log('❌ Database Operations Error:', error.response?.data || error.message);
    return false;
  }
}

async function testErrorHandling() {
  console.log('\n🚨 Testing Error Handling...');

  const errorTests = [
    {
      name: 'Invalid endpoint',
      request: () => api.get('/invalid/endpoint'),
      expectedStatus: 404
    },
    {
      name: 'Unauthorized access',
      request: () => {
        const tempToken = authToken;
        authToken = 'invalid-token';
        const promise = api.get('/auth/profile');
        authToken = tempToken;
        return promise;
      },
      expectedStatus: 401
    }
  ];

  let passedTests = 0;

  for (const test of errorTests) {
    try {
      await test.request();
      console.log(`❌ ${test.name}: Expected error but got success`);
    } catch (error) {
      if (error.response?.status === test.expectedStatus) {
        console.log(`✅ ${test.name}: Correctly handled`);
        passedTests++;
      } else {
        console.log(`❌ ${test.name}: Expected ${test.expectedStatus} but got ${error.response?.status}`);
      }
    }
  }

  console.log(`📊 Error Handling Tests: ${passedTests}/${errorTests.length} passed`);
  return passedTests === errorTests.length;
}

// Main test runner
async function runAllTests() {
  console.log('🚀 Starting Enhanced Authentication System Tests');
  console.log('================================================');

  const results = {
    healthCheck: false,
    registration: false,
    login: false,
    profile: false,
    createApplication: false,
    getApplications: false,
    formValidation: false,
    databaseOps: false,
    errorHandling: false
  };

  try {
    // Core functionality tests
    results.healthCheck = await testHealthCheck();
    results.registration = await testUserRegistration();

    // If registration failed, try login
    if (!results.registration) {
      results.login = await testUserLogin();
    } else {
      results.login = true; // Registration includes login
    }

    if (results.login || results.registration) {
      results.profile = await testGetProfile();
      const applicationId = await testCreateApplication();
      results.createApplication = !!applicationId;
      results.getApplications = await testGetMyApplications();
    }

    // Validation and error handling tests
    results.formValidation = await testFormValidation();
    results.databaseOps = await testDatabaseOperations();
    results.errorHandling = await testErrorHandling();

  } catch (error) {
    console.log('\n❌ Test runner error:', error.message);
  }

  // Results summary
  console.log('\n📊 TEST RESULTS SUMMARY');
  console.log('========================');

  const testNames = {
    healthCheck: 'Health Check',
    registration: 'User Registration',
    login: 'User Login',
    profile: 'Get Profile',
    createApplication: 'Create Application',
    getApplications: 'Get Applications',
    formValidation: 'Form Validation',
    databaseOps: 'Database Operations',
    errorHandling: 'Error Handling'
  };

  let passedCount = 0;
  const totalCount = Object.keys(results).length;

  Object.entries(results).forEach(([key, passed]) => {
    const status = passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} ${testNames[key]}`);
    if (passed) passedCount++;
  });

  console.log(`\n📈 Overall Score: ${passedCount}/${totalCount} tests passed`);

  if (passedCount === totalCount) {
    console.log('🎉 All tests passed! The enhanced authentication system is working correctly.');
  } else {
    console.log('⚠️  Some tests failed. Please review the errors above.');
  }

  console.log('\n🔧 Test Configuration:');
  console.log(`- API Base URL: ${BASE_URL}`);
  console.log(`- Test User: ${TEST_USER.email}`);
  console.log(`- Auth Token: ${authToken ? 'Generated' : 'Not generated'}`);

  return passedCount === totalCount;
}

// Run tests if called directly
if (require.main === module) {
  runAllTests().then((success) => {
    process.exit(success ? 0 : 1);
  }).catch((error) => {
    console.error('Test runner failed:', error);
    process.exit(1);
  });
}

module.exports = {
  runAllTests,
  testHealthCheck,
  testUserRegistration,
  testUserLogin,
  testGetProfile,
  testCreateApplication,
  testGetMyApplications,
  testFormValidation,
  testDatabaseOperations,
  testErrorHandling
};
