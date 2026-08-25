import { createClient } from '@supabase/supabase-js';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const supabaseUrl = 'https://bwyowbsecdqaaonkallp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ3eW93YnNlY2RxYWFvbmthbGxwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NjU0NzQ2NiwiZXhwIjoyMTAyMTIzNDY2fQ.Vn87rE0fHfXASxf6cUeZ2nbQ0yh1L207JE7qrnfc2S4';

const prismaUrl = 'postgres://668e392f0a8d0f6096d3ad65f578cdb496daea16ec884d5e9a60be8d627f2e75:sk_WzziBQaTXS4lPYm7FOPYP@pooled.db.prisma.io:5432/postgres?sslmode=require';

async function migrate() {
  console.log('Connecting to Supabase and Prisma...');
  const sb = createClient(supabaseUrl, supabaseKey);
  const adapter = new PrismaPg({ connectionString: prismaUrl });
  const prisma = new PrismaClient({ adapter });

  // 1. Categories
  const { data: categories } = await sb.from('categories').select('*');
  if (categories && categories.length > 0) {
    console.log(`Migrating ${categories.length} categories...`);
    for (const c of categories) {
      await prisma.category.upsert({
        where: { id: c.id },
        update: {
          slug: c.slug,
          name: c.name,
          tagline: c.tagline || '',
          description: c.description || '',
          image: c.image || '',
        },
        create: {
          id: c.id,
          slug: c.slug,
          name: c.name,
          tagline: c.tagline || '',
          description: c.description || '',
          image: c.image || '',
        },
      });
    }
  }

  // 2. Products
  const { data: products } = await sb.from('products').select('*');
  if (products && products.length > 0) {
    console.log(`Migrating ${products.length} products...`);
    for (const p of products) {
      await prisma.product.upsert({
        where: { id: p.id },
        update: {
          slug: p.slug,
          name: p.name,
          categoryId: p.category_id || null,
          category: p.category_name || p.category || '',
          categorySlug: p.category_slug || '',
          priceFrom: Number(p.price_from || 0),
          leadTimeDays: p.lead_time_days || '1–2 weeks',
          shortDescription: p.short_description || '',
          description: p.description || '',
          images: Array.isArray(p.images) ? p.images : [],
          options: Array.isArray(p.options) ? p.options : [],
          featured: Boolean(p.featured),
          badge: p.badge || null,
          active: Boolean(p.active),
        },
        create: {
          id: p.id,
          slug: p.slug,
          name: p.name,
          categoryId: p.category_id || null,
          category: p.category_name || p.category || '',
          categorySlug: p.category_slug || '',
          priceFrom: Number(p.price_from || 0),
          leadTimeDays: p.lead_time_days || '1–2 weeks',
          shortDescription: p.short_description || '',
          description: p.description || '',
          images: Array.isArray(p.images) ? p.images : [],
          options: Array.isArray(p.options) ? p.options : [],
          featured: Boolean(p.featured),
          badge: p.badge || null,
          active: Boolean(p.active),
        },
      });
    }
  }

  // 3. Orders
  const { data: orders } = await sb.from('orders').select('*');
  if (orders && orders.length > 0) {
    console.log(`Migrating ${orders.length} orders...`);
    for (const o of orders) {
      await prisma.order.upsert({
        where: { id: o.id },
        update: {
          orderNumber: o.order_number,
          type: o.type || 'standard',
          productId: o.product_id || null,
          productName: o.product_name || null,
          customerName: o.customer_name || '',
          phone: o.phone || '',
          whatsapp: o.whatsapp || null,
          address: o.address || null,
          quantity: o.quantity || 1,
          notes: o.notes || null,
          referenceImages: Array.isArray(o.reference_images) ? o.reference_images : [],
          selectedOptions: Array.isArray(o.selected_options) ? o.selected_options : [],
          unitPrice: o.unit_price ? Number(o.unit_price) : null,
          total: o.total ? Number(o.total) : null,
          status: o.status || 'new',
          quotedPrice: o.quoted_price ? Number(o.quoted_price) : null,
          paymentProofUrl: o.payment_proof_url || null,
          estimatedDelivery: o.estimated_delivery ? new Date(o.estimated_delivery) : null,
          adminNote: o.admin_note || null,
        },
        create: {
          id: o.id,
          orderNumber: o.order_number,
          type: o.type || 'standard',
          productId: o.product_id || null,
          productName: o.product_name || null,
          customerName: o.customer_name || '',
          phone: o.phone || '',
          whatsapp: o.whatsapp || null,
          address: o.address || null,
          quantity: o.quantity || 1,
          notes: o.notes || null,
          referenceImages: Array.isArray(o.reference_images) ? o.reference_images : [],
          selectedOptions: Array.isArray(o.selected_options) ? o.selected_options : [],
          unitPrice: o.unit_price ? Number(o.unit_price) : null,
          total: o.total ? Number(o.total) : null,
          status: o.status || 'new',
          quotedPrice: o.quoted_price ? Number(o.quoted_price) : null,
          paymentProofUrl: o.payment_proof_url || null,
          estimatedDelivery: o.estimated_delivery ? new Date(o.estimated_delivery) : null,
          adminNote: o.admin_note || null,
        },
      });
    }
  }

  console.log('Migration finished successfully!');
  await prisma.$disconnect();
}

migrate().catch(console.error);
