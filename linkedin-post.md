# LinkedIn Post — DineFlow

Copy the version below that fits your voice. Fill in the 🔗 placeholders before posting.

---

## Option A — Build-in-public / technical angle

I built a full restaurant ordering & management platform from scratch — DineFlow.

It's a two-sided product:
🍽️ A customer storefront — browse, search, cart, checkout, live order tracking
📊 An admin dashboard — menu management, order pipeline, payments overview, sales analytics

What made this a genuinely useful project to build wasn't the UI (though I'm proud of
how it turned out) — it was the architecture decisions:

→ Built the entire frontend on mock data first, but structured every piece of state
through Context providers shaped like the eventual database schema — so migrating to
a real backend later is a contained change, not a rewrite.

→ Deployed on Vercel with a Supabase Postgres database, using separate pooled/direct
connection strings to avoid the connection-exhaustion issues that trip up a lot of
serverless + Postgres setups.

→ Caught and fixed a subtle content-integrity bug: several placeholder images were
referencing invalid CDN URLs. Instead of shipping it, I verified every single image
against a live source before calling it done.

Tech stack: Next.js 14 · TypeScript · Tailwind CSS · Prisma · PostgreSQL (Supabase) ·
NextAuth.js · Vercel

🔗 Live demo: [YOUR LIVE URL]
🔗 Case study: [LINK TO case-study.html OR PDF]
🔗 Source: [YOUR GITHUB REPO, if public]

Currently wiring up the API layer to move it from prototype to fully live product —
more updates soon.

#webdevelopment #nextjs #typescript #fullstack #buildinpublic #saas

---

## Option B — Shorter, portfolio-announcement angle

New project: DineFlow 🍔

A restaurant ordering platform with a customer storefront (menu, cart, checkout,
live order tracking) and a full admin dashboard (menu management, orders, analytics) —
built with Next.js, TypeScript, and a real PostgreSQL database on Supabase.

Designed to go from prototype to production without a rewrite: the entire data layer
was architected around the eventual database schema from day one.

Check it out: [YOUR LIVE URL]
Case study with the full breakdown: [LINK]

#webdev #nextjs #reactjs #fullstackdeveloper

---

## Option C — For clients/freelance angle

Just shipped a restaurant SaaS platform — DineFlow — as a portfolio build to
demonstrate exactly the kind of work I take on for restaurant &amp; small business clients.

✅ Customer ordering site — menu, cart, checkout, live tracking
✅ Admin back-office — manage the menu, track orders, see sales at a glance
✅ Built on a real database (Postgres/Supabase), not just a static demo
✅ Deployed and live — not a mockup

If you or someone you know runs a restaurant and wants an ordering system that
doesn't come with a 15% commission bolted on, this is the kind of platform I build.

🔗 Live demo: [YOUR LIVE URL]
🔗 Details: [CASE STUDY LINK]

DMs open.

#webdevelopment #smallbusiness #restauranttech #freelancedeveloper
