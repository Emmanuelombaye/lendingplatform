import { PrismaClient } from '@prisma/client';

let actualPrisma: PrismaClient;

const prisma = new Proxy({} as PrismaClient, {
    get: (target, prop) => {
        if (!actualPrisma) {
            actualPrisma = new PrismaClient({
                log: ['error', 'warn'],
            });
        }
        return (actualPrisma as any)[prop];
    }
});

export default prisma;
