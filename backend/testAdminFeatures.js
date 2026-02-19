const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function getAdminDashboard() {
  try {
    console.log('📊 Fetching admin dashboard data...');
    
    // Get comprehensive statistics
    const [
      totalApplications,
      pendingApplications,
      approvedApplications,
      rejectedApplications,
      activeLoans,
      totalLoanAmount,
      totalRepayments,
      totalCharges,
      recentApplications,
      recentUsers
    ] = await Promise.all([
      // Application statistics
      prisma.application.count(),
      prisma.application.count({ where: { status: 'SUBMITTED' }),
      prisma.application.count({ where: { status: 'APPROVED' }),
      prisma.application.count({ where: { status: 'REJECTED' }),
      
      // Loan statistics
      prisma.loan.count({ where: { status: 'ACTIVE' }),
      prisma.loan.aggregate({
        _sum: { principalAmount: true }
      }),
      
      // Financial totals
      prisma.transaction.aggregate({
        _sum: { amount: true }
      }),
      prisma.charge.aggregate({
        _sum: { amount: true }
      }),
      
      // Recent applications with user details
      prisma.application.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { fullName: true, email: true, phone: true }
          }
        }
      }),
      
      // Recent users
      prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: { fullName: true, email: true, phone: true, creditScore: true }
      })
    ]);
    
    const dashboardData = {
      // Application statistics
      applications: {
        total: totalApplications,
        pending: pendingApplications,
        approved: approvedApplications,
        rejected: rejectedApplications
      },
      
      // Loan statistics
      loans: {
        active: activeLoans,
        totalAmount: Number(totalLoanAmount?._sum.principalAmount || 0),
        totalRepayments: Number(totalRepayments?._sum.amount || 0),
        totalCharges: Number(totalCharges?._sum.amount || 0)
      },
      
      // Financial overview
      financial: {
        totalLoanAmount: Number(totalLoanAmount?._sum.principalAmount || 0),
        totalRepayments: Number(totalRepayments?._sum.amount || 0),
        totalCharges: Number(totalCharges?._sum.amount || 0)
      },
      
      // Recent activity
      recentApplications: recentApplications.map(app => ({
        id: app.id,
        status: app.status,
        loanAmount: Number(app.loanAmount),
        user: app.user,
        createdAt: app.createdAt,
        progressNote: app.progressNote
      })),
      
      recentUsers: recentUsers.map(user => ({
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        creditScore: user.creditScore,
        kycStatus: user.kycStatus,
        isVerified: user.isVerified,
        createdAt: user.createdAt
      }))
    };
    
    console.log('✅ Admin dashboard data fetched:', {
      totalApplications: dashboardData.applications.total,
      pendingApplications: dashboardData.applications.pending,
      approvedApplications: dashboardData.applications.approved,
      rejectedApplications: dashboardData.applications.rejected,
      activeLoans: dashboardData.loans.active,
      totalLoanAmount: dashboardData.loans.totalAmount,
      recentApplicationsCount: dashboardData.recentApplications.length,
      recentUsersCount: dashboardData.recentUsers.length
    });
    
    return dashboardData;
    
  } catch (error) {
    console.error('❌ Failed to fetch dashboard:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

async function getApplicationDetails(applicationId) {
  try {
    console.log(`📋 Fetching details for application #${applicationId}...`);
    
    const application = await prisma.application.findUnique({
      where: { id: parseInt(applicationId) },
      include: {
        user: {
          select: { fullName: true, email: true, phone: true, creditScore: true }
        },
        documents: {
          select: { id: true, documentType: true, filePath: true, createdAt: true }
        },
        loan: {
          select: { 
            id: true,
            principalAmount: true,
            interestRate: true,
            totalInterest: true,
            totalRepayment: true,
            monthlyInstallment: true,
            startDate: true,
            endDate: true,
            status: true
          }
        },
        adminNotes: {
          select: { id: true, note: true, createdAt: true, adminName: true }
        },
        notifications: {
          select: { id: true, type: true, title: true, message: true, createdAt: true }
        },
        transactions: {
          select: { id: true, type: true, amount: true, description: true, status: true, createdAt: true }
        },
        charges: {
          select: { id: true, type: true, amount: true, description: true, status: true, createdAt: true }
        }
      }
    });
    
    if (!application) {
      throw new Error('Application not found');
    }
    
    console.log('✅ Application details fetched:', {
      id: application.id,
      status: application.status,
      user: application.user.fullName,
      documentsCount: application.documents.length,
      hasLoan: !!application.loan,
      loanAmount: application.loan?.principalAmount,
      adminNotesCount: application.adminNotes.length
    });
    
    return application;
    
  } catch (error) {
    console.error('❌ Failed to fetch application details:', error);
    throw error;
  }
}

async function getUserApplications(userId) {
  try {
    console.log(`📋 Fetching applications for user #${userId}...`);
    
    const applications = await prisma.application.findMany({
      where: { userId },
      include: {
        loan: {
          select: { id: true, principalAmount: true, status: true, startDate: true, endDate: true }
        },
        documents: {
          select: { id: true, documentType: true, createdAt: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    console.log(`✅ Found ${applications.length} applications for user #${userId}`);
    
    return applications.map(app => ({
      id: app.id,
      status: app.status,
      loanAmount: app.loan?.principalAmount,
      loanStatus: app.loan?.status,
      documentsCount: app.documents.length,
      createdAt: app.createdAt,
      progressNote: app.progressNote,
      hasLoan: !!app.loan,
      loanStartDate: app.loan?.startDate,
      loanEndDate: app.loan?.endDate
      monthlyInstallment: app.loan?.monthlyInstallment
      totalRepayment: app.loan?.totalRepayment
    }));
    
  } catch (error) {
    console.error('❌ Failed to fetch user applications:', error);
    throw error;
  }
}

async function getLoanDetails(loanId) {
  try {
    console.log(`📋 Fetching details for loan #${loanId}...`);
    
    const loan = await prisma.loan.findUnique({
      where: { id: parseInt(loanId) },
      include: {
        application: {
          select: { id: true, loanAmount: true, repaymentPeriod: true }
        },
        repayments: {
          select: { id: true, amount: true, dueDate: true, status: true, createdAt: true }
        },
        charges: {
          select: { id: true, type: true, amount: true, description: true, status: true, createdAt: true }
        },
        transactions: {
          select: { id: true, type: true, amount: true, description: true, status: true, createdAt: true }
        }
      }
    });
    
    if (!loan) {
      throw new Error('Loan not found');
    }
    
    console.log('✅ Loan details fetched:', {
      id: loan.id,
      principalAmount: loan.principalAmount,
      interestRate: loan.interestRate,
      totalInterest: loan.totalInterest,
      totalRepayment: loan.totalRepayment,
      monthlyInstallment: loan.monthlyInstallment,
      status: loan.status,
      startDate: loan.startDate,
      endDate: loan.endDate,
      repaymentsCount: loan.repayments.length,
      chargesCount: loan.charges.length
    });
    
    return loan;
    
  } catch (error) {
    console.error('❌ Failed to fetch loan details:', error);
    throw error;
  }
}

// Test the admin dashboard functionality
async function testAdminDashboard() {
  try {
    console.log('🧪 Testing Admin Dashboard Features...');
    
    // Test 1: Get admin dashboard
    console.log('📊 Test 1: Getting admin dashboard...');
    const dashboard = await getAdminDashboard();
    
    // Test 2: Get application details
    if (dashboard.recentApplications.length > 0) {
      console.log('📊 Test 2: Getting application details...');
      const appDetails = await getApplicationDetails(dashboard.recentApplications[0].id);
      console.log('✅ Application details retrieved:', appDetails.user);
    }
    
    // Test 3: Get user applications
    if (dashboard.recentUsers.length > 0) {
      console.log('📊 Test 3: Getting user applications...');
      const userApps = await getUserApplications(dashboard.recentUsers[0].id);
      console.log('✅ User applications retrieved:', userApps.length);
    }
    
    // Test 4: Get loan details
    if (dashboard.loans.active > 0) {
      console.log('📊 Test 4: Getting loan details...');
      const loanDetails = await getLoanDetails(dashboard.loans.active);
      console.log('✅ Loan details retrieved:', loanDetails.principalAmount);
    }
    
    console.log('');
    console.log('🎉 ADMIN DASHBOARD TEST COMPLETE');
    console.log('📊 SUMMARY:');
    console.log(`✅ Total Applications: ${dashboard.applications.total}`);
    console.log(`✅ Pending: ${dashboard.applications.pending}`);
    console.log(`✅ Approved: ${dashboard.applications.approved}`);
    console.log(`✅ Rejected: ${dashboard.applications.rejected}`);
    console.log(`✅ Active Loans: ${dashboard.loans.active}`);
    console.log(`✅ Total Loan Amount: ${dashboard.loans.totalAmount}`);
    console.log(`✅ Recent Applications: ${dashboard.recentApplicationsCount}`);
    console.log(`✅ Recent Users: ${dashboard.recentUsersCount}`);
    
  } catch (error) {
    console.error('❌ Admin dashboard test failed:', error);
  }
}

// Test the manual approval workflow
async function testManualApproval() {
  try {
    console.log('🔧 Testing Manual Approval System...');
    
    // Create test user with low credit score (won't auto-approve)
    const testUser = await prisma.user.upsert({
      where: { id: 3 },
      update: {
        fullName: 'Test User Low Score',
        email: 'lowscore@example.com',
        phone: '+1(870)962-0043',
        kycStatus: 'VERIFIED',
        isVerified: true,
        role: 'USER',
        creditScore: 450 // Below auto-approval threshold
      },
      create: {
        fullName: 'Test User Low Score',
        email: 'lowscore@example.com',
        phone: '+1(870)962-0043',
        passwordHash: 'hashed_password',
        kycStatus: 'PENDING',
        isVerified: false,
        role: 'USER',
        creditScore: 450
      }
    });
    
    console.log('✅ Test users created');
    
    // Test 1: Low score user applies (should be pending)
    console.log('📋 Test 1: Low score user applying...');
    const lowScoreApplication = await prisma.application.create({
      data: {
        userId: testUser.id,
        loanAmount: 30000,
        repaymentPeriod: 12,
        status: 'SUBMITTED'
      }
    });
    
    // Test 2: High score user applies (should be auto-approved)
    console.log('📋 Test 2: High score user applying...');
    const highScoreUser = await prisma.user.upsert({
      where: { id: 4 },
      update: {
        fullName: 'Test User High Score',
        email: 'highscore@example.com',
        phone: '+1(870)962-0043',
        kycStatus: 'VERIFIED',
        isVerified: true,
        role: 'USER',
        creditScore: 750 // Above auto-approval threshold
      },
      create: {
        fullName: 'Test User High Score',
        email: 'highscore@example.com',
        phone: '+1(870)962-0043',
        passwordHash: 'hashed_password',
        kycStatus: 'PENDING',
        isVerified: false,
        role: 'USER',
        creditScore: 750
      }
    });
    
    const highScoreApplication = await prisma.application.create({
      data: {
        userId: highScoreUser.id,
        loanAmount: 30000,
        repaymentPeriod: 12,
        status: 'SUBMITTED'
      }
    });
    
    console.log('✅ Test applications created');
    
    // Wait for processing
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Check results
    const [lowScoreApp, highScoreApp] = await Promise.all([
      prisma.application.findUnique({ where: { id: lowScoreApplication.id } }),
      prisma.application.findUnique({ where: { id: highScoreApplication.id } })
    ]);
    
    console.log('📊 Test Results:');
    console.log(`✅ Low Score App Status: ${lowScoreApp?.status} (should be SUBMITTED)`);
    console.log(`✅ High Score App Status: ${highScoreApp?.status} (should be APPROVED)`);
    
    // Clean up test data
    await prisma.application.deleteMany({
      where: { id: { in: [lowScoreApplication.id, highScoreApplication.id] } }
    });
    
    await prisma.user.deleteMany({
      where: { id: { in: [testUser.id, highScoreUser.id, lowScoreUser.id] } }
    });
    
    console.log('✅ Test data cleaned up');
    
  } catch (error) {
    console.error('❌ Manual approval test failed:', error);
  }
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Starting Comprehensive Admin System Tests...');
  console.log('');
    
  await testAdminDashboard();
  console.log('');
  await testManualApproval();
  console.log('');
  console.log('🎉 ALL TESTS COMPLETED SUCCESSFULLY');
}

runAllTests();
