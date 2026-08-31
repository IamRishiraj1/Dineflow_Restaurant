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
- [ ] Known gap: admin can't yet toggle a food's "Popular"/"Featured" flags from the UI — see `progress.md`

---

## PHASE 3 — Real authentication

*Goal: `/admin` is locked behind a real login; customers can create real accounts.*

- [ ] Install and configure NextAuth.js (`next-auth`, `@next-auth/prisma-adapter` — already in `package.json`)
- [ ] Create `app/api/auth/[...nextauth]/route.ts` with a Credentials provider (email + password)
- [ ] Wire the existing Login/Register UI to actually call NextAuth's `signIn()` / a real registration API route
- [ ] Hash passwords with bcrypt on registration (bcryptjs is already installed)
- [ ] Add middleware (`middleware.ts`) that redirects unauthenticated users away from `/admin/*`
- [ ] Add a role check so only `ADMIN` users (not regular customers) can reach `/admin/*`
- [ ] Change the seeded admin password (`ChangeMe123!`) to something real and private
- [ ] Wire "My Orders" to show only the logged-in customer's own orders
- [ ] Test: log out, try visiting `/admin` directly — confirm you're redirected to login
- [ ] Test: register a new customer account, place an order, confirm it appears in "My Orders"

---

## PHASE 4 — Real payments (post-launch, Cash on Delivery live first)

*Goal: customers can pay online, not just choose Cash on Delivery.*

- [ ] Decide on gateway: SSLCommerz (recommended for Bangladesh) vs. bKash Merchant API vs. Stripe
- [ ] Register a merchant account with the chosen provider (this can take a few business days — start early)
- [ ] Get sandbox/test API keys from the provider
- [ ] Build the checkout → payment redirect flow (customer is sent to the gateway's hosted payment page)
- [ ] Build a webhook/callback API route that receives payment confirmation and updates `Order.paymentStatus`
- [ ] Test thoroughly in the gateway's sandbox mode before going live
- [ ] Switch from sandbox keys to live keys only once testing is solid
- [ ] Update the checkout UI to remove the "payment is mocked" notice

---

## PHASE 5 — Real image uploads

*Goal: the restaurant owner can upload their own food photos through the admin panel.*

- [ ] Create a Supabase Storage bucket (e.g. `food-images`)
- [ ] Set the bucket's access policy (public read, authenticated write)
- [ ] Add an upload API route that accepts an image file and stores it in Supabase Storage
- [ ] Replace the "Image URL" text field in `FoodFormModal` / `CategoryFormModal` with a real file upload input
- [ ] Add image compression/resizing before upload (so large phone photos don't slow the site down)
- [ ] Test: upload a real food photo from the admin panel, confirm it displays correctly on the menu

---

## PHASE 6 — Notifications

*Goal: customers and the restaurant get notified automatically, not just via on-screen UI.*

- [ ] Choose an email provider (Resend is simple and has a generous free tier)
- [ ] Send an order confirmation email to the customer when they place an order
- [ ] Send a "your order is ready" email when status changes to Ready
- [ ] Send a new-order alert email to the restaurant's inbox when an order comes in
- [ ] (Optional) Add SMS notifications via a provider like Twilio for delivery updates

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
