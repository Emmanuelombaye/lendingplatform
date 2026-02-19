// Comprehensive user deletion script
console.log('🗑️  Starting comprehensive user deletion process...');

// Load environment variables
require('dotenv').config();

async function deleteAllUsersExceptAdmin() {
  let prisma;
  
  try {
    console.log('📋 Environment variables:');
    console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
    console.log('NODE_ENV:', process.env.NODE_ENV);
    
    // Initialize Prisma client
    const { PrismaClient } = require('@prisma/client');
    prisma = new PrismaClient();
    
    console.log('🔌 Connecting to database...');
    await prisma.$connect();
    console.log('✅ Database connected successfully');
    
    // Get all users
    console.log('📊 Fetching all users...');
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        createdAt: true
      }
    });
    
    console.log(`👥 Found ${allUsers.length} total users:`);
    allUsers.forEach(user => {
      console.log(`  - ID: ${user.id}, Name: ${user.fullName}, Email: ${user.email}, Role: ${user.role}`);
    });
    
    // Separate admin and non-admin users
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
      console.log('\n✅ No non-admin users to delete. Process completed!');
      return;
    }
    
    // Get non-admin user IDs
    const nonAdminIds = nonAdminUsers.map(user => user.id);
    console.log('\n🔄 Deleting related data for user IDs:', nonAdminIds);
    
    // Delete in correct order due to foreign key constraints
    const deletionResults = {};
    
    // 1. Delete notifications
    try {
      const result = await prisma.notification.deleteMany({
        where: { userId: { in: nonAdminIds } }
      });
      deletionResults.notifications = result.count;
      console.log(`📧 Deleted ${result.count} notifications`);
    } catch (error) {
      console.log('⚠️  Could not delete notifications:', error.message);
      deletionResults.notifications = 0;
    }
    
    // 2. Delete charges
    try {
      const result = await prisma.charge.deleteMany({
        where: { userId: { in: nonAdminIds } }
      });
      deletionResults.charges = result.count;
      console.log(`💳 Deleted ${result.count} charges`);
    } catch (error) {
      console.log('⚠️  Could not delete charges:', error.message);
      deletionResults.charges = 0;
    }
    
    // 3. Delete transactions
    try {
      const result = await prisma.transaction.deleteMany({
        where: { userId: { in: nonAdminIds } }
      });
      deletionResults.transactions = result.count;
      console.log(`💰 Deleted ${result.count} transactions`);
    } catch (error) {
      console.log('⚠️  Could not delete transactions:', error.message);
      deletionResults.transactions = 0;
    }
    
    // 4. Delete applications (this will cascade delete related data)
    try {
      const result = await prisma.application.deleteMany({
        where: { userId: { in: nonAdminIds } }
      });
      deletionResults.applications = result.count;
      console.log(`📋 Deleted ${result.count} applications`);
    } catch (error) {
      console.log('⚠️  Could not delete applications:', error.message);
      deletionResults.applications = 0;
    }
    
    // 5. Finally delete the users
    try {
      const result = await prisma.user.deleteMany({
        where: { id: { in: nonAdminIds } }
      });
      deletionResults.users = result.count;
      console.log(`👤 Deleted ${result.count} users`);
    } catch (error) {
      console.log('⚠️  Could not delete users:', error.message);
      deletionResults.users = 0;
    }
    
    console.log('\n🎉 Deletion process completed!');
    console.log('📊 Summary:');
    console.log(`  📧 Notifications: ${deletionResults.notifications}`);
    console.log(`  💳 Charges: ${deletionResults.charges}`);
    console.log(`  💰 Transactions: ${deletionResults.transactions}`);
    console.log(`  📋 Applications: ${deletionResults.applications}`);
    console.log(`  👤 Users: ${deletionResults.users}`);
    
    // Verify remaining users
    console.log('\n🔍 Verifying remaining users...');
    const remainingUsers = await prisma.user.findMany({
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true
      }
    });
    
    console.log(`📊 Remaining users: ${remainingUsers.length}`);
    remainingUsers.forEach(user => {
      console.log(`  ✅ ${user.fullName} (${user.email}) - Role: ${user.role}`);
    });
    
    // Check database stats
    console.log('\n📊 Database statistics after cleanup:');
    const stats = await Promise.all([
      prisma.user.count(),
      prisma.application.count(),
      prisma.loan.count(),
      prisma.transaction.count(),
      prisma.charge.count(),
      prisma.notification.count()
    ]);
    
    console.log(`  👥 Users: ${stats[0]}`);
    console.log(`  📋 Applications: ${stats[1]}`);
    console.log(`  🏦 Loans: ${stats[2]}`);
    console.log(`  💰 Transactions: ${stats[3]}`);
    console.log(`  💳 Charges: ${stats[4]}`);
    console.log(`  📧 Notifications: ${stats[5]}`);
    
  } catch (error) {
    console.error('❌ Error during deletion process:', error);
    console.error('Error details:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    if (prisma) {
      await prisma.$disconnect();
      console.log('\n🔌 Database connection closed');
    }
  }
}

// Run the deletion
deleteAllUsersExceptAdmin()
  .then(() => {
    console.log('\n✅ User deletion process completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ User deletion process failed:', error);
    process.exit(1);
  });
