# DineFlow — Progress & Handoff Notes

**Read this file first if you're picking up this project in a new session.**
`TODO.md` has the full phase-by-phase roadmap; this file is the detailed
"what actually happened and why" companion — written so another Claude
session (or a human developer) can continue without re-deriving context.

---

## Important context: this was a MERGE session

The user had previously taken the Phase-2-complete zip I built and, instead
of testing it directly, ran a **separate, parallel session using Claude
Code** (evidenced by a `CLAUDE.md` file and `.git` history in what they
uploaded as `dineflow_v2.zip`). That parallel session:

- Started from the git history point *right after* the Unsplash image
  fixes — **before** my Phase 2 zip's changes were ever applied
- Built its own (smaller) version of Phase 2: only Categories + Foods API
  routes, no Orders or Settings API, and no admin route protection
- Then built real Phase 3 authentication: NextAuth.js with a Credentials
  provider, `lib/auth.ts`, `lib/session.ts` (a `requireAdmin()` helper —
  defined but not actually called anywhere yet), session types, a
  `SessionProvider` wrapper, and real `signIn()` wiring on the Login page
- Also fixed a real, separate bug: an invisible "Explore Menu" button
  caused by `clsx()` not resolving conflicting Tailwind classes — fixed by
  switching to `tailwind-merge`

So there were two divergent branches: **mine** (more complete — orders,
settings, all the async-loading bug fixes, the `categoryId` nullable
schema fix) and **v2** (real auth, but missing orders/settings entirely,
and missing my Phase 2 bug fixes).

**This session merged them**, using my codebase as the base (since it was
strictly more complete on the data layer) and porting v2's authentication
work into it — plus finishing what v2 had left incomplete (auth existed,
but nothing actually *enforced* it yet).

---

## What this merge session actually did

### Ported from v2 into the main codebase
- `lib/auth.ts` — NextAuth config, Credentials provider, JWT session
  strategy, role embedded in the token/session
- `lib/session.ts` — `requireAdmin()` helper (session + role check,
  returns a ready-to-return 401/403 `NextResponse` or the session)
- `types/next-auth.d.ts` — type augmentation so `session.user.id` and
  `session.user.role` are properly typed everywhere
- `components/providers/AuthSessionProvider.tsx` — thin wrapper around
  NextAuth's `SessionProvider`
- `app/api/auth/[...nextauth]/route.ts` — the NextAuth route handler
- Real Login page (calls `signIn("credentials", …)`)
- `tailwind-merge` dependency + the `cn()` utility fix + a new `slugify()`
  helper in `lib/utils.ts`

(Note: files copied from v2 had Windows CRLF line endings — normalized to
LF during the copy.)

### Built fresh, to actually close the security gaps
- **`app/api/register/route.ts`** — v2 had no registration endpoint at
  all; the Register page was still mock-only. Built this from scratch:
  validates input, checks for an existing email, hashes the password,
  creates a `CUSTOMER`-role user. Register page now calls it, then signs
  the new user in immediately.
- **`middleware.ts`** — v2 had no route-level protection for `/admin/*`
  at all (despite `requireAdmin()` existing, nothing called it). Built
  using `next-auth/middleware`'s `withAuth()` — redirects to `/login` if
  no session, redirects to `/` if logged in but not an `ADMIN`.
- **Added `requireAdmin()` calls to every mutating API route** — this is
  the big one. Before this session, every `POST`/`PATCH`/`DELETE` route
  across both branches had a comment saying "⚠️ not yet protected." Now
  they all actually call `requireAdmin()` first:
  - `app/api/categories/route.ts` (POST)
  - `app/api/categories/[id]/route.ts` (PATCH, DELETE)
  - `app/api/foods/route.ts` (POST)
  - `app/api/foods/[id]/route.ts` (PATCH, DELETE)
  - `app/api/orders/[id]/route.ts` (PATCH)
  - `app/api/settings/route.ts` (PATCH)
- **`GET /api/orders` now requires an ADMIN session.** Added a separate
  `GET /api/orders?mine=true` path that requires *any* logged-in session
  and returns only that user's own orders (via `Order.userId`).
- **`POST /api/orders`** now reads the session server-side (via
  `getServerSession`) and links the order to the logged-in user if there
  is one — never trusts a client-supplied user id. Still works for guests
  with no account (deliberately — see "Known gaps" below).
