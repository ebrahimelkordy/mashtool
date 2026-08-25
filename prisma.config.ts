import { defineConfig } from '@prisma/config';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const DATABASE_URL = process.env.DATABASE_URL ?? 'postgres://668e392f0a8d0f6096d3ad65f578cdb496daea16ec884d5e9a60be8d627f2e75:sk_WzziBQaTXS4lPYm7FOPYP@pooled.db.prisma.io:5432/postgres?sslmode=require';

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
