const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testConnection() {
  try {
    console.log('🔍 Testing database connection...');
    
    // Test basic connection
    await prisma.$connect();
    console.log('✅ Database connected successfully');
    
    // Test simple query
    const userCount = await prisma.user.count();
    console.log(`📊 Found ${userCount} users in database`);
    
    if (userCount > 0) {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          fullName: true,
          email: true,
          role: true
        },
        take: 5
      });
      
      console.log('\n👥 Sample users:');
      users.forEach(user => {
        console.log(`  - ${user.fullName} (${user.email}) - Role: ${user.role}`);
      });
    }
    
    await prisma.$disconnect();
    console.log('\n✅ Connection test completed');
    
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    await prisma.$disconnect();
  }
}

testConnection();