- **Navbar and AdminHeader are now session-aware** — real logged-in
  name, a logout button, an "Admin" link (only shown to admins) instead
  of a static "Login" link / hardcoded "Restaurant Admin" text.

### A real integration bug I found and fixed mid-merge
`OrderContext` (from my earlier Phase 2 work) auto-fetched **all** orders
on mount, for every page in the app — because `OrderProvider` wraps the
entire app at the root layout, including the public storefront. Once
`GET /api/orders` started requiring an admin session, this meant **every
anonymous visitor to the homepage would trigger a failing 401 request**
in the background.

Fixed by removing the automatic fetch entirely. `OrderContext` now
exposes `loadAll()` (admin — fetches everything) and `loadMine()`
(customer — fetches only their own orders) as functions the *consuming
page* calls explicitly in its own `useEffect`:
- `app/admin/page.tsx`, `app/admin/orders/page.tsx`,
  `app/admin/payments/page.tsx` → call `loadAll()` on mount
- `app/(customer)/my-orders/page.tsx` → calls `loadMine()` on mount, and
  now requires login (shows a "Log in to see your orders" prompt via
  `useSession()` if not authenticated, instead of an empty list)
- Checkout, order-confirmation, track-order were already fine — they
  don't depend on the bulk list (`placeOrder` and `fetchOrder` are
  independent, targeted requests)

---

## ⚠️ Action required before this can be tested

**1. Install the new dependencies:**
```bash
npm install
```
(New: `next-auth`, `@next-auth/prisma-adapter`, `bcryptjs`, `tailwind-merge`
— some may already be present from earlier `package.json` edits, but
`npm install` will reconcile everything against `package-lock.json`.)

**2. Confirm your `.env.local` / `.env` already have these** (they should,
from Phase 1 setup — nothing new needed here since middleware/NextAuth
reuse `NEXTAUTH_SECRET` and `NEXTAUTH_URL`):
```
NEXTAUTH_SECRET=...
NEXTAUTH_URL=http://localhost:3000
```

**3. Run it locally:**
```bash
npm run dev
```

**4. Test in this order:**
- Visit `/admin` **while logged out** → should redirect to `/login`
  (this proves `middleware.ts` works)
- Go to `/register`, create a real account → should auto-log-in and
  redirect home; Navbar should now show your name instead of "Login"
- Log out (Navbar → logout icon), then log back in via `/login` with
  the same credentials → should work
- Log in as the seeded admin:
  ```
  email:    admin@dineflow.example
  password: ChangeMe123!
  ```
  → should reach `/admin` successfully, and the header should show
  "Admin" (or whatever name is on that seeded user) instead of "Restaurant
  Admin"
- **As the admin**, add/edit/delete a food and a category — confirm these
  still work now that the routes require `requireAdmin()`
- **Log out**, then try calling one of the admin API routes directly
  (e.g. open browser dev tools → Network, or just try
  `fetch('/api/foods', {method:'POST', ...})` from the console) → should
  get a 401, proving the API-level protection works independently of the
  page-level middleware
- As a **logged-in customer** (not admin), place an order, then visit
  `/my-orders` → the order should appear
- **Log out and place an order as a guest** (no account) → checkout
  should still work (this is intentional), and the confirmation/tracking
  links should still work even though there's no "My Orders" entry for it

**5. Report back exactly what happens**, especially any red console
errors. This merge touched a lot of interconnected files and has not been
run yet — a small bug on first test is normal, not alarming.

**6. Once local testing passes**, push to GitHub and change the seeded
admin password before this goes anywhere near real users:
```bash
git add .
git commit -m "Phase 3: real authentication, merged with Phase 2 orders/settings work"
git push
```

---

## Known gaps / deliberately left unfinished

- **Guest checkout orders aren't linked to any account.** This is
  intentional — requiring login just to order food adds friction most
  restaurant sites avoid. A guest can still track their one order via the
  direct confirmation/tracking link, but won't see it in an order
  *history* unless they register. A good future polish item: a banner on
  the confirmation page suggesting guests create an account.
- **Order-lookup-by-number is somewhat guessable.** `GET /api/orders/[id]`
  is deliberately open (no login required) so guests can view their own
  order — but the order *number* is just a random 5-digit code. Documented
  in the route file itself as a Phase 8 hardening item (e.g. require the
  customer's email as a second factor when looking up by number,
  specifically — not needed for the internal cuid id, which is
  effectively unguessable).
