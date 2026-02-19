const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function deleteAllUsersExceptAdmin() {
  try {
    console.log('🗑️  Starting user cleanup - deleting all users except admin...');
    
    // Step 1: Find all users
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        createdAt: true
      }
    });
    
    console.log(`📊 Found ${allUsers.length} total users:`);
    allUsers.forEach(user => {
      console.log(`  - ID: ${user.id}, Name: ${user.fullName}, Email: ${user.email}, Role: ${user.role}`);
    });
    
    // Step 2: Identify admin users to keep
    const adminUsers = allUsers.filter(user => user.role === 'ADMIN');
    const nonAdminUsers = allUsers.filter(user => user.role !== 'ADMIN');
    
    console.log(`\n👑 Admin users to keep: ${adminUsers.length}`);
    adminUsers.forEach(admin => {
      console.log(`  ✅ Keeping: ${admin.fullName} (${admin.email})`);
    });
    
    console.log(`\n👤 Non-admin users to delete: ${nonAdminUsers.length}`);
    nonAdminUsers.forEach(user => {
      console.log(`  🗑️  Deleting: ${user.fullName} (${user.email})`);
    });
    
    if (nonAdminUsers.length === 0) {
      console.log('\n✅ No non-admin users to delete. All done!');
      return;
    }
    
    // Step 3: Get all non-admin user IDs
    const nonAdminUserIds = nonAdminUsers.map(user => user.id);
    
    // Step 4: Delete related data in correct order (due to foreign key constraints)
    console.log('\n🔄 Deleting related data...');
    
    // Delete notifications
    const deletedNotifications = await prisma.notification.deleteMany({
      where: {
        userId: { in: nonAdminUserIds }
      }
    });
    console.log(`📧 Deleted ${deletedNotifications.count} notifications`);
    
    // Delete charges
    const deletedCharges = await prisma.charge.deleteMany({
      where: {
        userId: { in: nonAdminUserIds }
      }
    });
    console.log(`💳 Deleted ${deletedCharges.count} charges`);
    
    // Delete transactions
    const deletedTransactions = await prisma.transaction.deleteMany({
      where: {
        userId: { in: nonAdminUserIds }
      }
    });
    console.log(`💰 Deleted ${deletedTransactions.count} transactions`);
    
    // Delete repayments (through loans)
    const userLoans = await prisma.loan.findMany({
      where: {
        application: {
          userId: { in: nonAdminUserIds }
        }
      },
      select: { id: true }
    });
    
    if (userLoans.length > 0) {
      const loanIds = userLoans.map(loan => loan.id);
      
      // Delete repayments
      const deletedRepayments = await prisma.repayment.deleteMany({
        where: {
          loanId: { in: loanIds }
        }
      });
      console.log(`💸 Deleted ${deletedRepayments.count} repayments`);
      
      // Delete loans
      const deletedLoans = await prisma.loan.deleteMany({
        where: {
          application: {
            userId: { in: nonAdminUserIds }
          }
        }
      });
      console.log(`🏦 Deleted ${deletedLoans.count} loans`);
    }
    
    // Delete admin notes
    const deletedAdminNotes = await prisma.adminNote.deleteMany({
      where: {
        application: {
          userId: { in: nonAdminUserIds }
        }
      }
    });
    console.log(`📝 Deleted ${deletedAdminNotes.count} admin notes`);
    
    // Delete documents
    const deletedDocuments = await prisma.document.deleteMany({
      where: {
        application: {
          userId: { in: nonAdminUserIds }
        }
      }
    });
    console.log(`📄 Deleted ${deletedDocuments.count} documents`);
    
    // Delete applications
    const deletedApplications = await prisma.application.deleteMany({
      where: {
        userId: { in: nonAdminUserIds }
      }
    });
    console.log(`📋 Deleted ${deletedApplications.count} applications`);
    
    // Step 5: Finally delete the users
    const deletedUsers = await prisma.user.deleteMany({
      where: {
        id: { in: nonAdminUserIds }
      }
    });
    console.log(`👤 Deleted ${deletedUsers.count} users`);
    
    console.log('\n🎉 Cleanup completed successfully!');
    console.log(`✅ Deleted ${nonAdminUsers.length} non-admin users and all their related data`);
    console.log(`✅ Kept ${adminUsers.length} admin users`);
    
    // Step 6: Verify cleanup
    const remainingUsers = await prisma.user.findMany({
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true
      }
    });
    
    console.log('\n📊 Remaining users after cleanup:');
    remainingUsers.forEach(user => {
      console.log(`  ✅ ${user.fullName} (${user.email}) - Role: ${user.role}`);
    });
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the cleanup
deleteAllUsersExceptAdmin()
  .then(() => {
    console.log('\n✅ User cleanup process completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ User cleanup process failed:', error);
    process.exit(1);
  });
