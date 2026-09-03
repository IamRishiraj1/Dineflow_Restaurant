# DineFlow — Restaurant Ordering & Management

[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=nextdotjs)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-316192?logo=postgresql)](https://supabase.com/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma)](https://www.prisma.io/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](./LICENSE)

DineFlow is a full-stack restaurant ordering and management platform built with Next.js, Prisma, Supabase, and NextAuth.js. It combines a customer storefront and an admin dashboard in one codebase, with real database-backed orders, authentication, payments, uploads, and analytics.

---

## Overview

DineFlow is designed as a production-style portfolio project for a real restaurant workflow.

- **Customer experience:** browse the menu, filter and search dishes, add items to cart, place orders, pay online or by Cash on Delivery, and track order status in real time.
- **Admin experience:** manage foods, categories, orders, payments, analytics, and restaurant settings behind role-based authentication.

The app uses real PostgreSQL data on Supabase, not `localStorage` or mock-only state. Seed files are included only for initial setup and reference.

---

## Features

### Customer
- Browse featured categories and popular dishes.
- Search, filter, and sort menu items.
- View food details with related items.
- Manage cart quantities and totals.
- Register and log in with secure credentials.
- Checkout with Cash on Delivery or SSLCommerz online payment.
- Track live order status.
- View order history for the signed-in customer.

### Admin
- View dashboard stats and charts.
- Create, edit, delete, and toggle foods and categories.
- Upload and manage real photos.
- Update order status in real time.
- Review payment summaries and transactions.
- Analyze revenue, category performance, and top foods.
- Manage restaurant info and delivery preferences.
- Restrict all admin actions to authenticated `ADMIN` users.

---

## Tech Stack

| Layer | Technology |
| --- | --- |
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| UI Icons | lucide-react |
| Charts | Recharts |
| Database | PostgreSQL on Supabase |
| ORM | Prisma |
| Authentication | NextAuth.js (Credentials + JWT) |
| Storage | Supabase Storage |
| Payments | SSLCommerz |
| Email | Resend |
| Validation | Zod |

---

## Screenshots

> Add screenshots or a short GIF here if available. A visual preview usually improves the README more than extra text. [web:68][web:73]

---

## Project Structure

```txt
dineflow/
├─ app/
│  ├─ (customer)/
│  ├─ admin/
│  ├─ api/
│  ├─ layout.tsx
│  └─ globals.css
├─ components/
├─ context/
├─ lib/
├─ prisma/
├─ data/
├─ docs/
├─ types/
├─ middleware.ts
└─ public/
```

---

## Getting Started

### Prerequisites
- Node.js 18.17 or newer.
- A Supabase project.
- SSLCommerz credentials for online payment testing.
- Resend API key for emails.

### 1. Install dependencies
```bash
npm install
```

### 2. Set up environment variables
Copy `.env.example` to `.env` and `.env.local`, then fill in the required values for:
- Supabase database URL
- Supabase project URL and keys
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`
- SSLCommerz credentials
- Resend API key

### 3. Push and seed the database
```bash
npm run db:push
npm run db:seed
```

### 4. Start the development server
```bash
npm run dev
```

### 5. Open the app
- Customer site: `http://localhost:3000`
- Admin dashboard: `http://localhost:3000/admin`

---

## Available Routes

| Route | Description |
| --- | --- |
| `/` | Home page |
| `/menu` | Menu browsing, filters, and sorting |
| `/menu/[id]` | Food details |
| `/cart` | Shopping cart |
| `/checkout` | Checkout flow |
| `/checkout/payment-failed` | Retry failed payment |
| `/order-confirmation/[id]` | Order success page |
| `/track-order/[id]` | Live order status tracker |
| `/my-orders` | Customer order history |
| `/login`, `/register` | Authentication |
| `/about`, `/contact` | Informational pages |
| `/admin` | Admin dashboard overview |
| `/admin/foods` | Food management |
| `/admin/categories` | Category management |
| `/admin/orders` | Order management |
| `/admin/payments` | Payment overview |
| `/admin/analytics` | Sales analytics |
| `/admin/settings` | Restaurant settings |

---

## Seed Data

The `data/*.ts` files are used for initial database seeding and reference only.

- `foods.ts` — starter menu items.
- `categories.ts` — starter categories.
- `restaurant.ts` — restaurant settings and profile.
- `orders.ts`, `payments.ts`, `analytics.ts` — historical reference only.

---

## Roadmap

See `ROADMAP.md` for the full phase-by-phase status and `progress.md` for the session history.

| Phase | Status |
| --- | --- |
| Database | Done |
| Authentication | Done |
| Payments | Done |
| Image uploads | Done |
| Notifications | Done |
| Deployment hardening | Pending |
| Security hardening | Pending |
| QA and testing | Pending |
| Client handover | Pending |

---

## Notes for Development

- Run `npm run lint` before committing changes.
- Use `useCatalog()` and `useOrders()` for client-side data access.
- Keep shared design tokens in `tailwind.config.ts`.
- Protect server mutations with `requireAdmin()` or equivalent server-side checks.
- Keep the README aligned with the actual implementation so it remains trustworthy.

---

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.