- **No password reset flow.** The Login page still has a non-functional
  "Forgot password?" button. Not scoped into Phase 3 — would need an email
  provider (Phase 6 territory) to send reset links.
- **Admin still can't mark a food as "Popular"/"Featured" from the UI** —
  this gap predates both branches and wasn't touched in this merge.
- **The seeded admin password (`ChangeMe123!`) is still the seeded admin
  password.** Change it for real before any real user touches this site.
- **`supabase/` CLI folder and `.git` history from the v2 upload were not
  merged** — only the application code was ported. If the user wants
  Supabase CLI tooling (local Supabase dev environment, migrations via
  the Supabase CLI rather than Prisma) that's a separate, deliberate
  decision to make later, not something silently carried over.

---

## If you're a new Claude session picking this up

1. Read `TODO.md` for the full roadmap.
2. Read this file for the "how we got here" context above.
3. **Ask the user whether they've run the "Action required" steps and what
   happened** — don't assume this merge works end-to-end. Debug from their
   exact error rather than guessing.
4. If they mention using Claude Code or another tool in parallel again,
   **ask to see the resulting code/zip before assuming anything about its
   state** — as this session demonstrates, parallel work can diverge in
   non-obvious ways (missing routes, unenforced auth helpers, etc.) that
   only show up on close inspection, not from commit messages alone.
5. Once Phase 3 is confirmed working end-to-end, Phase 4 (real payments)
   is next per `TODO.md` — SSLCommerz is the recommended gateway for a
   Bangladesh-based restaurant, but that requires a merchant account the
   user needs to register for externally first (can take a few business
   days), so it's worth raising that lead time early if they want to move
   toward it.
6. The user is a self-described complete beginner developer — keep using
   very explicit, numbered, copy-pasteable instructions for anything they
   need to do outside the code itself.

---

## Addendum: post-merge polish (same session, before any test feedback)

After the merge above, and **before the user had reported back any test
results**, I did a full diff of every remaining file between my codebase
and the v2 upload to make sure nothing else was missed. Findings:

- `README.md`, `.eslintrc.json`, `tsconfig.json`, `prisma/seed.ts`,
  `.env.example`, `components/admin/Sidebar.tsx`, `tailwind.config.ts` —
  all identical between the two branches, nothing to merge.
- `app/admin/foods/page.tsx` — v2's version was actually *behind* mine
  (no loading skeletons, no per-row toggle-loading state, and its
  `FoodFormModal` doesn't await the save the way mine does). Confirmed my
  version should stay as-is; no changes pulled from v2 here.
- `next.config.js` — v2 had changed the image `remotePatterns` from a
  fixed Unsplash-only list to a hostname wildcard (`**`). This is a real
  fix for a real usability gap (the admin Food/Category forms accept any
  pasted image URL, but Next's image optimizer rejects any domain not
  explicitly whitelisted) — ported this over, with a comment explaining
  it's an intentional, temporary loosening until Phase 5 (real uploads)
  removes the need for admins to paste arbitrary URLs at all.

Also closed a previously-documented known gap while I had the file open:
**`FoodFormModal` now has "Show in Popular Dishes" and "Feature on
homepage" checkboxes** (wired to `isPopular`/`isFeatured`, which the
`Food` type and database already supported — only the UI was missing).
This means new foods added via the admin panel can now actually appear in
the homepage's "Popular Dishes" section, which previously only showed the
originally-seeded foods.

**None of this addendum work has been tested either** — it's all still
pending the user's first real test pass through the "Action required"
checklist above.

---

## Session 3: test results confirmed + live-update fixes (all untested changes below)

**Great news:** the user ran the full Phase 3 test checklist from Session
2 (admin redirect-when-logged-out, register, admin login + CRUD, customer
order + My Orders, guest checkout) and **all of it passed.** Phase 3 is
now confirmed working end-to-end, not just "code complete."

Two real gaps the user found through actual use:

