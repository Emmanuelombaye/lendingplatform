import { PrismaClient } from '@prisma/client';

let prisma: PrismaClient;

export function getPrisma() {
    if (!prisma) {
        console.log("[PRISMA] 🚀 Initializing PrismaClient Singleton...");
        prisma = new PrismaClient({
            log: ['error', 'warn'],
        });
    }
    return prisma;
}
