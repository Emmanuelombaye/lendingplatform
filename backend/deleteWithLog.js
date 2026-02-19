const fs = require('fs');

// Write to a log file to verify the script is running
fs.writeFileSync('deletion_log.txt', 'Script started at ' + new Date().toISOString() + '\n');

console.log('Starting user deletion...');

try {
  require('dotenv').config();
  fs.appendFileSync('deletion_log.txt', 'Environment loaded\n');
  
  const { PrismaClient } = require('@prisma/client');
  fs.appendFileSync('deletion_log.txt', 'Prisma imported\n');
  
  const prisma = new PrismaClient();
  fs.appendFileSync('deletion_log.txt', 'Prisma client created\n');
  
  prisma.$connect()
    .then(() => {
      fs.appendFileSync('deletion_log.txt', 'Database connected\n');
      console.log('Database connected');
      
      return prisma.user.count();
    })
    .then(count => {
      fs.appendFileSync('deletion_log.txt', `User count: ${count}\n`);
      console.log(`Found ${count} users`);
      
      if (count > 0) {
        return prisma.user.findMany({
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true
          }
        });
      }
      return [];
    })
    .then(users => {
      fs.appendFileSync('deletion_log.txt', `Found ${users.length} users\n`);
      
      users.forEach(user => {
        fs.appendFileSync('deletion_log.txt', `User: ${user.fullName} (${user.email}) - Role: ${user.role}\n`);
      });
      
      const adminUsers = users.filter(user => user.role === 'ADMIN');
      const nonAdminUsers = users.filter(user => user.role !== 'ADMIN');
      
      fs.appendFileSync('deletion_log.txt', `Admin users: ${adminUsers.length}\n`);
      fs.appendFileSync('deletion_log.txt', `Non-admin users: ${nonAdminUsers.length}\n`);
      
      if (nonAdminUsers.length > 0) {
        const nonAdminIds = nonAdminUsers.map(user => user.id);
        
        return Promise.all([
          prisma.notification.deleteMany({ where: { userId: { in: nonAdminIds } } }),
          prisma.charge.deleteMany({ where: { userId: { in: nonAdminIds } } }),
          prisma.transaction.deleteMany({ where: { userId: { in: nonAdminIds } } }),
          prisma.application.deleteMany({ where: { userId: { in: nonAdminIds } } }),
          prisma.user.deleteMany({ where: { id: { in: nonAdminIds } } })
        ]);
      }
    })
    .then(results => {
      if (results) {
        fs.appendFileSync('deletion_log.txt', `Deletion results: ${JSON.stringify(results)}\n`);
        console.log('Deletion completed');
      }
      
      return prisma.$disconnect();
    })
    .then(() => {
      fs.appendFileSync('deletion_log.txt', 'Process completed successfully\n');
      console.log('Process completed');
    })
    .catch(error => {
      fs.appendFileSync('deletion_log.txt', `Error: ${error.message}\n`);
      console.error('Error:', error.message);
    });
    
} catch (error) {
  fs.appendFileSync('deletion_log.txt', `Initialization error: ${error.message}\n`);
  console.error('Initialization error:', error.message);
}
