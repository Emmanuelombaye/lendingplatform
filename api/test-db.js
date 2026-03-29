import { getPrisma } from './lib/prisma.js';

export default async function handler(req, res) {
  console.log("🚀 API HIT: /api/test-db");
  try {
    const prisma = getPrisma();
    console.log("✅ Prisma initialized");
    
    await prisma.$queryRaw`SELECT 1 as connected`;
    console.log("✅ Query success");
    
    res.status(200).json({ ok: true, timestamp: new Date() });

  } catch (err) {
    console.error("🔥 DATABASE ERROR:", err);
    res.status(500).json({ 
        error: err.message,
        stack: err.stack,
        hint: "Check environment variables and Prisma Engines."
    });
  }
}
