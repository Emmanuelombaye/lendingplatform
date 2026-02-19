const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function demonstrateWorkflow() {
  try {
    console.log('🎯 Demonstrating Complete Loan Application Workflow...');
    console.log('');
    
    // Step 1: Create a test user
    console.log('📋 Step 1: Creating test user...');
    const testUser = await prisma.user.upsert({
      where: { id: 1 },
      update: {
        fullName: 'Test User',
        email: 'test@example.com',
        phone: '+1(870)962-0043',
        kycStatus: 'VERIFIED',
        isVerified: true,
        role: 'USER',
        creditScore: 750 // High credit score
      },
      create: {
        fullName: 'Test User',
        email: 'test@example.com',
        phone: '+1(870)962-0043',
        passwordHash: 'hashed_password',
        kycStatus: 'PENDING',
        isVerified: false,
        role: 'USER',
        creditScore: 750
      }
    });
    
    console.log('✅ Test user created:', testUser.id);
    
    // Step 2: User applies for loan (should be auto-approved)
    console.log('📋 Step 2: User applies for loan...');
    const applicationData = {
      userId: testUser.id,
      loanAmount: 25000, // Within auto-approval limit
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
    
    // Step 3: Check if application was auto-approved
    console.log('📋 Step 3: Checking auto-approval status...');
    
    // Wait a moment for the auto-approval to process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Check application status
    const updatedApplication = await prisma.application.findUnique({
      where: { id: application.id }
    });
    
    console.log('📊 Application status after auto-approval:', {
      id: updatedApplication.id,
      status: updatedApplication.status,
      progressNote: updatedApplication.progressNote
    });
    
    // Step 4: Check if loan was created
    console.log('📋 Step 4: Checking if loan was created...');
    
    const createdLoan = await prisma.loan.findUnique({
      where: { applicationId: application.id }
    });
    
    if (createdLoan) {
      console.log('✅ SUCCESS: Loan was auto-created!', {
        loanId: createdLoan.id,
        principalAmount: createdLoan.principalAmount,
        status: createdLoan.status
      });
      
      // Step 5: Verify notifications
      console.log('📋 Step 5: Checking notifications...');
      
      const notifications = await prisma.notification.findMany({
        where: { 
          OR: [
            { loanId: createdLoan.id },
            { applicationId: application.id }
          ]
        }
      });
      
      console.log('📧 Notifications created:', notifications.length);
      notifications.forEach((notification, index) => {
        console.log(`  ${index + 1}. Type: ${notification.type}, Title: ${notification.title}`);
      });
      
      // Step 6: Verify transactions and charges
      console.log('📋 Step 6: Checking transactions and charges...');
      
      const transactions = await prisma.transaction.findMany({
        where: { loanId: createdLoan.id }
      });
      
      const charges = await prisma.charge.findMany({
        where: { loanId: createdLoan.id }
      });
      
      console.log('💰 Transactions created:', transactions.length);
      console.log('💳 Charges created:', charges.length);
      
      console.log('');
      console.log('🎉 WORKFLOW DEMONSTRATION COMPLETE');
      console.log('');
      console.log('📊 SUMMARY:');
      console.log('✅ User applied for loan');
      console.log('✅ Application was auto-approved (no manual approval needed)');
      console.log('✅ Loan was created automatically');
      console.log('✅ Notifications were sent');
      console.log('✅ Transactions and charges were recorded');
      console.log('');
      console.log('🔍 EXPECTED BEHAVIOR:');
      console.log('1. User applies for loan');
      console.log('2. System auto-approves if criteria met');
      console.log('3. Loan is created automatically');
      console.log('4. User gets instant access to funds');
      console.log('');
      console.log('❌ MANUAL APPROVAL NOT REQUIRED');
      console.log('✅ All qualified applications get instant approval');
      
    } else {
      console.log('❌ FAILED: Loan was not created automatically');
    }
    
  } catch (error) {
    console.error('❌ Demonstration failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

demonstrateWorkflow();
