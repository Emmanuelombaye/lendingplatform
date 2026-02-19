// Simple database test and user deletion
require('dotenv').config();

async function main() {
  console.log('🔍 Testing database connection...');
  
  try {
    // Import PrismaClient here to ensure env vars are loaded
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    // Test connection
    await prisma.$connect();
    console.log('✅ Database connected successfully');
    
    // Check users
    const userCount = await prisma.user.count();
    console.log(`📊 Found ${userCount} users`);
    
    if (userCount > 0) {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          fullName: true,
          email: true,
          role: true
        }
      });
      
      console.log('\n👥 All users:');
      users.forEach(user => {
        console.log(`  - ID: ${user.id}, Name: ${user.fullName}, Email: ${user.email}, Role: ${user.role}`);
      });
      
      // Separate admin and non-admin
      const adminUsers = users.filter(user => user.role === 'ADMIN');
      const nonAdminUsers = users.filter(user => user.role !== 'ADMIN');
      
      console.log(`\n👑 Admin users: ${adminUsers.length}`);
      console.log(`👤 Non-admin users: ${nonAdminUsers.length}`);
      
      if (nonAdminUsers.length > 0) {
        console.log('\n🗑️  Deleting non-admin users...');
        
        const nonAdminIds = nonAdminUsers.map(user => user.id);
        
        // Delete related data first
        const notifResult = await prisma.notification.deleteMany({
          where: { userId: { in: nonAdminIds } }
        });
        console.log(`📧 Deleted ${notifResult.count} notifications`);
        
        const chargeResult = await prisma.charge.deleteMany({
          where: { userId: { in: nonAdminIds } }
        });
        console.log(`💳 Deleted ${chargeResult.count} charges`);
        
        const transResult = await prisma.transaction.deleteMany({
          where: { userId: { in: nonAdminIds } }
        });
        console.log(`💰 Deleted ${transResult.count} transactions`);
        
        const appResult = await prisma.application.deleteMany({
          where: { userId: { in: nonAdminIds } }
        });
        console.log(`📋 Deleted ${appResult.count} applications`);
        
        // Delete users
        const userResult = await prisma.user.deleteMany({
          where: { id: { in: nonAdminIds } }
        });
        console.log(`👤 Deleted ${userResult.count} users`);
        
        console.log('\n✅ Deletion completed!');
        
        // Verify
        const remainingUsers = await prisma.user.findMany({
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true
          }
        });
        
        console.log('\n📊 Remaining users:');
        remainingUsers.forEach(user => {
          console.log(`  ✅ ${user.fullName} (${user.email}) - Role: ${user.role}`);
        });
      } else {
        console.log('\n✅ No non-admin users to delete');
      }
    } else {
      console.log('📭 No users found in database');
    }
    
    await prisma.$disconnect();
    console.log('\n🎉 Process completed successfully');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Full error:', error);
  }
}

main();
