const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkUsers() {
  try {
    console.log('🔍 Checking current users...');
    
    const users = await prisma.user.findMany({
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        createdAt: true
      }
    });
    
    console.log(`\n📊 Total users: ${users.length}`);
    
    if (users.length === 0) {
      console.log('⚠️  No users found in the database');
      return;
    }
    
    users.forEach(user => {
      console.log(`  - ID: ${user.id}, Name: ${user.fullName}, Email: ${user.email}, Role: ${user.role}`);
    });
    
    // Check applications count
    const applicationCount = await prisma.application.count();
    console.log(`\n📋 Total applications: ${applicationCount}`);
    
    // Check loans count
    const loanCount = await prisma.loan.count();
    console.log(`🏦 Total loans: ${loanCount}`);
    
    // Check transactions count
    const transactionCount = await prisma.transaction.count();
    console.log(`💰 Total transactions: ${transactionCount}`);
    
    // Check charges count
    const chargeCount = await prisma.charge.count();
    console.log(`💳 Total charges: ${chargeCount}`);
    
    // Check notifications count
    const notificationCount = await prisma.notification.count();
    console.log(`📧 Total notifications: ${notificationCount}`);
    
  } catch (error) {
    console.error('❌ Error checking users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();
