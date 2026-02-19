console.log('Starting test...');
require('dotenv').config();
console.log('Environment loaded');

try {
  const { PrismaClient } = require('@prisma/client');
  console.log('Prisma imported successfully');
  
  const prisma = new PrismaClient();
  console.log('Prisma client created');
  
  prisma.$connect()
    .then(() => {
      console.log('✅ Database connected');
      return prisma.user.count();
    })
    .then(count => {
      console.log(`📊 User count: ${count}`);
      return prisma.$disconnect();
    })
    .then(() => {
      console.log('✅ Disconnected');
    })
    .catch(error => {
      console.error('❌ Error:', error.message);
    });
    
} catch (error) {
  console.error('❌ Initialization error:', error.message);
}
