import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Reuse a single PrismaClient across warm serverless invocations and
// across dev hot-reloads to avoid exhausting DB connections.
export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (!globalForPrisma.prisma) globalForPrisma.prisma = db
