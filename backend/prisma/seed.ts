import prisma from "../src/utils/prisma";
import bcrypt from "bcrypt";

async function seed() {
  console.log("🌱 Seeding database...");

  // Create admin user
  const adminEmail = "vertex@loans.com";
  const adminPassword = "@Kenya90!132323";
  const salt = await bcrypt.genSalt(10);
  const adminPasswordHash = await bcrypt.hash(adminPassword, salt);

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (existingAdmin) {
    await prisma.user.update({
      where: { email: adminEmail },
      data: {
        passwordHash: adminPasswordHash,
        role: "ADMIN",
        fullName: "Vertex Admin",
      },
    });
    console.log("✅ Admin user updated");
  } else {
    await prisma.user.create({
      data: {
        fullName: "Vertex Admin",
        email: adminEmail,
        passwordHash: adminPasswordHash,
        role: "ADMIN",
      },
    });
    console.log("✅ Admin user created");
  }

  // Create sample user with complete data
  const userEmail = "john.doe@example.com";
  const userPassword = "password123";
  const userPasswordHash = await bcrypt.hash(userPassword, salt);

  let sampleUser = await prisma.user.findUnique({
    where: { email: userEmail },
  });

  if (!sampleUser) {
    sampleUser = await prisma.user.create({
      data: {
        fullName: "John Doe Mwangi",
        email: userEmail,
        phone: "+254712345678",
        passwordHash: userPasswordHash,
        role: "USER",
        kycStatus: "VERIFIED",
        isVerified: true,
        bankName: "KCB Bank",
        accountNumber: "1234567890",
        payBill: "522522",
      },
    });
    console.log("✅ Sample user created");
  }

  // Create loan application
  let application = await prisma.application.findFirst({
    where: { userId: sampleUser.id },
  });

  if (!application) {
    application = await prisma.application.create({
      data: {
        userId: sampleUser.id,
        loanAmount: 150000,
        repaymentPeriod: 6,
        status: "APPROVED",
        processingFeePaid: true,
        processingProgress: 100,
        progressNote: "Loan approved and disbursed successfully",
        createdAt: new Date("2024-01-15"),
        updatedAt: new Date("2024-01-16"),
      },
    });
    console.log("✅ Sample application created");
  }

  // Create active loan
  let loan = await prisma.loan.findFirst({
    where: { applicationId: application.id },
  });

  if (!loan) {
    const startDate = new Date("2024-01-16");
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + application.repaymentPeriod);

    loan = await prisma.loan.create({
      data: {
        applicationId: application.id,
        principalAmount: 150000,
        interestRate: 6.0,
        totalInterest: 39000,
        totalRepayment: 189000,
        monthlyInstallment: 31500,
        startDate: startDate,
        endDate: endDate,
        status: "ACTIVE",
      },
    });
    console.log("✅ Sample loan created");
  }

  // Create repayments
  const existingRepayments = await prisma.repayment.findMany({
    where: { loanId: loan.id },
  });

  if (existingRepayments.length === 0) {
    const repayments = [
      {
        loanId: loan.id,
        amountPaid: 31500,
        paymentDate: new Date("2024-02-16"),
        remainingBalance: 157500,
        status: "PAID" as const,
      },
      {
        loanId: loan.id,
        amountPaid: 31500,
        paymentDate: new Date("2024-03-16"),
        remainingBalance: 126000,
        status: "PAID" as const,
      },
      {
        loanId: loan.id,
        amountPaid: 31500,
        paymentDate: new Date("2024-04-16"),
        remainingBalance: 94500,
        status: "PAID" as const,
      },
    ];

    for (const repayment of repayments) {
      await prisma.repayment.create({ data: repayment });
    }
    console.log("✅ Sample repayments created");
  }

  // Create transactions
  const existingTransactions = await prisma.transaction.findMany({
    where: { userId: sampleUser.id },
  });

  if (existingTransactions.length === 0) {
    const transactions = [
      {
        userId: sampleUser.id,
        loanId: loan.id,
        type: "DISBURSEMENT" as const,
        amount: 150000,
        description: "Loan Disbursement - Application #" + application.id,
        status: "COMPLETED" as const,
        transactionId: "DISB-" + Date.now(),
        createdAt: new Date("2024-01-16"),
      },
      {
        userId: sampleUser.id,
        loanId: loan.id,
        type: "PROCESSING_FEE" as const,
        amount: 9750,
        description: "Processing Fee - 6.5% of loan amount",
        status: "COMPLETED" as const,
        transactionId: "FEE-" + (Date.now() + 1),
        createdAt: new Date("2024-01-15"),
      },
      {
        userId: sampleUser.id,
        loanId: loan.id,
        type: "PAYMENT" as const,
        amount: 31500,
        description: "Monthly Payment - February 2024",
        status: "COMPLETED" as const,
        transactionId: "PAY-" + (Date.now() + 2),
        createdAt: new Date("2024-02-16"),
      },
      {
        userId: sampleUser.id,
        loanId: loan.id,
        type: "PAYMENT" as const,
        amount: 31500,
        description: "Monthly Payment - March 2024",
        status: "COMPLETED" as const,
        transactionId: "PAY-" + (Date.now() + 3),
        createdAt: new Date("2024-03-16"),
      },
      {
        userId: sampleUser.id,
        loanId: loan.id,
        type: "PAYMENT" as const,
        amount: 31500,
        description: "Monthly Payment - April 2024",
        status: "COMPLETED" as const,
        transactionId: "PAY-" + (Date.now() + 4),
        createdAt: new Date("2024-04-16"),
      },
      {
        userId: sampleUser.id,
        loanId: loan.id,
        type: "SERVICE_FEE" as const,
        amount: 500,
        description: "Monthly Service Fee - Account Maintenance",
        status: "COMPLETED" as const,
        transactionId: "SRV-" + (Date.now() + 5),
        createdAt: new Date("2024-04-01"),
      },
    ];

    for (const transaction of transactions) {
      await prisma.transaction.create({ data: transaction });
    }
    console.log("✅ Sample transactions created");
  }

  // Create charges
  const existingCharges = await prisma.charge.findMany({
    where: { userId: sampleUser.id },
  });

  if (existingCharges.length === 0) {
    const charges = [
      {
        userId: sampleUser.id,
        loanId: loan.id,
        type: "PROCESSING_FEE" as const,
        amount: 9750,
        description: "Loan Processing Fee - Application #" + application.id,
        status: "PAID" as const,
        dueDate: new Date("2024-01-15"),
        paidDate: new Date("2024-01-15"),
        createdAt: new Date("2024-01-15"),
      },
      {
        userId: sampleUser.id,
        loanId: loan.id,
        type: "SERVICE_FEE" as const,
        amount: 500,
        description: "Monthly Service Fee - Account Maintenance",
        status: "PAID" as const,
        dueDate: new Date("2024-04-01"),
        paidDate: new Date("2024-04-01"),
        createdAt: new Date("2024-03-25"),
      },
      {
        userId: sampleUser.id,
        loanId: loan.id,
        type: "SERVICE_FEE" as const,
        amount: 500,
        description: "Monthly Service Fee - May 2024",
        status: "PENDING" as const,
        dueDate: new Date("2024-05-01"),
        createdAt: new Date("2024-04-25"),
      },
    ];

    for (const charge of charges) {
      await prisma.charge.create({ data: charge });
    }
    console.log("✅ Sample charges created");
  }

  // Create notifications
  const existingNotifications = await prisma.notification.findMany({
    where: { userId: sampleUser.id },
  });

  if (existingNotifications.length === 0) {
    const notifications = [
      {
        userId: sampleUser.id,
        loanId: loan.id,
        type: "LOAN_APPROVED" as const,
        title: "🎉 Loan Approved!",
        message:
          "Congratulations! Your loan of KES 150,000 has been approved. Funds will be disbursed within 24 hours.",
        read: false,
        actionUrl: "/dashboard",
        persistent: true,
        createdAt: new Date(Date.now() - 3600000), // 1 hour ago
      },
      {
        userId: sampleUser.id,
        loanId: loan.id,
        type: "FEE_CHARGED" as const,
        title: "Processing Fee Charged",
        message:
          "A processing fee of KES 9,750 has been charged to your account for loan #" +
          application.id +
          ".",
        read: false,
        actionUrl: "/dashboard",
        persistent: false,
        createdAt: new Date(Date.now() - 7200000), // 2 hours ago
      },
      {
        userId: sampleUser.id,
        loanId: loan.id,
        type: "PAYMENT_RECEIVED" as const,
        title: "Payment Received",
        message:
          "Thank you! Your payment of KES 31,500 has been processed successfully.",
        read: true,
        actionUrl: "/dashboard",
        persistent: false,
        createdAt: new Date(Date.now() - 172800000), // 2 days ago
      },
      {
        userId: sampleUser.id,
        loanId: loan.id,
        type: "PAYMENT_REMINDER" as const,
        title: "Payment Reminder",
        message:
          "Your next payment of KES 31,500 is due on May 16, 2024. Please make your payment on time to avoid late fees.",
        read: true,
        actionUrl: "/dashboard",
        persistent: false,
        createdAt: new Date(Date.now() - 259200000), // 3 days ago
      },
      {
        userId: sampleUser.id,
        type: "INFO" as const,
        title: "Credit Score Update",
        message:
          "Great news! Your credit score has improved by 15 points this month. Keep up the good work!",
        read: false,
        actionUrl: "/dashboard",
        persistent: false,
        createdAt: new Date(Date.now() - 432000000), // 5 days ago
      },
    ];

    for (const notification of notifications) {
      await prisma.notification.create({ data: notification });
    }
    console.log("✅ Sample notifications created");
  }

  // Seed default settings if not exist
  const settings = await prisma.settings.findFirst();
  if (!settings) {
    await prisma.settings.create({
      data: {
        interestRateDefault: 6.0,
        processingFeePercent: 6.5,
        minLoan: 5000,
        maxLoan: 1000000,
        maxMonths: 24,
        supportPhone: "+1(870)962-0043",
        supportEmail: "support@getvertexloans.com",
      },
    });
    console.log("✅ Default settings created");
  }

  console.log("🎉 Seeding complete!");
  console.log("");
  console.log("👤 Admin User:");
  console.log(`   Email: ${adminEmail}`);
  console.log(`   Password: ${adminPassword}`);
  console.log("");
  console.log("👤 Sample User:");
  console.log(`   Email: ${userEmail}`);
  console.log(`   Password: ${userPassword}`);
  console.log(`   Active Loan: KES 150,000 (63% paid)`);
  console.log(`   Total Charges Paid: KES 10,250`);
  console.log(`   Credit Score: 720`);
  console.log("");

  await prisma.$disconnect();
}

seed().catch((e) => {
  console.error("❌ Seed failed:", e);
  prisma.$disconnect();
  process.exit(1);
});
