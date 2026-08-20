import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const url = 'postgres://4983c5767ae886b854ceea0915db482689508791e8efd08b74a8dbfe04b8a733:sk_G5P830zWwu0bijwUyhDsK@pooled.db.prisma.io:5432/postgres?sslmode=require';

async function run() {
  console.log('Testing connection to Database...');
  const pool = new pg.Pool({ connectionString: url, ssl: { rejectUnauthorized: false } });
  const adapter = new PrismaPg(pool);
  const client = new PrismaClient({ adapter });
  
  const categories = await client.category.findMany();
  console.log('Categories found:', categories.length);
  for (const c of categories) {
    console.log(`- ${c.name} (${c.slug})`);
  }

  const products = await client.product.findMany();
  console.log('Products found:', products.length);
  for (const p of products) {
    console.log(`- ${p.name} ($${p.priceFrom})`);
  }

  await client.$disconnect();
  await pool.end();
}

run().catch(console.error);
