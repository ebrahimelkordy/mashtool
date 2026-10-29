import PrismaClientPkg from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const PrismaClient = PrismaClientPkg.PrismaClient || PrismaClientPkg;

const DEFAULT_DB_URL =
  'postgres://4983c5767ae886b854ceea0915db482689508791e8efd08b74a8dbfe04b8a733:sk_G5P830zWwu0bijwUyhDsK@pooled.db.prisma.io:5432/postgres?sslmode=require';
const DATABASE_URL = process.env.DATABASE_URL || DEFAULT_DB_URL;

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
  // eslint-disable-next-line no-var
  var __pgPool: pg.Pool | undefined;
}

function createPgPool(): pg.Pool {
  return new pg.Pool({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    // Connection acquisition timeout
    connectionTimeoutMillis: 8_000,
    // Keep idle connections alive for 120s to avoid expensive reconnects on subsequent requests
    idleTimeoutMillis: 120_000,
    max: 10,
    keepAlive: true,
  });
}

function createPrismaClient(): PrismaClient {
  const pool = globalThis.__pgPool ?? (globalThis.__pgPool = createPgPool());
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

export const prismaDb: PrismaClient =
  globalThis.__prisma ?? (globalThis.__prisma = createPrismaClient());
