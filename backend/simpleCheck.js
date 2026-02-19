const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function simpleCheck() {
  try {
    // Just check database connection
    await prisma.$connect();
    
    // Count users
    const userCount = await prisma.user.count();
    console.log(`Users in database: ${userCount}`);
    
    // Get first user
    const firstUser = await prisma.user.findFirst();
    if (firstUser) {
      console.log('First user found:');
      console.log(`  ID: ${firstUser.id}`);
      console.log(`  Name: ${firstUser.fullName}`);
      console.log(`  Email: ${firstUser.email}`);
      console.log(`  Phone: ${firstUser.phone}`);
      console.log(`  Role: ${firstUser.role}`);
      console.log(`  Credit Score: ${firstUser.creditScore}`);
      console.log(`  KYC: ${firstUser.kycStatus}`);
      console.log(`  Created: ${firstUser.createdAt}`);
    }
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('Database connection failed:', error);
  }
}

simpleCheck();
