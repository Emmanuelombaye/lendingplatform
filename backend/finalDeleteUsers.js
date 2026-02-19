// Final comprehensive user deletion script
console.log('='.repeat(60));
console.log('🗑️  STARTING USER DELETION PROCESS');
console.log('='.repeat(60));

const fs = require('fs');
const path = require('path');

// Create log file
const logPath = path.join(__dirname, 'user_deletion_log.txt');
const log = (message) => {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  console.log(message);
  fs.appendFileSync(logPath, logMessage);
};

log('Script initialized');

try {
  // Load environment
  require('dotenv').config();
  log('Environment variables loaded');
  
  // Check database URL
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    log('❌ ERROR: DATABASE_URL not found in environment');
    process.exit(1);
  }
  log(`✅ Database URL found: ${dbUrl.substring(0, 20)}...`);
  
  // Initialize Prisma
  const { PrismaClient } = require('@prisma/client');
  log('Prisma client imported');
  
  const prisma = new PrismaClient();
  log('Prisma client created');
  
  // Connect to database
  prisma.$connect()
    .then(() => {
      log('✅ Database connected successfully');
      return prisma.user.count();
    })
    .then(userCount => {
      log(`📊 Found ${userCount} users in database`);
      
      if (userCount === 0) {
        log('📭 No users found in database');
        return [];
      }
      
      return prisma.user.findMany({
        select: {
          id: true,
          fullName: true,
          email: true,
          role: true,
          createdAt: true
        }
      });
    })
    .then(users => {
      log(`👥 Retrieved ${users.length} user records`);
      
      // Display all users
      log('\n📋 ALL USERS:');
      users.forEach(user => {
        log(`  - ID: ${user.id}, Name: ${user.fullName}, Email: ${user.email}, Role: ${user.role}`);
      });
      
      // Separate admin and non-admin users
      const adminUsers = users.filter(user => user.role === 'ADMIN');
      const nonAdminUsers = users.filter(user => user.role !== 'ADMIN');
      
      log(`\n👑 Admin users to keep: ${adminUsers.length}`);
      adminUsers.forEach(admin => {
        log(`  ✅ Keeping: ${admin.fullName} (${admin.email})`);
      });
      
      log(`\n👤 Non-admin users to delete: ${nonAdminUsers.length}`);
      nonAdminUsers.forEach(user => {
        log(`  🗑️  Deleting: ${user.fullName} (${user.email})`);
      });
      
      if (nonAdminUsers.length === 0) {
        log('\n✅ No non-admin users to delete. Process completed!');
        return prisma.$disconnect();
      }
      
      // Get non-admin user IDs
      const nonAdminIds = nonAdminUsers.map(user => user.id);
      log(`\n🔄 Deleting data for user IDs: [${nonAdminIds.join(', ')}]`);
      
      // Delete in sequence due to foreign key constraints
      return prisma.notification.deleteMany({ where: { userId: { in: nonAdminIds } } })
        .then(result => {
          log(`📧 Deleted ${result.count} notifications`);
          return prisma.charge.deleteMany({ where: { userId: { in: nonAdminIds } } });
        })
        .then(result => {
          log(`💳 Deleted ${result.count} charges`);
          return prisma.transaction.deleteMany({ where: { userId: { in: nonAdminIds } } });
        })
        .then(result => {
          log(`💰 Deleted ${result.count} transactions`);
          return prisma.application.deleteMany({ where: { userId: { in: nonAdminIds } } });
        })
        .then(result => {
          log(`📋 Deleted ${result.count} applications`);
          return prisma.user.deleteMany({ where: { id: { in: nonAdminIds } } });
        })
        .then(result => {
          log(`👤 Deleted ${result.count} users`);
          
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
          log(`\n📊 Remaining users after deletion: ${remainingUsers.length}`);
          remainingUsers.forEach(user => {
            log(`  ✅ ${user.fullName} (${user.email}) - Role: ${user.role}`);
          });
          
          // Final database statistics
          return Promise.all([
            prisma.user.count(),
            prisma.application.count(),
            prisma.loan.count(),
            prisma.transaction.count(),
            prisma.charge.count(),
            prisma.notification.count()
          ]);
        })
        .then(stats => {
          log('\n📊 FINAL DATABASE STATISTICS:');
          log(`  👥 Users: ${stats[0]}`);
          log(`  📋 Applications: ${stats[1]}`);
          log(`  🏦 Loans: ${stats[2]}`);
          log(`  💰 Transactions: ${stats[3]}`);
          log(`  💳 Charges: ${stats[4]}`);
          log(`  📧 Notifications: ${stats[5]}`);
          
          log('\n🎉 USER DELETION COMPLETED SUCCESSFULLY!');
          return prisma.$disconnect();
        });
    })
    .then(() => {
      log('✅ Database connection closed');
      log('='.repeat(60));
      log('🎉 PROCESS COMPLETED SUCCESSFULLY');
      log('='.repeat(60));
    })
    .catch(error => {
      log(`❌ ERROR: ${error.message}`);
      log(`❌ STACK: ${error.stack}`);
      prisma.$disconnect();
      process.exit(1);
    });
    
} catch (error) {
  log(`❌ INITIALIZATION ERROR: ${error.message}`);
  log(`❌ STACK: ${error.stack}`);
  process.exit(1);
}
