const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testAutoApproval() {
  try {
    console.log('🧪 Testing auto-approval system...');
    
    // Get current settings
    const settings = await prisma.settings.findFirst();
    console.log('📊 Current Settings:', {
      autoApprovalEnabled: settings?.autoApprovalEnabled,
      minCreditScore: settings?.minCreditScore,
      maxLoanAmount: settings?.maxLoanAmount,
      minRepaymentHistory: settings?.minRepaymentHistory
    });
    
    // Create a test application
    const testApplication = await prisma.application.create({
      data: {
        userId: 1, // Assuming user ID 1 exists
        loanAmount: 50000,
        repaymentPeriod: 12,
        status: 'APPROVED', // Should be auto-approved
        progressNote: 'Auto-approved by system - no manual approval required'
      }
    });
    
    console.log('✅ Test application created:', {
      id: testApplication.id,
      status: testApplication.status,
      loanAmount: testApplication.loanAmount,
      progressNote: testApplication.progressNote
    });
    
    // Verify the loan was created automatically
    const createdLoan = await prisma.loan.findUnique({
      where: { applicationId: testApplication.id }
    });
    
    if (createdLoan) {
      console.log('🎉 SUCCESS: Loan was automatically created!', {
        loanId: createdLoan.id,
        principalAmount: createdLoan.principalAmount,
        status: createdLoan.status
      });
    } else {
      console.log('❌ FAILED: Loan was not created automatically');
    }
    
    // Test notification
    const notification = await prisma.notification.findFirst({
      where: { loanId: testApplication.id }
    });
    
    if (notification) {
      console.log('📧 SUCCESS: Notification was created!', {
        title: notification.title,
        type: notification.type
      });
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAutoApproval();
