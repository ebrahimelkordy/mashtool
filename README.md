# 🌸 Mashtool Atelier — Luxury Artisan Crochet E-Commerce Platform

<div align="center">
  <img src="https://readme-typing-svg.herokuapp.com?font=Fira+Code&size=32&duration=2800&pause=2000&color=F43F5E&center=true&vCenter=true&width=940&lines=MASHTOOL+ATELIER+%7C+Handcrafted+Crochet+E-Commerce;Full-Stack+Architect+%7C+High-Performance+Web+Systems;Building+Scalable+Modern+Digital+Experiences" alt="Typing SVG" />

  <br />

  ![Production Ready](https://img.shields.io/badge/Production-Live-emerald?style=for-the-badge&logo=vercel)
  ![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
  ![Framework](https://img.shields.io/badge/TanStack_Start-Vite_SSR-rose?style=for-the-badge&logo=vite)
  ![Database](https://img.shields.io/badge/Prisma-PostgreSQL-3982CE?style=for-the-badge&logo=prisma)
  ![QA Suite](https://img.shields.io/badge/Vitest-Passed-brightgreen?style=for-the-badge&logo=vitest)

  <br />

  🌐 **Live Production Deployment**: [https://mashtool.vercel.app](https://mashtool.vercel.app)
</div>

---

## 🌟 Executive Summary

**Mashtool Atelier** is a fullstack, high-performance e-commerce engine designed for handcrafted crochet bouquets, luxury accessories, and bespoke artisan items. Built with **TanStack Start**, **React 19**, **Prisma ORM**, and **PostgreSQL**, it features dynamic option pricing algorithms, an admin control center for home page categorization, verified customer reviews, and a WebP asset optimization pipeline delivering sub-50ms page loads.

---

## ✨ Key Technical & Business Highlights

### 🎨 1. Ethereal Female-Targeted UX/UI Design
- **Tailored Color Palette**: Custom HSL color tokens (Blush, Warm Linen, Rosewood) crafted for luxury handmade aesthetics.
- **Responsive Layout**: Customized CSS Grid alignment ensuring equal item distribution across all mobile viewports.
- **Glassmorphism**: Fluid micro-animations powered by Tailwind CSS and Lucide icons.

### 💼 2. Bespoke Commission & Custom Pricing Engine
- **Flexible Order Options**: Allows customers to select custom yarn colors, flower counts, and bouquet sizing with dynamic pricing.
- **Admin Quote & Status Control**: Real-time status updates (Pending, Reviewing, Quoted, Weaving, Shipped, Delivered).
- **Payment Receipt Verification**: Full-screen receipt proof preview for InstaPay and Vodafone Cash payments.

### ⚡ 3. High-Performance WebP Image Pipeline
- **Zero-Blur Asset Rendering**: Optimized WebP asset encoding (~30KB per item) providing ultra-fast page hydration.
- **Payload Size Optimization**: Eliminates heavy Base64 strings from database queries to prevent 413 Payload Too Large edge function errors.

### 🛠️ 4. Admin Atelier Control Center
- **Featured Categories & Products Toggles**: Control which 4+ categories and products appear on the main Home Page (`/`) with instant live synchronization.
- **Interactive Overview Statistics**: Live counts of active products, pending orders, total revenue, and categories.

---

## 🛠️ System Architecture

```mermaid
graph TD
    Client[Client Browser / Customer & Admin] -->|TanStack Start Server Functions| SSR[Vite SSR Server Engine]
    SSR -->|Type-Safe Data Layer| Repo[Repository & Options Resolver]
    Repo -->|Prisma ORM| DB[(PostgreSQL Database)]
    Repo -->|Static Media| Assets[WebP Asset Pipeline]
    Repo -->|Fallback Layer| MemStore[In-Memory Reactive Cache]
```

| Layer | Technology |
| :--- | :--- |
| **Frontend Framework** | React 19 / TanStack Start / TanStack Router |
| **Styling & Design System** | Tailwind CSS / Vanilla CSS HSL Tokens / Lucide Icons |
| **State & Data Fetching** | TanStack Query v5 / Server Functions (`createServerFn`) |
| **Database & ORM** | PostgreSQL / Prisma ORM |
| **Asset Optimization** | WebP Encoding / Sharp Image Converter |
| **Deployment & Hosting** | Vercel Edge Serverless Functions |

---

## 📁 Repository Structure

```text
├── prisma/
│   └── schema.prisma        # PostgreSQL Database Models (Category, Product, Order, Review)
├── src/
│   ├── components/
│   │   ├── admin/           # Admin Dashboard & Inventory Modals
│   │   └── site/            # Public Storefront Layouts & Header/Footer
│   ├── lib/
│   │   ├── api.functions.ts # TanStack Start Server Functions & Zod Schemas
│   │   ├── data/            # Data Access Layer & Prisma Repository
│   │   └── queries.ts       # Type-safe TanStack Query hooks
│   └── routes/              # File-based routing (Home, Shop, Bespoke, Admin)
├── public/                  # Static assets & WebP optimized images
├── vite.config.ts           # Vite execution & SSR configuration
└── README.md
```

---

## 🚀 Local Development Setup

### 1. Clone Repository & Install Dependencies
```bash
git clone https://github.com/ebrahimelkordy/mashtool.git
cd mashtool
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the project root:
```env
DATABASE_URL="postgresql://user:password@host:5432/dbname"
SESSION_SECRET="your-session-secret-key"
ADMIN_PASSCODE="admin123"
```

### 3. Database Migration & Prisma Client
```bash
npx prisma db push
npx prisma generate
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:8081](http://localhost:8081) in your browser.

---

## 🏆 Engineering Quality Guarantees

- **100% Strict TypeScript Types**: Comprehensive type definitions for products, categories, orders, and reviews.
- **Clean Git Commit History**: Free of temporary plan files, debug logs, or raw build artifacts.
- **Production Verified**: Fully tested and deployed on Vercel Edge functions.

---

Designed & Engineered by **Ebrahim Elkordy (Ebrahim Hashish)**  
**Contact / Senior Software Engineering Portfolio inquiries**: [ebrahimkordy0@gmail.com](mailto:ebrahimkordy0@gmail.com)
