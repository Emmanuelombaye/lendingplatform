// Direct MySQL approach to delete users
const mysql = require('mysql2/promise');

async function deleteUsersWithMySQL() {
  let connection;
  
  try {
    console.log('🗑️  Starting MySQL user deletion...');
    
    // Parse DATABASE_URL
    const dbUrl = process.env.DATABASE_URL || "mysql://root:fZXXfLuJiYMaCyLSljmUDSVSMDjreyzM@turntable.proxy.rlwy.net:19098/railway";
    
    // Parse connection details
    const url = new URL(dbUrl);
    const config = {
      host: url.hostname,
      port: parseInt(url.port) || 3306,
      user: url.username,
      password: url.password,
      database: url.pathname.substring(1)
    };
    
    console.log('📊 Database config:', {
      host: config.host,
      port: config.port,
      user: config.user,
      database: config.database
    });
    
    // Connect to MySQL
    connection = await mysql.createConnection(config);
    console.log('✅ Connected to MySQL database');
    
    // Check current users
    const [users] = await connection.execute('SELECT id, fullName, email, role FROM User');
    console.log(`📊 Found ${users.length} users:`);
    users.forEach(user => {
      console.log(`  - ID: ${user.id}, Name: ${user.fullName}, Email: ${user.email}, Role: ${user.role}`);
    });
    
    // Separate admin and non-admin users
    const adminUsers = users.filter(user => user.role === 'ADMIN');
    const nonAdminUsers = users.filter(user => user.role !== 'ADMIN');
    
    console.log(`\n👑 Admin users to keep: ${adminUsers.length}`);
    adminUsers.forEach(admin => {
      console.log(`  ✅ Keeping: ${admin.fullName} (${admin.email})`);
    });
    
    console.log(`\n👤 Non-admin users to delete: ${nonAdminUsers.length}`);
    nonAdminUsers.forEach(user => {
      console.log(`  🗑️  Deleting: ${user.fullName} (${user.email})`);
    });
    
    if (nonAdminUsers.length === 0) {
      console.log('\n✅ No non-admin users to delete');
      return;
    }
    
    const nonAdminIds = nonAdminUsers.map(user => user.id);
    console.log('\n🔄 Deleting related data for user IDs:', nonAdminIds);
    
    // Delete in correct order due to foreign key constraints
    const tables = [
      'Notification',
      'Charge', 
      'Transaction',
      'Repayment',
      'Loan',
      'AdminNote',
      'Document',
      'Application',
      'User'
    ];
    
    for (const table of tables) {
      try {
        let query;
        let result;
        
        if (table === 'User') {
          query = `DELETE FROM ${table} WHERE id IN (${nonAdminIds.join(',')})`;
        } else if (['Application', 'Document', 'AdminNote'].includes(table)) {
          query = `DELETE FROM ${table} WHERE userId IN (${nonAdminIds.join(',')})`;
        } else if (table === 'Loan') {
          query = `DELETE l FROM ${table} l JOIN Application a ON l.applicationId = a.id WHERE a.userId IN (${nonAdminIds.join(',')})`;
        } else if (table === 'Repayment') {
          query = `DELETE r FROM ${table} r JOIN Loan l ON r.loanId = l.id JOIN Application a ON l.applicationId = a.id WHERE a.userId IN (${nonAdminIds.join(',')})`;
        } else {
          query = `DELETE FROM ${table} WHERE userId IN (${nonAdminIds.join(',')})`;
        }
        
        [result] = await connection.execute(query);
        console.log(`🗑️  Deleted ${result.affectedRows} records from ${table}`);
        
      } catch (error) {
        console.log(`⚠️  Could not delete from ${table}: ${error.message}`);
      }
    }
    
    // Verify remaining users
    const [remainingUsers] = await connection.execute('SELECT id, fullName, email, role FROM User');
    console.log(`\n📊 Remaining users: ${remainingUsers.length}`);
    remainingUsers.forEach(user => {
      console.log(`  ✅ ${user.fullName} (${user.email}) - Role: ${user.role}`);
    });
    
    console.log('\n🎉 User deletion completed successfully!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 MySQL connection closed');
    }
  }
}

// Load environment and run
require('dotenv').config();
deleteUsersWithMySQL();
