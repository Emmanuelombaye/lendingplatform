const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function deleteUsersExceptAdmin() {
  try {
    console.log('🗑️  Starting user deletion process...');
    
    // First, let's see what we have
    console.log('📊 Checking current users...');
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true
      }
    });
    
    console.log(`Found ${allUsers.length} users:`);
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
      console.log(`  🗑️  Will delete: ${user.fullName} (${user.email})`);
    });
    
    if (nonAdminUsers.length === 0) {
      console.log('\n✅ No non-admin users to delete. All done!');
      return;
    }
    
    // Get non-admin user IDs
    const nonAdminIds = nonAdminUsers.map(user => user.id);
    
    console.log('\n🔄 Deleting related data for user IDs:', nonAdminIds);
    
    // Delete in correct order due to foreign key constraints
    
    // 1. Delete notifications
    const notifResult = await prisma.notification.deleteMany({
      where: { userId: { in: nonAdminIds } }
    });
    console.log(`📧 Deleted ${notifResult.count} notifications`);
    
    // 2. Delete charges
    const chargeResult = await prisma.charge.deleteMany({
      where: { userId: { in: nonAdminIds } }
    });
    console.log(`💳 Deleted ${chargeResult.count} charges`);
    
    // 3. Delete transactions
    const transResult = await prisma.transaction.deleteMany({
      where: { userId: { in: nonAdminIds } }
    });
    console.log(`💰 Deleted ${transResult.count} transactions`);
    
    // 4. Delete applications and related data
    const appResult = await prisma.application.deleteMany({
      where: { userId: { in: nonAdminIds } }
    });
    console.log(`📋 Deleted ${appResult.count} applications`);
    
    // 5. Finally delete the users
    const userResult = await prisma.user.deleteMany({
      where: { id: { in: nonAdminIds } }
    });
    console.log(`👤 Deleted ${userResult.count} users`);
    
    console.log('\n🎉 Deletion completed successfully!');
    
    // Verify results
    const remainingUsers = await prisma.user.findMany({
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true
      }
    });
    
    console.log('\n📊 Remaining users after deletion:');
    remainingUsers.forEach(user => {
      console.log(`  ✅ ${user.fullName} (${user.email}) - Role: ${user.role}`);
    });
    
  } catch (error) {
    console.error('❌ Error during deletion:', error);
    console.error('Error details:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the deletion
deleteUsersExceptAdmin();
