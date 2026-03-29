import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function testDB() {
  try {
    console.log("?? Testing database connection...");

    await prisma.$queryRaw`SELECT 1`;

    console.log("? SUCCESS: Database is reachable and credentials are correct.");
  } catch (err) {
    console.error("?? ERROR:");
    console.error(err.message);
  } finally {
    await prisma.$disconnect();
  }
}

testDB();
