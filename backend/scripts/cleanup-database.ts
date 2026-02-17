import prisma from '../src/utils/prisma';
import bcrypt from 'bcrypt';

/**
 * Database Cleanup Script for Vertex Loans
 * This script removes all client data while preserving admin accounts and system structure
 * Use this to start fresh with zero clients
 */

async function cleanupDatabase() {
  console.log('🧹 Starting database cleanup...');
  console.log('⚠️  This will remove ALL client data but preserve admin accounts');

  try {
    // Step 1: Remove all client notifications
    console.log('1. Removing client notifications...');
    const deletedNotifications = await prisma.notification.deleteMany({
      where: {
        user: {
          role: 'USER'
        }
      }
    });
    console.log(`   ✅ Deleted ${deletedNotifications.count} notifications`);

    // Step 2: Remove all KYC documents (files will remain but DB records removed)
    console.log('2. Removing KYC documents...');
    const deletedKycDocs = await prisma.kycDocument.deleteMany({
      where: {
        user: {
          role: 'USER'
        }
      }
    });
    console.log(`   ✅ Deleted ${deletedKycDocs.count} KYC documents`);

    // Step 3: Remove all charges
    console.log('3. Removing charges...');
    const deletedCharges = await prisma.charge.deleteMany({
      where: {
        user: {
          role: 'USER'
        }
      }
    });
    console.log(`   ✅ Deleted ${deletedCharges.count} charges`);

    // Step 4: Remove all transactions
    console.log('4. Removing transactions...');
    const deletedTransactions = await prisma.transaction.deleteMany({
      where: {
        user: {
          role: 'USER'
        }
      }
    });
    console.log(`   ✅ Deleted ${deletedTransactions.count} transactions`);

    // Step 5: Remove all repayments
    console.log('5. Removing repayments...');
    const deletedRepayments = await prisma.repayment.deleteMany({});
    console.log(`   ✅ Deleted ${deletedRepayments.count} repayments`);

    // Step 6: Remove all loans
    console.log('6. Removing loans...');
    const deletedLoans = await prisma.loan.deleteMany({
      where: {
        application: {
          user: {
            role: 'USER'
          }
        }
      }
    });
    console.log(`   ✅ Deleted ${deletedLoans.count} loans`);

    // Step 7: Remove all admin notes
    console.log('7. Removing admin notes...');
    const deletedAdminNotes = await prisma.adminNote.deleteMany({
      where: {
        application: {
          user: {
            role: 'USER'
          }
        }
      }
    });
    console.log(`   ✅ Deleted ${deletedAdminNotes.count} admin notes`);

    // Step 8: Remove all documents
    console.log('8. Removing documents...');
    const deletedDocuments = await prisma.document.deleteMany({
      where: {
        application: {
          user: {
            role: 'USER'
          }
        }
      }
    });
    console.log(`   ✅ Deleted ${deletedDocuments.count} documents`);

    // Step 9: Remove all applications
    console.log('9. Removing applications...');
    const deletedApplications = await prisma.application.deleteMany({
      where: {
        user: {
          role: 'USER'
        }
      }
    });
    console.log(`   ✅ Deleted ${deletedApplications.count} applications`);

    // Step 10: Remove all client users (keep only ADMIN users)
    console.log('10. Removing client users...');
    const deletedUsers = await prisma.user.deleteMany({
      where: {
        role: 'USER'
      }
    });
    console.log(`   ✅ Deleted ${deletedUsers.count} client users`);

    // Step 11: Remove all messages
    console.log('11. Removing contact messages...');
    const deletedMessages = await prisma.message.deleteMany({});
    console.log(`   ✅ Deleted ${deletedMessages.count} messages`);

    // Step 12: Verify admin account exists and update it
    console.log('12. Verifying admin account...');
    const adminEmail = 'vertex@loans.com';
    const adminPassword = '@Kenya90!132323';
    const salt = await bcrypt.genSalt(10);
    const adminPasswordHash = await bcrypt.hash(adminPassword, salt);

    let adminUser = await prisma.user.findUnique({
      where: { email: adminEmail }
    });

    if (adminUser) {
      await prisma.user.update({
        where: { email: adminEmail },
        data: {
          passwordHash: adminPasswordHash,
          role: 'ADMIN',
          fullName: 'Vertex Admin',
          phone: null,
          kycStatus: 'PENDING',
          isVerified: false
        }
      });
      console.log('   ✅ Admin account updated');
    } else {
      await prisma.user.create({
        data: {
          fullName: 'Vertex Admin',
          email: adminEmail,
          passwordHash: adminPasswordHash,
          role: 'ADMIN',
          kycStatus: 'PENDING',
          isVerified: false
        }
      });
      console.log('   ✅ Admin account created');
    }

    // Step 13: Ensure default settings exist
    console.log('13. Verifying system settings...');
    const settings = await prisma.settings.findFirst();
    if (!settings) {
      await prisma.settings.create({
        data: {
          interestRateDefault: 6.0,
          processingFeePercent: 6.5,
          minLoan: 5000,
          maxLoan: 1000000,
          maxMonths: 24
        }
      });
      console.log('   ✅ Default settings created');
    } else {
      console.log('   ✅ Settings already exist');
    }

    // Step 14: Get final counts
    console.log('14. Verifying cleanup results...');
    const finalCounts = await Promise.all([
      prisma.user.count({ where: { role: 'USER' } }),
      prisma.user.count({ where: { role: 'ADMIN' } }),
      prisma.application.count(),
      prisma.loan.count(),
      prisma.transaction.count(),
      prisma.charge.count(),
      prisma.notification.count(),
      prisma.kycDocument.count()
    ]);

    console.log('\n📊 CLEANUP SUMMARY:');
    console.log('===================');
    console.log(`👤 Client Users: ${finalCounts[0]}`);
    console.log(`🔧 Admin Users: ${finalCounts[1]}`);
    console.log(`📋 Applications: ${finalCounts[2]}`);
    console.log(`💰 Loans: ${finalCounts[3]}`);
    console.log(`💳 Transactions: ${finalCounts[4]}`);
    console.log(`🧾 Charges: ${finalCounts[5]}`);
    console.log(`🔔 Notifications: ${finalCounts[6]}`);
    console.log(`📄 KYC Documents: ${finalCounts[7]}`);

    console.log('\n🎉 DATABASE CLEANUP COMPLETE!');
    console.log('');
    console.log('✅ System is now fresh and ready for real clients');
    console.log('✅ Admin account preserved for system management');
    console.log('✅ All APIs will return empty data until real clients register');
    console.log('✅ Support system remains functional (+1(870)962-0043, Till: 5617392)');
    console.log('');
    console.log('🔐 Admin Login Credentials:');
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Password: ${adminPassword}`);

  } catch (error) {
    console.error('❌ Cleanup failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Execute cleanup if run directly
if (require.main === module) {
  cleanupDatabase().catch((error) => {
    console.error('💥 Fatal error during cleanup:', error);
    process.exit(1);
  });
}

export default cleanupDatabase;
