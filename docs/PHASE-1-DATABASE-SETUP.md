# Phase 1 — Database Setup (Supabase + Prisma)

This is the first step in turning DineFlow into a real full-stack app: a live
PostgreSQL database, hosted on Supabase, with Prisma as the tool that lets
our Next.js code read and write to it safely (with full TypeScript types).

Follow these steps in order. They take about 10–15 minutes.

---

## 1. Create your Supabase project

1. Go to [supabase.com](https://supabase.com) and sign up (GitHub login is fastest).
2. Click **New Project**.
3. Fill in:
   - **Name**: `dineflow` (or your client's restaurant name)
   - **Database Password**: generate a strong one and **save it somewhere safe** — you'll need it in step 3. This is not your Supabase login password.
   - **Region**: pick the one closest to your customers (e.g. Singapore for Bangladesh)
4. Click **Create new project**. It takes 1–2 minutes to provision.

## 2. Get your API keys

Once the project is ready:

1. Go to **Project Settings** (gear icon) → **API**.
2. Copy these three values — you'll paste them into `.env.local` in step 4:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` (keep this secret — never expose it in frontend code)

## 3. Get your database connection strings

1. Still in **Project Settings**, go to **Database**.
2. Under **Connection string**, you'll see two tabs/modes:
   - **Transaction pooler** (port `6543`) — copy this into `DATABASE_URL`
   - **Session** / **Direct connection** (port `5432`) — copy this into `DIRECT_URL`
3. Both connection strings include a `[YOUR-PASSWORD]` placeholder — replace it with the database password you set in step 1.

## 4. Set up your local environment file

In the project root:

```bash
cp .env.example .env.local
cp .env.example .env
```

(Yes, both files — Prisma's CLI reads `.env`, Next.js reads `.env.local` at
runtime. Keep them identical.)

Open both files and paste in the 5 values from steps 2–3. Then generate an
auth secret and add it too:

```bash
openssl rand -base64 32
```

Paste the output as `NEXTAUTH_SECRET` in both files.

## 5. Install dependencies

```bash
npm install
```

This also runs `prisma generate` automatically (via the `postinstall` script),
which creates the typed Prisma client based on `prisma/schema.prisma`.

## 6. Push the schema to your database

```bash
npm run db:push
```

This creates all the tables (`User`, `Food`, `Category`, `Order`, etc.) in
your Supabase database, based on `prisma/schema.prisma`. You can verify it
worked by going to **Table Editor** in the Supabase dashboard — you should
see all the tables listed.

> We're using `db push` rather than `db:migrate` for this first setup because
> it's simpler for a fresh database. Once the app is live, switch to
> `npm run db:migrate` for future schema changes — it keeps a migration
> history, which matters once there's real production data.

## 7. Seed the database with your menu data

```bash
npm run db:seed
```

This loads your existing mock menu (foods, categories), sample orders, and
restaurant settings into the real database — so you don't start from a blank
slate. It also creates one admin login:

```
email:    admin@dineflow.example
password: ChangeMe123!
```

**Change this password as soon as real authentication is wired up (Phase 3)
— it's intentionally weak so you remember to change it.**

## 8. Verify it worked

```bash
npm run db:studio
```

This opens Prisma Studio (a visual database browser) at
`http://localhost:5555`. You should see your foods, categories, orders, and
the admin user, all populated.

---

## ✅ Checkpoint

At this point you have a real, live PostgreSQL database with your menu data
in it — but the app itself (`npm run dev`) is *still reading from the old
mock `data/*.ts` files*, not the database yet. That's intentional — it keeps
the app working while we build the database in parallel.

**Next up (Phase 2):** I'll build the API routes that let the app actually
read and write to this database, and switch the admin dashboard and
storefront over to use them.

Let me know once you've completed steps 1–8 and confirmed Prisma Studio
shows your data, and we'll move on.
