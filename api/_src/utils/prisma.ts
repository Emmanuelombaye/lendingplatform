import { PrismaClient } from '@prisma/client';

let prisma: PrismaClient;

const getPrisma = (): PrismaClient => {
    if (!prisma) {
        console.log("[PRISMA] Initializing lazy singleton...");
        prisma = new PrismaClient({
            log: ['error'], // Engineer 1 stability strategy
        });
    }
    return prisma;
};

// Export both the singleton and the proxy for backward compatibility
export { getPrisma };
export default new Proxy({} as PrismaClient, {
    get: (target, prop) => {
        return (getPrisma() as any)[prop];
    }
});
