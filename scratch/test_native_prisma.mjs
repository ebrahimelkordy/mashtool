import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const url = 'postgres://668e392f0a8d0f6096d3ad65f578cdb496daea16ec884d5e9a60be8d627f2e75:sk_WzziBQaTXS4lPYm7FOPYP@pooled.db.prisma.io:5432/postgres?sslmode=require';

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
