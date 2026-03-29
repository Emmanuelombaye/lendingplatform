import prisma from './api/_src/utils/prisma.js';

async function main() {
    console.log('Testing Prisma connection...');
    try {
        const result = await prisma.$queryRaw`SELECT 1 as test`;
        console.log('Connection successful:', result);
    } catch (error) {
        console.error('Connection failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
