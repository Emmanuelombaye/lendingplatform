// Test auto-approval API endpoint
const axios = require('axios');

async function testAutoApprovalAPI() {
  try {
    console.log('🧪 Testing auto-approval API...');
    
    // Test application creation
    const applicationData = {
      userId: 1,
      loanAmount: 50000,
      repaymentPeriod: 12
    };
    
    console.log('📝 Creating test application:', applicationData);
    
    // Create application (should be auto-approved)
    const response = await axios.post('http://localhost:5000/api/applications/create', applicationData);
    
    console.log('✅ Application created:', {
      success: response.data.success,
      autoApproved: response.data.data?.autoApproved,
      requiresManualApproval: response.data.data?.requiresManualApproval,
      status: response.data.data?.application?.status
    });
    
    if (response.data.success && response.data.data?.application?.status === 'APPROVED') {
      console.log('🎉 SUCCESS: Application was auto-approved!');
      console.log('📊 Loan details:', {
        applicationId: response.data.data.application.id,
        status: response.data.data.application.status,
        progressNote: response.data.data.application.progressNote
      });
    } else {
      console.log('❌ FAILED: Application was not auto-approved');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testAutoApprovalAPI();
