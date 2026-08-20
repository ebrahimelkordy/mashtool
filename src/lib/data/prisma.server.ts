/**
 * PRISMA CLIENT SINGLETON
 * Connects to Prisma Data Platform PostgreSQL database
 */
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const DATABASE_URL = process.env.DATABASE_URL ?? '';

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

function createPrismaClient(): PrismaClient {
  if (!DATABASE_URL) {
    // Return a client without adapter (will fail gracefully)
    return new PrismaClient();
  }
  const pool = new pg.Pool({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    max: 5,
  });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

// Reuse across hot-reloads in development
export const prismaDb: PrismaClient =
  globalThis.__prisma ?? (globalThis.__prisma = createPrismaClient());
