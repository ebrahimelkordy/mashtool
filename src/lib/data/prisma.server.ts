import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const DATABASE_URL = process.env.DATABASE_URL ?? '';

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
  // eslint-disable-next-line no-var
  var __pgPool: pg.Pool | undefined;
}

function getPgPool(): pg.Pool | null {
  if (!DATABASE_URL) return null;
  if (globalThis.__pgPool) return globalThis.__pgPool;
  
  const pool = new pg.Pool({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    max: 1, // Minimize active connections to respect Prisma Data Platform limits
    idleTimeoutMillis: 5000,
    connectionTimeoutMillis: 5000,
  });
  
  globalThis.__pgPool = pool;
  return pool;
}

function createPrismaClient(): PrismaClient {
  const pool = getPgPool();
  if (!pool) {
    return new PrismaClient();
  }
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

export const prismaDb: PrismaClient =
  globalThis.__prisma ?? (globalThis.__prisma = createPrismaClient());
