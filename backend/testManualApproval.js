const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testManualApprovalWorkflow() {
  try {
    console.log('🎯 Testing Manual Approval Workflow...');
    console.log('');
    
    // Step 1: Create a test user
    console.log('📋 Step 1: Creating test user...');
    const testUser = await prisma.user.upsert({
      where: { id: 2 },
      update: {
        fullName: 'Test User Manual',
        email: 'manual@example.com',
        phone: '+1(870)962-0043',
        kycStatus: 'VERIFIED',
        isVerified: true,
        role: 'USER',
        creditScore: 550 // Lower credit score (won't auto-approve)
      },
      create: {
        fullName: 'Test User Manual',
        email: 'manual@example.com',
        phone: '+1(870)962-0043',
        passwordHash: 'hashed_password',
        kycStatus: 'PENDING',
        isVerified: false,
        role: 'USER',
        creditScore: 550
      }
    });
    
    console.log('✅ Test user created:', testUser.id);
    
    // Step 2: User applies for loan (should NOT be auto-approved)
    console.log('📋 Step 2: User applies for loan (should NOT auto-approve)...');
    const applicationData = {
      userId: testUser.id,
      loanAmount: 75000, // Above auto-approval limit
      repaymentPeriod: 12
    };
    
    console.log('📝 Application data:', applicationData);
    
    // Create application
    const application = await prisma.application.create({
      data: applicationData
    });
    
    console.log('✅ Application created:', {
      id: application.id,
      status: application.status
    });
    
    // Step 3: Check if application remains pending (should not be auto-approved)
    console.log('📋 Step 3: Checking if application remains pending...');
    
    // Wait a moment for processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Check application status
    const updatedApplication = await prisma.application.findUnique({
      where: { id: application.id }
    });
    
    console.log('📊 Application status:', {
      id: updatedApplication.id,
      status: updatedApplication.status,
      progressNote: updatedApplication.progressNote
    });
    
    // Verify application is still pending (not auto-approved)
    if (updatedApplication.status === 'SUBMITTED') {
      console.log('✅ SUCCESS: Application remains pending as expected');
      console.log('📝 Status: SUBMITTED - requires manual admin approval');
      
      // Step 4: Verify no loan was created
      console.log('📋 Step 4: Verifying no loan was created...');
      
      const createdLoan = await prisma.loan.findUnique({
        where: { applicationId: application.id }
      });
      
      if (!createdLoan) {
        console.log('✅ SUCCESS: No loan created (as expected)');
      } else {
        console.log('❌ FAILED: Loan was created when it should not have been');
      }
      
    } else {
      console.log('❌ FAILED: Application was auto-approved when it should not have been');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testManualApprovalWorkflow();
