import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const DEFAULT_DB_URL = 'postgres://4983c5767ae886b854ceea0915db482689508791e8efd08b74a8dbfe04b8a733:sk_G5P830zWwu0bijwUyhDsK@pooled.db.prisma.io:5432/postgres?sslmode=require';
const DATABASE_URL = process.env.DATABASE_URL || DEFAULT_DB_URL;

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
    max: 10,
    idleTimeoutMillis: 2000, // Close idle connections quickly before server proxy drops them
    connectionTimeoutMillis: 10000,
    keepAlive: true,
    keepAliveInitialDelayMillis: 3000,
  });

  // Catch idle client errors so dead sockets are discarded cleanly without crashing queries
  pool.on('error', (err) => {
    // Silent warn for idle socket disconnects
    if (!err.message?.includes('closed') && !err.message?.includes('terminated')) {
      console.warn('pg pool idle client event:', err.message);
    }
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
