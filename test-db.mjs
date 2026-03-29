import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function test() {
  try {
    console.log("Testing DB...");
    await prisma.$queryRaw`SELECT 1`;
    console.log("SUCCESS: DB OK");
  } catch (e) {
    console.error("ERROR:", e.message);
  } finally {
    await prisma.$disconnect();
  }
}

test();
