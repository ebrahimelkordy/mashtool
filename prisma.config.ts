import { defineConfig } from '@prisma/config';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const DATABASE_URL = process.env.DATABASE_URL ?? 'postgres://4983c5767ae886b854ceea0915db482689508791e8efd08b74a8dbfe04b8a733:sk_G5P830zWwu0bijwUyhDsK@pooled.db.prisma.io:5432/postgres?sslmode=require';

const pool = new pg.Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

export default defineConfig({
  datasource: {
    url: DATABASE_URL,
    adapter: new PrismaPg(pool),
  },
});
