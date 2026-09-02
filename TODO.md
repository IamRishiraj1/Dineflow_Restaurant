# DineFlow — Complete Project TODO
### From current state → live, full-stack, business-ready, portfolio-ready

**Current status (as of this file):** Frontend deployed live on Vercel at
`dineflow-restaurant-two.vercel.app`, Supabase database created and seeded,
but the running app still reads/writes mock data (Context + localStorage),
not the real database. Authentication, payments, and image uploads are
still UI-only/mocked.

Use this file as your master checklist. Check items off as you go. Where a
step needs me to write code, say "let's do step X" and I'll build it.

---

## PHASE 2 — Connect the app to the real database ✅ CODE COMPLETE

*Goal: admin edits and customer orders persist in Supabase, not the browser.*

- [x] Build API routes for **Categories**: `GET/POST /api/categories`, `PATCH/DELETE /api/categories/[id]`
- [x] Build API routes for **Foods**: `GET/POST /api/foods`, `PATCH/DELETE /api/foods/[id]`
- [x] Build API routes for **Orders**: `GET/POST /api/orders`, `PATCH /api/orders/[id]` (status updates)
- [x] Build API route for **Restaurant Settings**: `GET/PATCH /api/settings`
- [x] Replace `CatalogContext`'s localStorage logic with real `fetch()` calls to the new API routes
- [x] Replace `OrderContext`'s localStorage logic with real `fetch()` calls
- [x] Add loading and error states everywhere data is now fetched over the network
- [ ] **YOU NEED TO DO THIS:** run `npm run db:push` again — the schema changed (`Food.categoryId` is now nullable) — see `progress.md`
- [ ] **YOU NEED TO DO THIS:** test the full loop locally (see `progress.md` → "How to test this")
- [ ] Test: add a food in `/admin/foods`, refresh the page, confirm it's still there
- [ ] Test: open the site in two different browsers/devices, confirm both see the same live menu
- [ ] Push to GitHub + let Vercel redeploy
- [x] Known gap resolved: admin can now toggle a food's "Popular"/"Featured" flags from the UI (added to `FoodFormModal`)

---

## PHASE 3 — Real authentication ✅ CODE COMPLETE

*Goal: `/admin` is locked behind a real login; customers can create real accounts.*

- [x] Install and configure NextAuth.js (Credentials provider + Prisma-backed user lookup)
- [x] Create `app/api/auth/[...nextauth]/route.ts`
- [x] Wire the existing Login/Register UI to actually call NextAuth's `signIn()` / a real `/api/register` route
- [x] Hash passwords with bcrypt on registration
- [x] Add `middleware.ts` that redirects unauthenticated users away from `/admin/*`
- [x] Add a role check so only `ADMIN` users (not regular customers) can reach `/admin/*`
- [x] Every mutating API route (foods/categories/orders/settings POST/PATCH/DELETE) now calls `requireAdmin()` server-side — the "⚠️ not yet protected" warnings from Phase 2 are resolved
- [x] `GET /api/orders` now requires ADMIN; added `GET /api/orders?mine=true` (requires any login) for customer order history
- [x] Wire "My Orders" to show only the logged-in customer's own orders — page now requires login
- [x] Navbar shows real logged-in state (name + logout + admin link) instead of a static "Login" link
- [ ] **YOU NEED TO DO THIS:** run `npm install` (new dependencies: `next-auth`, `@next-auth/prisma-adapter`, `bcryptjs`, `tailwind-merge`)
- [ ] **YOU NEED TO DO THIS:** change the seeded admin password (`ChangeMe123!`) — see `progress.md`
- [ ] Test: log out, try visiting `/admin` directly — confirm you're redirected to login
- [ ] Test: register a new customer account, place an order, confirm it appears in "My Orders"
- [ ] Test: log in as the seeded admin, confirm `/admin` loads and all CRUD actions still work
- [ ] Known gap: guest checkout orders (no account) aren't linked to any user — this is intentional (forcing login to order adds friction), but means a guest can only track that one order via its direct link, not see order history. Worth a banner nudging guests to create an account after checkout, as a future polish item.

---

## PHASE 4 — Real payments ✅ DONE AND VERIFIED LIVE (SSLCommerz)

*Goal: customers can pay online, not just choose Cash on Delivery.*

