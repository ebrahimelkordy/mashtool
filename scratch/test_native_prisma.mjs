import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const url = 'postgres://4983c5767ae886b854ceea0915db482689508791e8efd08b74a8dbfe04b8a733:sk_G5P830zWwu0bijwUyhDsK@pooled.db.prisma.io:5432/postgres?sslmode=require';

async function main() {
  console.log('Testing PrismaPg({ connectionString })...');
  const adapter = new PrismaPg({ connectionString: url });
  const prisma = new PrismaClient({ adapter });

  const categories = await prisma.category.findMany();
  console.log('Categories:', categories.length, categories.map(c => c.name));

  const products = await prisma.product.findMany();
  console.log('Products:', products.length, products.map(p => p.name));

  await prisma.$disconnect();
}

main().catch(console.error);
