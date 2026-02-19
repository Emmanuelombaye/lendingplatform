// Test database connection and delete users
console.log('🔍 Starting user deletion process...');

// Check environment
console.log('📋 Environment check:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
console.log('DATABASE_URL length:', process.env.DATABASE_URL?.length || 0);

// Try to connect to database
try {
  const { PrismaClient } = require('@prisma/client');
  
  // Create client with explicit database URL if needed
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL || 'mysql://root:@localhost:3306/vertexloans'
      }
    }
  });
  
  console.log('🔌 Prisma client created');
  
  // Test connection
  prisma.$connect()
    .then(() => {
      console.log('✅ Database connected successfully');
      
      // Get user count
      return prisma.user.count();
    })
    .then(userCount => {
      console.log(`📊 Found ${userCount} users`);
      
      if (userCount > 0) {
        return prisma.user.findMany({
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true
          }
        });
      } else {
        console.log('📭 No users found');
        return [];
      }
    })
    .then(users => {
      if (users.length > 0) {
        console.log('\n👥 All users:');
        users.forEach(user => {
          console.log(`  - ID: ${user.id}, Name: ${user.fullName}, Email: ${user.email}, Role: ${user.role}`);
        });
        
        // Separate admin and non-admin
        const adminUsers = users.filter(user => user.role === 'ADMIN');
        const nonAdminUsers = users.filter(user => user.role !== 'ADMIN');
        
        console.log(`\n👑 Admin users to keep: ${adminUsers.length}`);
        adminUsers.forEach(admin => {
          console.log(`  ✅ Keeping: ${admin.fullName} (${admin.email})`);
        });
        
        console.log(`\n👤 Non-admin users to delete: ${nonAdminUsers.length}`);
        nonAdminUsers.forEach(user => {
          console.log(`  🗑️  Will delete: ${user.fullName} (${user.email})`);
        });
        
        if (nonAdminUsers.length > 0) {
          const nonAdminIds = nonAdminUsers.map(user => user.id);
          
          // Delete in sequence
          return Promise.all([
            prisma.notification.deleteMany({ where: { userId: { in: nonAdminIds } } }),
            prisma.charge.deleteMany({ where: { userId: { in: nonAdminIds } } }),
            prisma.transaction.deleteMany({ where: { userId: { in: nonAdminIds } } }),
            prisma.application.deleteMany({ where: { userId: { in: nonAdminIds } } }),
            prisma.user.deleteMany({ where: { id: { in: nonAdminIds } } })
          ]);
        }
      }
    })
    .then(results => {
      if (results) {
        console.log('\n🗑️  Deletion results:');
        console.log(`📧 Notifications deleted: ${results[0].count}`);
        console.log(`💳 Charges deleted: ${results[1].count}`);
        console.log(`💰 Transactions deleted: ${results[2].count}`);
        console.log(`📋 Applications deleted: ${results[3].count}`);
        console.log(`👤 Users deleted: ${results[4].count}`);
      }
      
      // Verify remaining users
      return prisma.user.findMany({
        select: {
          id: true,
          fullName: true,
          email: true,
          role: true
        }
      });
    })
    .then(remainingUsers => {
      console.log('\n📊 Remaining users after deletion:');
      remainingUsers.forEach(user => {
        console.log(`  ✅ ${user.fullName} (${user.email}) - Role: ${user.role}`);
      });
      
      console.log('\n🎉 User deletion completed successfully!');
    })
    .catch(error => {
      console.error('❌ Error:', error.message);
      console.error('Full error:', error);
    })
    .finally(() => {
      prisma.$disconnect();
      console.log('🔌 Database connection closed');
    });
    
} catch (error) {
  console.error('❌ Failed to create Prisma client:', error.message);
}
