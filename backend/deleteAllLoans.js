const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function deleteAllLoans() {
  console.log('🗑️  Starting to delete all loans and applications...');
  
  try {
    // Get all applications with their loans first
    const applications = await prisma.application.findMany({
      include: {
        loan: true,
        transactions: true,
        charges: true,
        notifications: true,
        repayments: true,
        documents: true,
        adminNotes: true
      }
    });

    console.log(`📊 Found ${applications.length} applications to delete`);

    // Delete all related data for each application
    for (const application of applications) {
      console.log(`🗑️  Deleting application #${application.id} for user ${application.userId}`);
      
      // Delete notifications related to this application
      await prisma.notification.deleteMany({
        where: {
          OR: [
            { loanId: application.loan?.id },
            { applicationId: application.id }
          ]
        }
      });

      // Delete charges related to this application
      await prisma.charge.deleteMany({
        where: {
          OR: [
            { loanId: application.loan?.id },
            { applicationId: application.id }
          ]
        }
      });

      // Delete transactions related to this application
      await prisma.transaction.deleteMany({
        where: {
          OR: [
            { loanId: application.loan?.id },
            { applicationId: application.id }
          ]
        }
      });

      // Delete repayments if loan exists
      if (application.loan) {
        await prisma.repayment.deleteMany({
          where: { loanId: application.loan.id }
        });

        // Delete the loan itself
        await prisma.loan.delete({
          where: { id: application.loan.id }
        });
      }

      // Delete documents
      await prisma.document.deleteMany({
        where: { applicationId: application.id }
      });

      // Delete admin notes
      await prisma.adminNote.deleteMany({
        where: { applicationId: application.id }
      });

      // Finally delete the application
      await prisma.application.delete({
        where: { id: application.id }
      });
    }

    console.log('✅ All loans and applications have been deleted successfully!');
    
    // Show remaining counts
    const remainingApplications = await prisma.application.count();
    const remainingLoans = await prisma.loan.count();
    const remainingTransactions = await prisma.transaction.count();
    const remainingCharges = await prisma.charge.count();
    const remainingRepayments = await prisma.repayment.count();
    const remainingNotifications = await prisma.notification.count();
    const remainingDocuments = await prisma.document.count();
    const remainingAdminNotes = await prisma.adminNote.count();

    console.log('\n📊 Remaining data after deletion:');
    console.log(`   Applications: ${remainingApplications}`);
    console.log(`   Loans: ${remainingLoans}`);
    console.log(`   Transactions: ${remainingTransactions}`);
    console.log(`   Charges: ${remainingCharges}`);
    console.log(`   Repayments: ${remainingRepayments}`);
    console.log(`   Notifications: ${remainingNotifications}`);
    console.log(`   Documents: ${remainingDocuments}`);
    console.log(`   Admin Notes: ${remainingAdminNotes}`);

  } catch (error) {
    console.error('❌ Error deleting loans:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the deletion
deleteAllLoans()
  .then(() => {
    console.log('🎉 Loan deletion completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Loan deletion failed:', error);
    process.exit(1);
  });