- [x] Decided on gateway: **SSLCommerz** — best fit for a Bangladeshi restaurant, one integration covers cards + bKash + Nagad + Rocket + bank transfer, and its sandbox needs no business verification (good for portfolio demo purposes too)
- [x] Built `lib/sslcommerz.ts` — session initiation + server-to-server validation, following SSLCommerz's documented Session API v4 contract
- [x] Built the checkout → payment redirect flow (`app/api/payments/sslcommerz/init/route.ts`, wired into checkout page)
- [x] Built success/fail/cancel redirect handlers AND an IPN webhook handler for reliability (see `docs/PHASE-4-PAYMENT-SETUP.md` for why both exist)
- [x] Built a `/checkout/payment-failed` page with a "Try Payment Again" retry flow against the same order
- [x] Removed the old "payment is mocked" fake card-number form fields from checkout
- [x] Fixed a real bug found during review: order creation was marking `card` payments as `PAID` immediately at checkout, before the customer ever reached SSLCommerz. Now every order starts `PENDING`; only a validated SSLCommerz confirmation (or COD collection) marks it paid.
- [x] Admin Payments page now shows the real SSLCommerz `paymentValId` as a "Gateway Ref" column (for reconciling against SSLCommerz's own dashboard) instead of a fake synthetic transaction id
- [x] Signed up for SSLCommerz sandbox, ran `db:push`, tested a full successful payment, a failed payment, and the retry flow — **all confirmed working**
- [x] Fixed `data/orders.ts` — the 12 mock orders were missing the new `paymentValId` field, which broke the Vercel production build (TypeScript error, not caught locally in this sandbox since there's no way to run `next build` here)
- [x] Fixed `app/(customer)/checkout/payment-failed/page.tsx` — `useSearchParams()` needs a `<Suspense>` boundary for Next.js's static prerendering, which also broke the Vercel build. Restructured into a `PaymentFailedContent` inner component wrapped by the default-exported `PaymentFailedPage`.
- [x] **Deployed to Vercel and confirmed working in production** — full sandbox payment flow (success, fail, cancel, retry) verified live, not just locally
- [ ] Register a **live** merchant account only once you have a real client ready to accept real payments (requires business documents, takes a few business days — see the last section of the setup doc)
- [ ] Switch `SSLCOMMERZ_IS_LIVE` to `"true"` with live credentials only after live testing

---

## PHASE 5 — Real image uploads ✅ CODE COMPLETE

*Goal: the restaurant owner can upload their own food photos through the admin panel.*

- [x] Built `lib/image-compress.ts` — client-side resize/compress via the browser's Canvas API (no new dependency, no server-side native library needed)
- [x] Built `app/api/upload/route.ts` — admin-only, validates file type/size server-side (never trusts the client-side check alone), uploads to Supabase Storage, returns the public URL
- [x] Built `components/ui/ImageUploadField.tsx` — reusable upload UI with preview, used by both `FoodFormModal` and `CategoryFormModal`, with "paste a URL instead" kept as a fallback option
- [x] Replaced the plain "Image URL" text field in both admin forms
- [ ] **YOU NEED TO DO THIS:** create the `food-images` bucket in Supabase Storage — see `docs/PHASE-5-IMAGE-UPLOAD-SETUP.md`
- [ ] Test: upload a real food photo from the admin panel, confirm it displays correctly on the menu
- [ ] Test: upload a large phone photo, confirm it still uploads reasonably fast (compression working)

---

## PHASE 6 — Notifications ✅ CODE COMPLETE (Resend)

*Goal: customers and the restaurant get notified automatically, not just via on-screen UI.*

- [x] **Admin-side in-app live updates** — done ahead of schedule. `app/admin/layout.tsx` polls every 10 seconds and toasts "New order received" the moment one comes in. `AdminHeader`'s notification bell shows real orders needing attention.
- [x] Chose **Resend** — simple API, generous free tier (3,000/month), no SMTP setup
- [x] Built `lib/email.ts` — three email types (confirmation, status update, new-order alert), a shared inline-styled HTML shell (table-based layout for email-client compatibility), and a `sendEmailSafely()` wrapper so a Resend outage or missing API key can never break checkout or an admin action — failures are logged and swallowed, never thrown
- [x] Wired the **confirmation + restaurant alert** emails into `app/api/orders/route.ts` (fires immediately for Cash on Delivery) AND `app/api/payments/sslcommerz/{success,ipn}/route.ts` (fires only once SSLCommerz actually validates payment for online orders — deliberately NOT at order creation, so a customer never gets a "confirmed" email for a payment that then fails)
- [x] Wired the **status-update** email into `app/api/orders/[id]/route.ts` — fires only when `status` actually changes to a different value (compared in DB-enum format, not the frontend's lowercase strings, to avoid a same-value comparison bug that would've fired on every PATCH)
- [x] Idempotency verified: the IPN handler's existing `if (order.paymentStatus === "PAID") return` guard means the success-redirect and IPN webhook racing each other can't send duplicate confirmation emails
- [ ] **YOU NEED TO DO THIS:** sign up for free Resend account — see `docs/PHASE-6-EMAIL-SETUP.md`
- [ ] **YOU NEED TO DO THIS:** run `npm install` (new dependency: `resend`)
- [ ] ⚠️ **Read this before testing:** Resend's sandbox sender can ONLY email the address your Resend account is registered under, until you verify a domain. Use your own email as both the restaurant's settings email AND the checkout email when testing, or every send will silently fail (logged server-side, but swallowed — checkout won't show an error). Full explanation in the setup doc.
- [ ] Test: place a COD order as yourself, confirm you get both the confirmation and the restaurant-alert email
- [ ] Test: change that order's status a few times in `/admin/orders`, confirm a status email arrives each time
- [ ] Test: complete a full SSLCommerz sandbox payment, confirm the confirmation/alert emails arrive only AFTER payment succeeds, not at checkout
- [ ] (Optional) Add SMS notifications via a provider like Twilio for delivery updates
- [ ] (Optional, no external service needed) Browser push notifications via the Web Notifications API for customers who keep the tracking tab open in the background

---

## PHASE 7 — Deployment hardening

*Goal: the live site is fast, reliable, and on the client's own domain.*

- [ ] Buy a custom domain (e.g. `dineflow.com` or the restaurant's actual name) if the client wants one
- [ ] Connect the domain to Vercel (Project → Settings → Domains)
- [ ] Confirm SSL/HTTPS is active (Vercel does this automatically once the domain is connected)
- [ ] Set `NEXTAUTH_URL` and `NEXT_PUBLIC_APP_URL` to the final custom domain
- [ ] Set up a separate "staging" environment/branch on Vercel so you can test changes before they go live
- [ ] Enable Vercel Analytics or a similar tool to monitor real traffic and errors

---

## PHASE 8 — Security hardening

*Goal: the app doesn't fall over or leak data under real-world use.*

- [ ] Add input validation (Zod schemas — already installed) to every API route, not just the frontend forms
- [ ] Add rate limiting to public API routes (especially checkout and login) to prevent abuse
- [ ] Review all API routes to confirm customers can't read or edit other customers' orders
- [ ] Confirm `SUPABASE_SERVICE_ROLE_KEY` is never sent to the browser (server-side only)
- [ ] Add CSRF protection where relevant (NextAuth handles most of this automatically)
- [ ] Run `npm audit` and update any dependencies with known vulnerabilities
- [ ] Remove or restrict any remaining debug/test data before real customers use the site

---

## PHASE 9 — QA & testing

*Goal: confidence that everything works before you show it to the client.*

- [ ] Full click-through of every customer page on both desktop and mobile
- [ ] Full click-through of every admin page on both desktop and mobile
- [ ] Test the complete order flow: browse → cart → checkout → confirmation → tracking → admin status update → customer sees update
- [ ] Test empty states: empty cart, no orders yet, no search results
- [ ] Test error states: what happens if the network fails mid-checkout?
- [ ] Test on a real phone, not just a resized browser window
- [ ] Ask 2–3 people outside the project to try ordering something and note anything confusing

---

## PHASE 10 — Client handover

*Goal: the client can actually run their own business on this, without you.*

- [ ] Write a short **Admin User Guide**: how to add a food, change an order's status, edit settings — with screenshots
- [ ] Change all default/seeded passwords before handing over credentials
- [ ] Hand over: Vercel project access (or transfer ownership), Supabase project access, domain registrar access if applicable
- [ ] Document the tech stack and where the code lives (GitHub repo) in case they hire another developer later
- [ ] Agree on a support/maintenance plan: are you available for bug fixes, a monthly retainer, or is this a one-time handoff?
- [ ] Back up the database (Supabase has automatic backups on paid plans — confirm the plan covers this)
- [ ] Do a final walkthrough call with the client showing them the admin panel live

---

## PORTFOLIO DELIVERABLES (already generated alongside this file)

- [x] `case-study.html` — polished, styled case study page
- [x] `case-study.pdf` — same case study, downloadable/printable
- [x] `linkedin-post.md` — ready-to-publish LinkedIn post copy
- [x] `portfolio-description.md` — shorter blurb for a portfolio site's project card

**Still to do once the project is further along:**
- [ ] Take real screenshots/recordings of the finished product for the case study (currently written to work without them — add them once Phases 2–3 are done and the UI has real, live data flowing through it)
- [ ] Update the case study's "Tech Stack" and "Status" sections once payments/auth go live
- [ ] Add the live URL and (if the repo is public) GitHub link to both the case study and LinkedIn post before publishing
