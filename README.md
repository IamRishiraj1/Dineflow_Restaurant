# DineFlow — Restaurant Management SaaS

DineFlow is a modern restaurant ordering and management platform. It has two
experiences in one codebase:

- **Customer storefront** — browse the menu, search & filter, view food
  details, add to cart, create a real account, check out, pay online, and
  track an order in real time.
- **Admin dashboard** — manage foods, categories, and orders; review
  payments; view sales analytics; and configure restaurant settings — all
  behind real authentication.

> **Status: full-stack and live.** The app runs on a real Postgres database
> (Supabase), real authentication (NextAuth.js), real online payments
> (SSLCommerz), real image uploads (Supabase Storage), and real transactional
> email (Resend). It's deployed and working end-to-end in production at
> [dineflow-restaurant-two.vercel.app](https://dineflow-restaurant-two.vercel.app).
> What's left is deployment/security hardening and a custom domain — see
> [What's Left](#whats-left) below.

---

## Features

### Customer

- Home page (hero, featured categories, popular dishes, story, CTA)
- Full menu with search, category tabs, price filter, and sorting
- Food details page with quantity selector and related dishes
- Cart with quantity controls, subtotal/delivery/total
- Real account registration & login (NextAuth.js, hashed passwords)
- Checkout with **Cash on Delivery or online payment** (cards, bKash, Nagad,
  Rocket, bank transfer via SSLCommerz)
- Payment retry flow if an online payment fails
- Order confirmation page + email confirmation
- Live order tracker (Placed → Confirmed → Preparing → Ready → Completed),
  backed by real order status in the database
- Status-update emails as the restaurant moves an order along
- My Orders history page, scoped to the logged-in customer

### Admin

- Login-gated at `/admin` — only `ADMIN`-role accounts can get in
- Dashboard with stat cards, revenue/order charts, popular foods, recent
  orders — all reading live data
- Food management — add / edit / delete / toggle availability, with real
  photo uploads (compressed client-side, stored in Supabase Storage)
- Category management — add / edit / delete / toggle visibility
- Order management — filter by status, update order status (customers see
  the update immediately on their tracking page, and get an email)
- Live "new order" toast + notification bell (polls every 10s)
- Payment overview — revenue summary + transaction table, with the real
  SSLCommerz gateway reference for reconciliation
- Analytics — 30-day trends, category performance, average order value
- Settings — restaurant info, opening hours, currency & delivery preferences

All admin CRUD operations hit real API routes backed by Postgres, so changes
made in the admin dashboard are immediately reflected on the customer-facing
site for every visitor — not just your own browser.

---

## Tech Stack

| Layer          | Choice                                           |
| -------------- | ------------------------------------------------- |
| Framework      | Next.js 14 (App Router)                          |
| Language       | TypeScript                                       |
| Styling        | Tailwind CSS                                     |
| Icons          | lucide-react                                     |
| Charts         | Recharts                                         |
| Database       | PostgreSQL (Supabase) + Prisma ORM               |
| Auth           | NextAuth.js (Credentials provider) + bcrypt      |
| Payments       | SSLCommerz (sandbox verified live in production)  |
| Image storage  | Supabase Storage                                 |
| Email          | Resend                                           |
| Validation     | Zod                                               |

---

## Project Structure

```
dineflow/
├─ app/
│  ├─ (customer)/          # customer-facing route group (has Navbar + Footer)
│  │  ├─ page.tsx           # home
│  │  ├─ menu/page.tsx
│  │  ├─ menu/[id]/page.tsx
│  │  ├─ cart/page.tsx
│  │  ├─ checkout/page.tsx
│  │  ├─ checkout/payment-failed/page.tsx
│  │  ├─ order-confirmation/[id]/page.tsx
│  │  ├─ track-order/[id]/page.tsx
│  │  ├─ my-orders/page.tsx
│  │  ├─ login/page.tsx
│  │  ├─ register/page.tsx
│  │  ├─ about/page.tsx
│  │  └─ contact/page.tsx
│  ├─ admin/                # admin dashboard route group (has Sidebar + Header)
│  │  ├─ page.tsx           # dashboard overview
│  │  ├─ foods/page.tsx
│  │  ├─ categories/page.tsx
│  │  ├─ orders/page.tsx
│  │  ├─ payments/page.tsx
│  │  ├─ analytics/page.tsx
│  │  └─ settings/page.tsx
│  ├─ api/
│  │  ├─ auth/[...nextauth]/route.ts
│  │  ├─ register/route.ts
│  │  ├─ categories/…
│  │  ├─ foods/…
│  │  ├─ orders/…
│  │  ├─ settings/…
│  │  ├─ upload/route.ts
│  │  └─ payments/sslcommerz/{init,success,fail,cancel,ipn}/route.ts
│  ├─ layout.tsx            # root layout — fonts + context providers
│  └─ globals.css
├─ components/
│  ├─ ui/                   # Button, Input, Modal, Badge, EmptyState, ImageUploadField, etc.
│  ├─ layout/                # Navbar, Footer
│  ├─ customer/               # Hero, FoodCard, CategoryCard, MenuBrowser, …
│  ├─ cart/                    # CartItemRow, CartSummary
│  ├─ order/                    # OrderTracker, OrderStatusBadge, OrderCard
│  └─ admin/                     # Sidebar, StatCard, charts, form modals, …
├─ context/                  # CatalogContext, CartContext, OrderContext, ToastContext (now fetch-backed)
├─ lib/                      # utils.ts, sslcommerz.ts, email.ts, image-compress.ts
├─ prisma/                   # schema.prisma, migrations, seed
├─ types/                    # shared TypeScript interfaces
├─ middleware.ts             # protects /admin/* behind auth + role check
└─ public/
```

---

## Getting Started

**Prerequisites:** [Node.js](https://nodejs.org) 18.17+, a Supabase project.

1. **Install dependencies**

   ```
   npm install
   ```

2. **Set up environment variables**

   Copy `.env.example` to `.env` and fill in:
   - Supabase database URL + service role key
   - `NEXTAUTH_URL` / `NEXTAUTH_SECRET`
   - SSLCommerz sandbox store ID + password (`SSLCOMMERZ_IS_LIVE=false`)
   - Resend API key

3. **Push the database schema and seed data**

   ```
   npm run db:push
   ```

4. **Start the development server**

   ```
   npm run dev
   ```

5. **Open the app**

   - Customer site: `http://localhost:3000`
   - Admin dashboard: `http://localhost:3000/admin` (seeded admin account —
     **change the default password before any real use**)

> Note: Resend's sandbox sender can only email the address your Resend
> account is registered under until you verify a domain. Use that same
> address for both restaurant settings and test checkouts, or emails will
> silently fail to send (logged server-side, not surfaced to the user).

---

## Available Routes

| Route                       | Description                              |
| ---------------------------- | ----------------------------------------- |
| `/`                          | Home page                                 |
| `/menu`                      | Menu browsing, search & filters           |
| `/menu/[id]`                 | Food details                              |
| `/cart`                      | Shopping cart                             |
| `/checkout`                  | Checkout flow (COD or online payment)     |
| `/checkout/payment-failed`   | Payment retry flow                        |
| `/order-confirmation/[id]`   | Order success page                        |
| `/track-order/[id]`          | Live order status tracker                 |
| `/my-orders`                 | Logged-in customer's order history        |
| `/login`, `/register`        | Real authentication                       |
| `/about`, `/contact`         | Informational pages                       |
| `/admin`                     | Admin dashboard overview (login required) |
| `/admin/foods`               | Food management + image uploads           |
| `/admin/categories`          | Category management                       |
| `/admin/orders`              | Order management                          |
| `/admin/payments`            | Payment overview (real SSLCommerz refs)   |
| `/admin/analytics`           | Sales analytics                           |
| `/admin/settings`            | Restaurant settings                       |

---

## What's Left

The core product is done and live. What remains is hardening and polish
before real client handover — see `TODO.md` for the full checklist:

| Phase | Status |
| ----- | ------ |
| 2 — Real database | ✅ Done |
| 3 — Real authentication | ✅ Done |
| 4 — Real payments (SSLCommerz) | ✅ Done, verified live |
| 5 — Real image uploads | ✅ Done |
| 6 — Notifications (Resend email) | ✅ Done |
| 7 — Deployment hardening (custom domain, staging, analytics) | ⏳ Not started |
| 8 — Security hardening (rate limiting, full input validation audit) | ⏳ Not started |
| 9 — QA & cross-device testing | ⏳ Not started |
| 10 — Client handover (docs, credential rotation) | ⏳ Not started |

---

## Notes for Continued Development

- Run `npm run lint` to check for lint issues as you add features.
- `context/CatalogContext.tsx` and `context/OrderContext.tsx` are the single
  source of truth for foods, categories, and orders — they now call the real
  API routes rather than reading `localStorage`, so read from them with
  `useCatalog()` / `useOrders()` rather than fetching directly in new
  components.
- Colors, fonts, and spacing are defined once in `tailwind.config.ts` —
  adjust the palette there rather than hardcoding new colors in components.
- See `docs/PHASE-4-PAYMENT-SETUP.md`, `docs/PHASE-5-IMAGE-UPLOAD-SETUP.md`,
  and `docs/PHASE-6-EMAIL-SETUP.md` for provider-specific setup instructions.
