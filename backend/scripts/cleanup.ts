import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanup() {
    console.log('Starting database cleanup...');

    try {
        console.log('Deleting dependent records...');

        // 1. Delete transactions first
        await prisma.transaction.deleteMany({});

        // 2. Delete loans
        await prisma.loan.deleteMany({});

        // 3. Delete charges
        await prisma.charge.deleteMany({});

        // 4. Delete notifications
        await prisma.notification.deleteMany({});

        // 5. Delete applications
        await prisma.application.deleteMany({});

        // 6. Delete all non-admin users
        const deleteUsers = await prisma.user.deleteMany({
            where: {
                role: {
                    not: 'ADMIN'
                }
            }
        });

        console.log(`Deleted ${deleteUsers.count} non-admin users.`);
        console.log('Cleanup completed successfully.');
    } catch (error) {
        console.error('Cleanup failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

cleanup();
