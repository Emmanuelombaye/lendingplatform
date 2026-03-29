import { PrismaClient } from '@prisma/client';

export default async function handler(req, res) {
  try {
    console.log("[DEBUG] Initializing PrismaClient...");
    const prisma = new PrismaClient({
      log: ['query', 'info', 'warn', 'error'],
    });
    
    console.log("[DEBUG] Attempting raw query...");
    const result = await prisma.$queryRaw`SELECT 1 as connected`;
    
    res.status(200).json({ 
      status: "DB OK", 
      result,
      env: process.env.VERCEL_REGION || 'local'
    });
  } catch (err) {
    console.error("[DEBUG] Prisma Crash:", err);
    res.status(500).json({
      error: err.message,
      code: err.code,
      stack: err.stack,
      hint: "If 'Query engine not found', check vercel.json includeFiles."
    });
  }
}