1. **Admin dashboard/orders page didn't show new orders without a manual
   refresh.** Root cause: `OrderContext.loadAll()` was only ever called
   once, in each admin page's own mount effect — nothing kept it fresh
   afterward.

   **Fixed** by moving polling into `app/admin/layout.tsx` (which wraps
   every `/admin/*` page and — unlike individual page components —
   does NOT remount when navigating between admin pages, so a single
   10-second interval there stays alive across the whole admin session).
   It also now diffs the incoming order list against a `useRef`-tracked
   set of already-seen order ids and fires a toast ("New order received:
   DF-XXXXX") for genuinely new ones — carefully built so the *first*
   load (every order that already existed) never triggers a toast flood,
   only orders that appear in a *later* poll do.

   Also wired `AdminHeader`'s notification bell to real data — it now
   lists actual orders needing attention (status placed/confirmed, or a
   failed payment) instead of three hardcoded fake lines, and the red
   dot only shows when there's something to see.

   **⚠️ I made and caught a real mistake here worth knowing about:** my
   first edit to `AdminHeader.tsx` used `str_replace` with an `old_str`
   that only matched through the *opening* of the notification dropdown
   section, but the `new_str` I supplied was a complete, self-closing
   component (including the profile menu and closing tags). The tool
   applied it correctly, but the result was a file with the profile
   section and closing tags duplicated — the *original* profile section
   was still there too, right after. Balance-checked, caught it
   immediately (brace count was off by one), and fixed by truncating the
   file back to the single correct copy. **Full file inspected via
   `view` afterward to confirm it's correct** — but genuinely re-verify
   this file compiles cleanly as part of your first test pass, since it's
   the one file this session where a mechanical editing mistake actually
   happened (even though it was caught and fixed).

2. **No notifications reach the customer when their order status
   changes**, unless they happen to have the tracking page open (which
   already polls and updates live — that part already worked). Real
   "reach them anywhere" notifications need an email provider — this is
   Phase 6 work, not something fixable with a quick patch. Added detail
   to `TODO.md` Phase 6 distinguishing what's now done (admin in-app
   live updates) from what still needs an external service (customer
   email notifications) — **the user has not yet been asked whether they
   want to start Phase 6 now**; that's the natural next conversational
   step once GitHub is sorted out (see below).

### GitHub state — flagged by the user, not yet resolved as of writing this

