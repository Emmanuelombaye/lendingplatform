const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function scanDatabase() {
  console.log('🔍 SCANNING DATABASE STRUCTURE AND DATA...\n');

  try {
    // Get all table counts
    const userCount = await prisma.user.count();
    const applicationCount = await prisma.application.count();
    const loanCount = await prisma.loan.count();
    const transactionCount = await prisma.transaction.count();
    const chargeCount = await prisma.charge.count();
    const notificationCount = await prisma.notification.count();
    const repaymentCount = await prisma.repayment.count();
    const documentCount = await prisma.document.count();
    const settingsCount = await prisma.settings.count();

    console.log('📊 DATABASE OVERVIEW:');
    console.log(`   Users: ${userCount}`);
    console.log(`   Applications: ${applicationCount}`);
    console.log(`   Loans: ${loanCount}`);
    console.log(`   Transactions: ${transactionCount}`);
    console.log(`   Charges: ${chargeCount}`);
    console.log(`   Notifications: ${notificationCount}`);
    console.log(`   Repayments: ${repaymentCount}`);
    console.log(`   Documents: ${documentCount}`);
    console.log(`   Settings: ${settingsCount}\n`);

    // Get all users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        role: true,
        kycStatus: true,
        isVerified: true,
        creditScore: true,
        createdAt: true
      }
    });

    console.log('👥 USERS:');
    users.forEach((user, i) => {
      console.log(`   ${i + 1}. ${user.fullName} (${user.role})`);
      console.log(`      Email: ${user.email}`);
      console.log(`      Phone: ${user.phone}`);
      console.log(`      KYC: ${user.kycStatus} | Verified: ${user.isVerified}`);
      console.log(`      Credit Score: ${user.creditScore}`);
      console.log(`      Created: ${user.createdAt.toISOString().split('T')[0]}\n`);
    });

    // Get all applications
    const applications = await prisma.application.findMany({
      select: {
        id: true,
        userId: true,
        loanAmount: true,
        repaymentPeriod: true,
        status: true,
        processingFeePaid: true,
        processingProgress: true,
        progressNote: true,
        createdAt: true
      }
    });

    console.log('📋 APPLICATIONS:');
    applications.forEach((app, i) => {
      console.log(`   ${i + 1}. Application #${app.id}`);
      console.log(`      User ID: ${app.userId}`);
      console.log(`      Amount: KES ${Number(app.loanAmount).toLocaleString()}`);
      console.log(`      Period: ${app.repaymentPeriod} months`);
      console.log(`      Status: ${app.status}`);
      console.log(`      Processing Fee Paid: ${app.processingFeePaid ? 'Yes' : 'No'}`);
      console.log(`      Progress: ${app.processingProgress}%`);
      if (app.progressNote) console.log(`      Note: ${app.progressNote}`);
      console.log(`      Created: ${app.createdAt.toISOString().split('T')[0]}\n`);
    });

    // Get all loans
    const loans = await prisma.loan.findMany({
      select: {
        id: true,
        applicationId: true,
        principalAmount: true,
        interestRate: true,
        totalInterest: true,
        totalRepayment: true,
        monthlyInstallment: true,
        status: true,
        startDate: true,
        endDate: true
      }
    });

    console.log('💰 LOANS:');
    loans.forEach((loan, i) => {
      console.log(`   ${i + 1}. Loan #${loan.id} (App #${loan.applicationId})`);
      console.log(`      Principal: KES ${Number(loan.principalAmount).toLocaleString()}`);
      console.log(`      Interest Rate: ${loan.interestRate}%`);
      console.log(`      Total Interest: KES ${Number(loan.totalInterest).toLocaleString()}`);
      console.log(`      Total Repayment: KES ${Number(loan.totalRepayment).toLocaleString()}`);
      console.log(`      Monthly: KES ${Number(loan.monthlyInstallment).toLocaleString()}`);
      console.log(`      Status: ${loan.status}`);
      console.log(`      Period: ${loan.startDate.toISOString().split('T')[0]} - ${loan.endDate.toISOString().split('T')[0]}\n`);
    });

    // Get recent transactions
    const transactions = await prisma.transaction.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        userId: true,
        loanId: true,
        type: true,
        amount: true,
        description: true,
        status: true,
        createdAt: true
      }
    });

    console.log('💳 RECENT TRANSACTIONS:');
    transactions.forEach((txn, i) => {
      console.log(`   ${i + 1}. ${txn.type} - ${txn.status}`);
      console.log(`      Amount: KES ${Number(txn.amount).toLocaleString()}`);
      console.log(`      Description: ${txn.description}`);
      console.log(`      User ID: ${txn.userId} | Loan ID: ${txn.loanId || 'N/A'}`);
      console.log(`      Date: ${txn.createdAt.toISOString().split('T')[0]}\n`);
    });

    // Get charges
    const charges = await prisma.charge.findMany({
      select: {
        id: true,
        userId: true,
        loanId: true,
        type: true,
        amount: true,
        description: true,
        status: true,
        dueDate: true,
        paidDate: true,
        createdAt: true
      }
    });

    console.log('📄 CHARGES:');
    charges.forEach((charge, i) => {
      console.log(`   ${i + 1}. ${charge.type} - ${charge.status}`);
      console.log(`      Amount: KES ${Number(charge.amount).toLocaleString()}`);
      console.log(`      Description: ${charge.description}`);
      console.log(`      User ID: ${charge.userId} | Loan ID: ${charge.loanId || 'N/A'}`);
      console.log(`      Due: ${charge.dueDate ? charge.dueDate.toISOString().split('T')[0] : 'N/A'}`);
      console.log(`      Paid: ${charge.paidDate ? charge.paidDate.toISOString().split('T')[0] : 'Unpaid'}`);
      console.log(`      Created: ${charge.createdAt.toISOString().split('T')[0]}\n`);
    });

    // Get settings
    const settings = await prisma.settings.findFirst();
    if (settings) {
      console.log('⚙️ SYSTEM SETTINGS:');
      console.log(`   Interest Rate: ${settings.interestRateDefault}%`);
      console.log(`   Processing Fee: ${settings.processingFeePercent}%`);
      console.log(`   Min Loan: KES ${Number(settings.minLoan).toLocaleString()}`);
      console.log(`   Max Loan: KES ${Number(settings.maxLoan).toLocaleString()}`);
      console.log(`   Max Months: ${settings.maxMonths}\n`);
    }

  } catch (error) {
    console.error('❌ Error scanning database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

scanDatabase();
