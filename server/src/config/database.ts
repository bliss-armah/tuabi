import { PrismaClient } from '@prisma/client';

declare global {
  var prisma: PrismaClient | undefined;
}

const prisma = globalThis.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}

async function checkPrismaConnection() {
  try {
    // Attempt a simple query to verify the connection
    await prisma.$queryRaw`SELECT 1`;
    console.log("Prisma connection successful!");
  } catch (error) {
    console.error("Prisma connection failed:", error);
  } finally {
    // Disconnect if you are not in a long-running process
    // In most web servers, this is handled automatically on process termination
    await prisma.$disconnect();
  }
}

checkPrismaConnection();

export default prisma;