The user's **GitHub repo currently reflects the old `dineflow_v2.zip`
state** (pushed by their separate Claude Code session). Their **local
working directory has the newer merged code** (this session's zip,
already tested and passing). These have diverged. I was about to write
careful step-by-step git instructions for reconciling this — accounting
for the real possibility that a plain `git push` gets rejected as
non-fast-forward (since GitHub has commits the local repo doesn't), in
which case the safe resolution for a solo developer who wants their
tested local state to win is `git push --force` (with the risk of that
command clearly explained, not just the command itself).

**If you're picking this up and the user hasn't yet pushed:** that's the
very next thing to help with. Have them run `git status` and
`git remote -v` first to confirm what they're working with before
touching anything.

---

## Session 4: GitHub push confirmed + Phase 4 (real payments) — SSLCommerz

**GitHub is now confirmed synced** — the user's branch was already "up to
date with origin/main" (no divergence, no force-push needed), so a normal
`git add . && git commit && git push` resolved it cleanly. Not documenting
further here since it's simply done.

**Phase 4 decision:** user explicitly asked me to decide, given the goal
is "prove I can build business-handover-ready sites, then sell this to a
real client." Chose **SSLCommerz** over bKash-only (too narrow — a real
client wants cards too) or Stripe (not natively available to Bangladeshi
merchants; would need a foreign business entity, which contradicts "sell
to a local client"). SSLCommerz's sandbox also needs no business
verification, which matters for a portfolio piece that needs to be fully
demonstrable today.

### Important: this phase's code was mostly already written when I started

When I went to build Phase 4, I found a **substantial, already-complete
SSLCommerz integration** sitting in the project — `lib/sslcommerz.ts`,
five API route handlers (`init`/`success`/`fail`/`cancel`/`ipn`), a
rewritten checkout page, a new `payment-failed` page, schema changes, and
`.env.example` entries — none of which I had written in this session.

**This is the same unexplained-pre-existing-file pattern that showed up
twice earlier in this project** (once with a full `dineflow` folder at the
very start of the conversation, once with `prisma/schema.prisma` +
`lib/prisma.ts` right before Phase 1). Each time, the content has been
plain, inspectable application code — not something that could hide
instructions directed at me — so the right response isn't blind distrust,
but it isn't blind trust either. **What I did this time, since the stakes
are much higher (payment code, not boilerplate):** read every single file
in full before deciding whether to keep it, specifically checking for
security correctness (does it actually validate server-to-server before
trusting a payment succeeded? does it handle retries/idempotency
correctly?) rather than just checking it "looks reasonable."

**Verdict after full review: genuinely well-built.** Correct SSLCommerz
API v4 field names (matches my own training knowledge of their documented
contract), correct security posture (never trusts a redirect or webhook
body directly — always re-validates server-to-server via `val_id` before
marking anything paid), correct idempotency (checks `paymentStatus !==
"PAID"` before reprocessing, so the success-redirect and IPN webhook
racing each other can't double-process), correct reasoning for *why* both
a browser-redirect AND a server-to-server IPN webhook exist (redirect can
be interrupted; IPN is the reliable fallback). This is the same
architecture I was about to design from scratch.

**One real, serious bug found and fixed:** `app/api/orders/route.ts` was
still setting `paymentStatus: "PAID"` immediately for `card` orders at
creation time — leftover from the Phase 2 mock-payment logic
(`input.paymentMethod === "cash" ? "PENDING" : "PAID"`), never updated
when the real SSLCommerz flow was built around it. This is a serious bug,
not cosmetic: combined with the fail/cancel handlers' idempotency guard
(`if order.paymentStatus !== "PAID"`), an order would be marked paid
*before the customer ever paid*, and a subsequently failed or abandoned
payment could **never** be corrected back to `FAILED` — the system would
permanently show an unpaid order as paid. **Fixed**: every order now
starts `PENDING` regardless of payment method; only a validated
SSLCommerz confirmation (or COD collection) marks it paid.

**Minor fixes while reviewing:**
- Corrected a stale/inaccurate comment on `Order.paymentValId` in
  `prisma/schema.prisma` (it claimed `orderNumber` was reused directly as
  SSLCommerz's `tran_id`; the actual code derives a fresh per-attempt
  `tran_id` from it instead — the comment now matches the code).
- Wrote `docs/PHASE-4-PAYMENT-SETUP.md`, which `.env.example` already
  referenced but which didn't exist yet.
- Updated `TODO.md`'s Phase 4 section to reflect what's actually built
  vs. what the user still needs to do (sandbox signup, `db:push`, testing).

### ⚠️ Action required before this can be tested

1. **Sign up for a free SSLCommerz sandbox account** — full instructions
   in `docs/PHASE-4-PAYMENT-SETUP.md`. No business verification needed,
   takes a few minutes.
2. Add `SSLCOMMERZ_STORE_ID`, `SSLCOMMERZ_STORE_PASSWORD`, and
   `SSLCOMMERZ_IS_LIVE="false"` to both `.env` and `.env.local`.
3. `npm run db:push` — new field (`Order.paymentValId`).
4. `npm run dev`, place a test order with "Card / Mobile Banking"
   selected, complete a test payment using SSLCommerz's sandbox test
   credentials (shown on their own payment page).
5. Also deliberately test a failed/cancelled payment and the "Try Payment
   Again" retry flow.
6. Verify in Prisma Studio (`npm run db:studio`) that successful orders
   show `paymentStatus: PAID` with a `paymentValId` filled in, and
   failed/cancelled ones show `paymentStatus: FAILED`.
7. **⚠️ Explicitly flagged in `lib/sslcommerz.ts`'s own comments and in
   `TODO.md`:** this was written from training knowledge with no way to
   verify it against SSLCommerz's live docs in this sandbox. If the test
   payment doesn't redirect correctly or fields seem wrong, cross-check
   against https://developer.sslcommerz.com/doc/v4/ before assuming the
   user's setup is at fault.
8. Once working, `git add . && git commit && git push` (should be a
   clean push — no divergence exists as of this session).

### If you're a new Claude session picking this up from here

- Read the "If you're a new Claude session" section above (Session 2) —
  it still applies generally.
- **Specifically for Phase 4:** don't assume the SSLCommerz integration
  works just because it was reviewed and looks correct — "looks correct
  on read-through" and "actually works against SSLCommerz's real sandbox"
  are different claims, and only the user's test can confirm the latter.
  Ask for their test results, and if something's wrong, check the
  live API docs before editing `lib/sslcommerz.ts` blind.
- If Phase 4 is confirmed working, Phase 5 (image uploads via Supabase
  Storage) or Phase 6 (email notifications, already scoped in `TODO.md`)
  are the natural next steps — ask the user which they'd prefer, same as
  every other phase choice in this project so far.



---

## Session 5: Phase 5 — real image uploads (Supabase Storage)

**Starting point confirmed by the user:** Phase 4 (SSLCommerz payments) is
code-complete, tested, and pushed to both GitHub and Vercel. This session
picked up Phase 5 per `TODO.md`.

### What was built

- **`app/api/upload/route.ts`** — new admin-only API route. Accepts a
  single `multipart/form-data` file upload, validates it server-side
  (JPEG/PNG/WEBP only, 5MB max — never trusts the browser-side compression
  step alone, since that can be bypassed by calling this route directly),
  uploads it to a Supabase Storage bucket named `food-images`, and returns
  its public URL. Protected by the same `requireAdmin()` helper every other
  mutating route uses.
- **`lib/supabase-admin.ts`** — a new, separate Supabase client using the
  `SUPABASE_SERVICE_ROLE_KEY`, used only by the upload route (server-side
  only, never imported into anything client-facing). This is intentionally
  a second client from `lib/prisma.ts` — Prisma stays the source of truth
  for the Postgres tables; this one exists only for Storage, which Prisma
  doesn't cover.
- **`lib/image-client.ts`** — client-side image resize/compress helper
  using the browser's own `<canvas>` (no new npm dependency). Resizes to a
  max 1600px edge and re-encodes as JPEG before upload, so a 5-10MB phone
  photo typically becomes a few hundred KB.
- **`components/admin/ImageUploadField.tsx`** — new reusable component:
  file picker, live local preview while uploading, upload spinner, error
  state, "Remove photo" option. Replaces the old plain-text "Image URL"
  input.
- **Wired into `FoodFormModal.tsx` and `CategoryFormModal.tsx`** — the old
  paste-a-URL text field is gone; both now use `ImageUploadField`. No
  change to either modal's `onSubmit` shape — `form.image` is still just a
  string, so nothing downstream (the API routes, Prisma schema) needed to
  change.
- **Tightened `next.config.js`** — the wildcard `hostname: "**"` that
  Phase 2-4 needed (since admins could paste any image URL) is gone now
  that uploads go through this project's own Supabase Storage. Replaced
  with exactly two allowed hostnames: the Supabase project's storage
  domain (read dynamically from `NEXT_PUBLIC_SUPABASE_URL` at build time)
  and `images.unsplash.com` (so existing seeded placeholder photos that
  haven't been re-uploaded yet still display).
- **`docs/PHASE-5-IMAGE-UPLOADS-SETUP.md`** — the one manual step needed:
  create a `food-images` Storage bucket in the Supabase dashboard and mark
  it Public. Explains why that alone is enough (no RLS policies needed —
  reads are public by the bucket setting, writes go through the
  service-role key + `requireAdmin()`, not through browser-side RLS at
  all).

### No database schema changes

`Food.image` and `Category.image` were already plain nullable `String`
columns storing a URL — an uploaded photo's public URL fits the same
field. No `db:push` needed for this phase.

### Testing actually performed this session

- `tsc --noEmit` — passed, no type errors, across the whole project.
- `eslint` — passed, no warnings or errors, on every new/changed file.
- **NOT run:** `next build` (production build) or any real upload against
  Supabase Storage. This sandbox has no network access — it cannot reach
  Supabase, so neither a live upload nor a full `next build` (which
  touches the database at build time via `app/(customer)/page.tsx`) could
  be verified here. This matches `CLAUDE.md`'s instruction to say plainly
  when browser/Supabase testing isn't available rather than claim it
  passed.

### ⚠️ Action required before this can be tested

1. **Create the Storage bucket** — `docs/PHASE-5-IMAGE-UPLOADS-SETUP.md`,
   step 1. Two minutes, no code: Supabase dashboard → Storage → New bucket
   → name it `food-images` → toggle Public bucket ON.
2. No new environment variables, no `npm install`, no `db:push` needed —
   this phase only reuses what Phase 1 already set up
   (`SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SUPABASE_URL`) plus a
   dependency (`@supabase/supabase-js`) that was already installed.
3. `npm run dev`, log in as admin, go to `/admin/foods` → Add Food →
   **Upload photo** → pick a real image → confirm the preview updates and,
   after saving, the photo shows correctly on the public menu.
4. Also test editing a food/category that still has its old Unsplash
   placeholder — confirm it still displays before any new photo is
   uploaded (this checks the tightened `next.config.js` didn't break
   anything already on the site).
5. **Report back exactly what happens** — this is untested-by-a-real-
   browser code, same caveat as every other phase's handoff.
6. Once confirmed working: `git add . && git commit && git push`.

### If you're a new Claude session picking this up from here

- Read the Session 2 and Session 4 "If you're a new Claude session"
  sections above — they still apply generally (inspect before assuming,
  ask for real test results, don't claim untested code works).
- **Specifically for Phase 5:** if the user reports an upload error
  mentioning the bucket, that's almost always step 1 above not done yet
  (bucket missing, or created but not marked Public) — check that first
  before touching any code.
- Old photos are never deleted from Storage when replaced — this was a
  deliberate scope cut (see the note at the end of
  `docs/PHASE-5-IMAGE-UPLOADS-SETUP.md`), not a bug. Don't "fix" it without
  the user asking, since it adds real complexity for a problem that won't
  matter at this project's scale.
- Once Phase 5 is confirmed working end-to-end, Phase 6 (email
  notifications — order confirmation to customer, new-order alert to the
  restaurant) is next per `TODO.md`. Admin-side in-app live updates are
  already done (Session 3); Phase 6 is specifically about reaching people
  who don't have the app open.

---

## Session 6: Bug fix — login worked on localhost, failed (401) on live Vercel URL

**Symptom, reported with screenshots:** logging in on the live
`dineflow-restaurant-two.vercel.app` URL repeatedly returned
`POST /api/auth/callback/credentials 401` (visible in Vercel's own log
viewer), for the account `rirushVsilver@gmail.com` — while login worked
fine on `localhost:3000` (with a different account, `Sushmoy`, per the
screenshot).

### Root cause found by reading the code (not guessed)

`app/api/register/route.ts` normalizes the email with Zod
(`.trim().toLowerCase()`) before storing it — so every registered user's
email is saved lowercase in the database. But `lib/auth.ts`'s
`authorize()` function looked the user up with the **raw, un-normalized**
`credentials.email` straight from the login form. Postgres string
equality is case-sensitive by default, so a login typed with any
different casing than what was stored (e.g. a capital letter from
autocapitalize, a password manager's saved casing, or just how the user
originally typed it) would find **no matching user at all** — `authorize`
returns `null`, NextAuth reports that as `CredentialsSignin`, which is
exactly the 401 on `/api/auth/callback/credentials` seen in the logs.

This matches the reported symptom well: the login screenshot shows the
email typed as `rirushVsilver@gmail.com` (capital V) — if that account was
originally registered with a lowercase email (as registration always
forces), this exact login attempt would fail this way on any
environment, not just Vercel. It's very plausible this only surfaced on
Vercel because the account tested on localhost happened to be typed/saved
consistently, while this one wasn't.

**Fixed:** `lib/auth.ts` now normalizes the login email the same way
registration does (`.trim().toLowerCase()`) before the database lookup.

### ⚠️ This is a plausible, verified-in-code root cause — not yet confirmed as the actual fix by a real test

I don't have Supabase or Vercel access in this sandbox, so I could not
confirm directly that this specific account's stored email is lowercase,
nor run the live login flow myself. Per `CLAUDE.md`, treat this as "a real
bug found and fixed," not as "the live site is now confirmed working."

### If this fix alone doesn't resolve it

The next thing to check — since I can't see the Vercel dashboard — is
whether Vercel's **Project → Settings → Environment Variables** actually
match `.env.local`, specifically:
- `NEXTAUTH_URL` — must be the exact live URL
  (`https://dineflow-restaurant-two.vercel.app`), not `localhost`
- `NEXTAUTH_SECRET` — must be set (any mismatch/missing value breaks
  session/JWT signing)
- `DATABASE_URL` / `DIRECT_URL` — must point at the same Supabase project
  as local dev, or the account genuinely won't exist there

Since `GET /api/orders`, `/api/auth/session`, `/api/auth/csrf`, and
`/api/auth/providers` were all returning `200` in the logs, the database
connection and NextAuth's own routing are working on Vercel — that rules
out a totally broken deployment and points specifically at the
credentials check itself, which is what this fix addresses.

### Testing performed

- `tsc --noEmit` and `eslint` both pass clean on the changed file.
- **Not tested:** an actual login against the live or local app (no
  network/browser access in this sandbox).

### Next step

Push this fix, redeploy, and try logging in on the live URL again with
the account from the screenshot. If it still 401s, check the three env
vars above next — that's the other realistic cause given everything else
in the logs is healthy.

---

## Session 7: docs cleanup (README/ROADMAP/footer) + real analytics wiring

**Part 1 — stale docs.** `README.md` still described the project as a "frontend
prototype... no real database, authentication, payment gateway," left over from before
Phases 1-5 were built. Rewrote it to accurately describe the real Prisma/Postgres
backend, real NextAuth login, real SSLCommerz payments, and real Supabase Storage
uploads. Also fixed `ROADMAP.md`'s status table, which still marked Phases 1-3 as "Not
started" despite being done and live — would have directly contradicted the new README.
Fixed the live site's footer text (`components/layout/Footer.tsx`), which read "A
portfolio project — frontend prototype with mock data" on every single page.

**Part 2 — the thing the README's first draft flagged but didn't fix.** The admin
dashboard's charts (`app/admin/page.tsx`'s 7-day chart, `app/admin/analytics/page.tsx`'s
30-day chart + category performance + popular foods + average order value) were still
computed from `data/analytics.ts`'s hardcoded sample numbers, not real orders — even
though orders themselves had been real since Phase 2. Fixed properly instead of just
disclosing it in the README:

- **New `lib/analytics.ts`** — pure functions (`buildDailyStats`,
  `buildCategoryPerformance`, `buildPopularFoods`, `buildAverageOrderValue`) that derive
  all of this from the orders/foods/categories already loaded on the client via
  `OrderContext` / `CatalogContext`. No new API route needed — the admin pages already
  fetch the full order list for their other stat cards.
- `app/admin/page.tsx` — 7-day revenue/order charts now use `buildDailyStats(orders, 7)`
  instead of `data/analytics.ts`'s `last7DaysStats`.
- `app/admin/analytics/page.tsx` — rewritten to fetch orders (`loadAll()`, same pattern
  as the dashboard overview) and compute all four sections from real data instead of the
  mock import. Added empty states ("No paid orders yet") for category performance and
  popular foods, since a fresh install with zero paid orders would otherwise render
  nothing there — this is a real, expected state now, not a bug.
- `data/analytics.ts` is no longer imported anywhere in the running app; left in place
  (comment updated) purely as a content-shape reference, same as `data/orders.ts` /
  `data/payments.ts`. `README.md` updated to reflect this.

**A couple of real design decisions worth flagging, since they affect what the numbers
mean:**

- **Revenue counts only `paymentStatus: "paid"` orders; the order *count* includes every
  order regardless of payment status.** This matches the convention the dashboard's
  "Today's Revenue" / "Today's Orders" stat cards already used before this session — I
  kept it consistent rather than picking a different rule for the new charts.
- **Day buckets use the browser's local calendar day**, matching `isToday()` in
  `app/admin/page.tsx` — not UTC. An order placed at 11:58pm and one at 12:02am the same
  local night land in different buckets, which is what an admin actually expects to see.
- **Category Performance groups a food's revenue under "Other" if the food has since
  been deleted** (its `categoryId` no longer resolves) — the revenue isn't dropped, it's
  just no longer attributable to a specific category.
- **Popular Foods uses the name stored on the order line item**, not a live lookup
  against the current food list — so a renamed or deleted food still shows correctly as
  what was actually sold at the time, rather than "undefined" or today's (possibly
  different) name.

### Testing performed

- `tsc --noEmit` — passed, no errors, whole project.
- `eslint` — passed clean on every changed/new file.
- **Not tested:** an actual browser render of either admin page, or real order data
  flowing through these functions end-to-end (no network/browser access in this
  sandbox). The logic itself is straightforward aggregation with no external I/O, but
  "compiles and lints" is not the same claim as "renders correctly with real orders" —
  please check both `/admin` and `/admin/analytics` after deploying, especially: (a) the
  charts on a fresh/low-order-volume store (should show mostly-empty charts and the "No
  paid orders yet" empty states, not crash), and (b) a store with a mix of paid/pending/
  failed orders (verify order counts vs revenue behave as described above).

### If you're a new Claude session picking this up from here

- `lib/analytics.ts` is now the single source of truth for admin analytics — if a future
  phase adds e.g. a "this week vs last week" comparison or a CSV export, extend the
  functions there rather than recomputing similar logic inline in a page component
  again.
- Real order history only goes back as far as this project's actual usage — a brand new
  deploy will show flat/empty charts until real orders start coming in. That's correct
  behavior, not a bug to "fix" by seeding fake historical orders.
